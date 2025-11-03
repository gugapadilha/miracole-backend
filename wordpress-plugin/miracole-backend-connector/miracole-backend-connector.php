<?php
/*
Plugin Name: MiraCole Backend Connector
Description: Connects WordPress to the MiraCole backend API on Render. Handles PMPro integration and API communication.
Version: 1.0.0
Author: MiraCole+
*/

if (!defined('ABSPATH')) {
    exit;
}

// Plugin configuration
class MiraCole_Backend_Connector {
    
    private $backend_url;
    private $api_key;
    
    public function __construct() {
        // Get backend URL from constant or environment variable
        $this->backend_url = defined('MIRACOLE_BACKEND_URL') 
            ? MIRACOLE_BACKEND_URL 
            : (getenv('MIRACOLE_BACKEND_URL') ?: 'https://miracole-backend.onrender.com');
        
        // Get API key from constant or environment variable
        $this->api_key = defined('MIRACOLE_API_KEY') 
            ? MIRACOLE_API_KEY 
            : (getenv('MIRACOLE_API_KEY') ?: 'miracole_secret_key_123');
        
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Add settings page
        add_action('admin_init', array($this, 'register_settings'));
        
        // REST API endpoint to sync with backend
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Hook into PMPro membership changes (with lower priority to avoid conflicts)
        add_action('pmpro_after_change_membership_level', array($this, 'sync_membership_to_backend'), 20, 3);
        
        // Async sync handler
        add_action('miracole_async_sync', array($this, 'handle_async_sync'), 10, 3);
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'MiraCole Backend Settings',
            'MiraCole Backend',
            'manage_options',
            'miracole-backend',
            array($this, 'settings_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('miracole_backend_settings', 'miracole_backend_url');
        register_setting('miracole_backend_settings', 'miracole_api_key');
    }
    
    /**
     * Settings page
     */
    public function settings_page() {
        // Get settings
        $backend_url = get_option('miracole_backend_url', $this->backend_url);
        $api_key = get_option('miracole_api_key', $this->api_key);
        
        // Handle form submission
        if (isset($_POST['miracole_backend_save'])) {
            check_admin_referer('miracole_backend_settings');
            update_option('miracole_backend_url', sanitize_text_field($_POST['miracole_backend_url']));
            update_option('miracole_api_key', sanitize_text_field($_POST['miracole_api_key']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
            $backend_url = get_option('miracole_backend_url');
            $api_key = get_option('miracole_api_key');
        }
        
        // Test connection
        $test_result = null;
        if (isset($_POST['miracole_backend_test'])) {
            check_admin_referer('miracole_backend_settings');
            $test_result = $this->test_connection($backend_url, $api_key);
        }
        
        ?>
        <div class="wrap">
            <h1>MiraCole Backend Connector Settings</h1>
            
            <form method="post" action="">
                <?php wp_nonce_field('miracole_backend_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="miracole_backend_url">Backend URL</label>
                        </th>
                        <td>
                            <input type="text" 
                                   id="miracole_backend_url" 
                                   name="miracole_backend_url" 
                                   value="<?php echo esc_attr($backend_url); ?>" 
                                   class="regular-text" 
                                   placeholder="https://miracole-backend.onrender.com" />
                            <p class="description">The base URL of your backend API on Render.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="miracole_api_key">API Key</label>
                        </th>
                        <td>
                            <input type="text" 
                                   id="miracole_api_key" 
                                   name="miracole_api_key" 
                                   value="<?php echo esc_attr($api_key); ?>" 
                                   class="regular-text" 
                                   placeholder="miracole_secret_key_123" />
                            <p class="description">The API key configured in your backend WP_API_KEY environment variable.</p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Save Settings', 'primary', 'miracole_backend_save'); ?>
                <?php submit_button('Test Connection', 'secondary', 'miracole_backend_test'); ?>
            </form>
            
            <?php if ($test_result !== null): ?>
                <div class="notice <?php echo $test_result['success'] ? 'notice-success' : 'notice-error'; ?>">
                    <p><strong><?php echo $test_result['success'] ? '✅ Connection Successful!' : '❌ Connection Failed'; ?></strong></p>
                    <?php if (isset($test_result['message'])): ?>
                        <p><?php echo esc_html($test_result['message']); ?></p>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
            
            <hr>
            
            <h2>Current Configuration</h2>
            <table class="widefat">
                <tr>
                    <th>Backend URL:</th>
                    <td><code><?php echo esc_html($backend_url); ?></code></td>
                </tr>
                <tr>
                    <th>API Key:</th>
                    <td><code><?php echo esc_html(substr($api_key, 0, 20)) . '...'; ?></code></td>
                </tr>
                <tr>
                    <th>Health Check:</th>
                    <td><a href="<?php echo esc_url($backend_url . '/health'); ?>" target="_blank"><?php echo esc_url($backend_url . '/health'); ?></a></td>
                </tr>
                <tr>
                    <th>Plans Endpoint:</th>
                    <td><a href="<?php echo esc_url($backend_url . '/api/plans'); ?>" target="_blank"><?php echo esc_url($backend_url . '/api/plans'); ?></a></td>
                </tr>
            </table>
        </div>
        <?php
    }
    
    /**
     * Test connection to backend (optimized with shorter timeout)
     */
    private function test_connection($url, $key) {
        $response = wp_remote_get($url . '/health', array(
            'timeout' => 5, // Reduced from 10 to 5 seconds
            'headers' => array(
                'Authorization' => 'Bearer ' . $key,
                'X-API-KEY' => $key // Also send as X-API-KEY for compatibility
            )
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'message' => 'Error: ' . $response->get_error_message()
            );
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        if ($status_code === 200) {
            return array(
                'success' => true,
                'message' => 'Backend is reachable. Status: ' . $status_code
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Backend returned status code: ' . $status_code . '. Response: ' . substr($body, 0, 200)
            );
        }
    }
    
    /**
     * Send request to backend (optimized with shorter timeout and retry limit)
     */
    public function send_to_backend($endpoint, $method = 'GET', $data = null, $retry_count = 0) {
        $backend_url = get_option('miracole_backend_url', $this->backend_url);
        $api_key = get_option('miracole_api_key', $this->api_key);
        
        $url = rtrim($backend_url, '/') . '/' . ltrim($endpoint, '/');
        
        // Create cache key to prevent duplicate requests
        $cache_key = 'miracole_request_' . md5($url . $method . serialize($data));
        
        // Check if same request was made recently (within 5 seconds)
        $last_request = get_transient($cache_key);
        if ($last_request && (time() - $last_request) < 5) {
            error_log('[WP_SYNC] Duplicate request prevented - ' . $endpoint);
            return false;
        }
        
        // Set transient to prevent duplicate requests
        set_transient($cache_key, time(), 10);
        
        $args = array(
            'method' => $method,
            'timeout' => 5, // Reduced from 15 to 5 seconds
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $api_key,
                'X-API-KEY' => $api_key // Also send as X-API-KEY for compatibility
            ),
            'blocking' => true, // Keep blocking but with shorter timeout
        );
        
        if ($data !== null) {
            $args['body'] = json_encode($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            error_log('MiraCole Backend Error: ' . $error_message);
            
            // Retry once if timeout and haven't retried yet (without blocking sleep)
            if ($retry_count < 1 && strpos($error_message, 'timeout') !== false) {
                error_log('[WP_SYNC] Retrying request after timeout - Attempt ' . ($retry_count + 1));
                // Immediate retry - cache will prevent true duplicates
                return $this->send_to_backend($endpoint, $method, $data, $retry_count + 1);
            }
            
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $status = wp_remote_retrieve_response_code($response);
        
        // Clear transient on success
        delete_transient($cache_key);
        
        return array(
            'status' => $status,
            'body' => json_decode($body, true)
        );
    }
    
    /**
     * Sync membership changes to backend (optimized with async scheduling)
     */
    public function sync_membership_to_backend($level_id, $user_id, $old_level_id) {
        // Prevent duplicate syncs for the same user/level combination
        $sync_key = 'miracole_sync_' . $user_id . '_' . $level_id . '_' . $old_level_id;
        $last_sync = get_transient($sync_key);
        
        if ($last_sync && (time() - $last_sync) < 60) {
            error_log('[WP_SYNC] Duplicate sync prevented for User ID: ' . $user_id);
            return;
        }
        
        // Mark sync as in progress
        set_transient($sync_key, time(), 300); // 5 minutes
        
        // Schedule async processing to avoid blocking page load
        // Use wp_schedule_single_event if available, otherwise process immediately
        if (function_exists('wp_schedule_single_event')) {
            wp_schedule_single_event(time() + 2, 'miracole_async_sync', array($level_id, $user_id, $old_level_id));
        } else {
            // Fallback: process immediately but in a non-blocking way
            $this->process_sync($level_id, $user_id, $old_level_id);
        }
    }
    
    /**
     * Process membership sync (called async or immediately)
     */
    private function process_sync($level_id, $user_id, $old_level_id) {
        // Get user data
        $user = get_userdata($user_id);
        if (!$user) {
            return;
        }
        
        // Get level information with caching
        $cache_key = 'pmpro_level_' . $level_id;
        $level = get_transient($cache_key);
        
        if ($level === false) {
            $level = pmpro_getLevel($level_id);
            set_transient($cache_key, $level, 3600); // Cache for 1 hour
        }
        
        // Prepare data to send
        $data = array(
            'user_id' => $user_id,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'level_id' => $level_id,
            'level_name' => $level ? $level->name : '',
            'old_level_id' => $old_level_id,
            'action' => 'membership_change'
        );
        
        // Send to backend webhook endpoint
        $result = $this->send_to_backend('/api/members/sync', 'POST', $data);
        
        if ($result && $result['status'] === 200) {
            error_log('[WP_SYNC] Successfully synced membership to backend - User ID: ' . $user_id . ', Level: ' . $level_id);
        } else {
            $error_msg = isset($result['body']['message']) ? $result['body']['message'] : 'Unknown error';
            $status = isset($result['status']) ? $result['status'] : 'N/A';
            error_log('[WP_SYNC] Failed to sync membership to backend - User ID: ' . $user_id . ', Status: ' . $status . ', Error: ' . $error_msg);
        }
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        register_rest_route('miracole/v1', '/sync', array(
            'methods' => 'POST',
            'callback' => array($this, 'sync_to_backend'),
            'permission_callback' => function() {
                return current_user_can('manage_options');
            }
        ));
    }
    
    /**
     * Handle async sync (called by wp_schedule_single_event)
     */
    public function handle_async_sync($level_id, $user_id, $old_level_id) {
        $this->process_sync($level_id, $user_id, $old_level_id);
    }
    
    /**
     * Sync data to backend
     */
    public function sync_to_backend($request) {
        $data = $request->get_json_params();
        
        // Send data to backend
        $result = $this->send_to_backend('/api/sync', 'POST', $data);
        
        if ($result && $result['status'] === 200) {
            return new WP_REST_Response(array('success' => true), 200);
        } else {
            return new WP_Error('sync_failed', 'Failed to sync with backend', array('status' => 500));
        }
    }
}

// Initialize plugin
new MiraCole_Backend_Connector();

// Helper function to send requests to backend from other plugins/themes
function miracole_send_to_backend($endpoint, $method = 'GET', $data = null) {
    $connector = new MiraCole_Backend_Connector();
    return $connector->send_to_backend($endpoint, $method, $data);
}

