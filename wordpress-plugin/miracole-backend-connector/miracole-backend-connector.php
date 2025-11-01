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
        
        // Hook into PMPro membership changes
        add_action('pmpro_after_change_membership_level', array($this, 'sync_membership_to_backend'), 10, 3);
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
     * Test connection to backend
     */
    private function test_connection($url, $key) {
        $response = wp_remote_get($url . '/health', array(
            'timeout' => 10,
            'headers' => array(
                'Authorization' => 'Bearer ' . $key
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
     * Send request to backend
     */
    public function send_to_backend($endpoint, $method = 'GET', $data = null) {
        $backend_url = get_option('miracole_backend_url', $this->backend_url);
        $api_key = get_option('miracole_api_key', $this->api_key);
        
        $url = rtrim($backend_url, '/') . '/' . ltrim($endpoint, '/');
        
        $args = array(
            'method' => $method,
            'timeout' => 15,
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $api_key
            )
        );
        
        if ($data !== null) {
            $args['body'] = json_encode($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            error_log('MiraCole Backend Error: ' . $response->get_error_message());
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $status = wp_remote_retrieve_response_code($response);
        
        return array(
            'status' => $status,
            'body' => json_decode($body, true)
        );
    }
    
    /**
     * Sync membership changes to backend
     */
    public function sync_membership_to_backend($level_id, $user_id, $old_level_id) {
        // Get user data
        $user = get_userdata($user_id);
        if (!$user) {
            return;
        }
        
        // Get level information
        $level = pmpro_getLevel($level_id);
        
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
            error_log('[WP_SYNC] Failed to sync membership to backend - User ID: ' . $user_id . ', Error: ' . $error_msg);
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

