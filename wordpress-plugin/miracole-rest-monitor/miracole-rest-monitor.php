<?php
/**
 * Plugin Name: MiraCole REST Monitor
 * Description: Verifica rotas REST do PMPro e adiciona fallback se necessário. Exibe logs no console e error_log.
 * Version: 1.0.0
 * Author: MiraCole+ DevOps
 */

if (!defined('ABSPATH')) {
    exit;
}

class MiraCole_REST_Monitor {
    
    private $cache_key = 'miracole_rest_check_cache';
    private $cache_ttl = 300; // 5 minutes
    
    public function __construct() {
        // Run checks on REST API init
        add_action('rest_api_init', array($this, 'check_routes'), 5);
        
        // Add admin notice
        add_action('admin_notices', array($this, 'admin_notice'));
        
        // Log to console in admin
        add_action('admin_footer', array($this, 'admin_console_log'));
    }
    
    /**
     * Check REST routes and create fallback if needed
     */
    public function check_routes() {
        // Check cache to avoid repeated checks
        $cached = get_transient($this->cache_key);
        if ($cached) {
            return;
        }
        
        // Routes to check
        $routes_to_check = array(
            'pmpro/v1/levels',
            'miracole/v1/levels'
        );
        
        $found_routes = array();
        
        foreach ($routes_to_check as $route) {
            $url = home_url('/wp-json/' . $route);
            
            $response = wp_remote_get($url, array(
                'timeout' => 3,
                'sslverify' => false // Allow self-signed certs in dev
            ));
            
            if (is_wp_error($response)) {
                error_log('[MiraCole REST Monitor] Error checking route ' . $route . ': ' . $response->get_error_message());
                continue;
            }
            
            $body = wp_remote_retrieve_body($response);
            $status_code = wp_remote_retrieve_response_code($response);
            
            // Check if route exists (not 404)
            if ($status_code === 200 && strpos($body, 'rest_no_route') === false && !empty($body)) {
                $found_routes[] = $route;
                error_log('[MiraCole REST Monitor] ✅ Route found: /wp-json/' . $route);
            } else {
                error_log('[MiraCole REST Monitor] ❌ Route not found: /wp-json/' . $route . ' (Status: ' . $status_code . ')');
            }
        }
        
        // If PMPro route doesn't exist, create fallback
        if (!in_array('pmpro/v1/levels', $found_routes)) {
            $this->create_pmpro_fallback();
        }
        
        // Store results in cache
        set_transient($this->cache_key, array(
            'found' => $found_routes,
            'timestamp' => time()
        ), $this->cache_ttl);
        
        // Log summary
        error_log('[MiraCole REST Monitor] Summary - Found routes: ' . implode(', ', $found_routes ?: array('none')));
    }
    
    /**
     * Create fallback route for PMPro levels
     */
    private function create_pmpro_fallback() {
        // Check if route already registered (double-check)
        $routes = rest_get_server()->get_routes();
        if (isset($routes['/pmpro/v1/levels'])) {
            error_log('[MiraCole REST Monitor] PMPro route already exists, skipping fallback');
            return;
        }
        
        // Register fallback route
        register_rest_route('pmpro/v1', '/levels', array(
            'methods' => 'GET',
            'callback' => array($this, 'pmpro_levels_fallback'),
            'permission_callback' => '__return_true'
        ));
        
        error_log('[MiraCole REST Monitor] ✅ Fallback route /pmpro/v1/levels created successfully');
    }
    
    /**
     * Fallback callback for PMPro levels
     */
    public function pmpro_levels_fallback($request) {
        // Try to use PMPro function if available
        if (function_exists('pmpro_getAllLevels')) {
            $levels = pmpro_getAllLevels(false, true);
            if ($levels) {
                // Normalize response format
                $normalized = array();
                foreach ($levels as $level) {
                    $normalized[] = array(
                        'id' => isset($level->id) ? $level->id : (isset($level->ID) ? $level->ID : null),
                        'level_id' => isset($level->id) ? $level->id : (isset($level->ID) ? $level->ID : null),
                        'name' => isset($level->name) ? $level->name : '',
                        'initial_payment' => isset($level->initial_payment) ? floatval($level->initial_payment) : 0,
                        'billing_amount' => isset($level->billing_amount) ? floatval($level->billing_amount) : 0,
                        'cycle_number' => isset($level->cycle_number) ? intval($level->cycle_number) : 0,
                        'cycle_period' => isset($level->cycle_period) ? $level->cycle_period : null,
                        'billing_limit' => isset($level->billing_limit) ? intval($level->billing_limit) : 0,
                        'trial_amount' => isset($level->trial_amount) ? floatval($level->trial_amount) : 0,
                        'trial_limit' => isset($level->trial_limit) ? intval($level->trial_limit) : 0
                    );
                }
                return rest_ensure_response($normalized);
            }
        }
        
        // Fallback to static levels if PMPro function not available
        error_log('[MiraCole REST Monitor] ⚠️ PMPro function not available, returning static fallback levels');
        
        $static_levels = array(
            array(
                'id' => 2,
                'level_id' => 2,
                'name' => 'Monthly',
                'initial_payment' => 0,
                'billing_amount' => 0,
                'cycle_number' => 1,
                'cycle_period' => 'Month',
                'billing_limit' => 0,
                'trial_amount' => 0,
                'trial_limit' => 0
            ),
            array(
                'id' => 3,
                'level_id' => 3,
                'name' => 'Yearly',
                'initial_payment' => 0,
                'billing_amount' => 0,
                'cycle_number' => 1,
                'cycle_period' => 'Year',
                'billing_limit' => 0,
                'trial_amount' => 0,
                'trial_limit' => 0
            ),
            array(
                'id' => 7,
                'level_id' => 7,
                'name' => 'Early Explorer',
                'initial_payment' => 0,
                'billing_amount' => 0,
                'cycle_number' => 0,
                'cycle_period' => null,
                'billing_limit' => 0,
                'trial_amount' => 0,
                'trial_limit' => 0
            ),
            array(
                'id' => 8,
                'level_id' => 8,
                'name' => 'Early Adopter',
                'initial_payment' => 0,
                'billing_amount' => 0,
                'cycle_number' => 0,
                'cycle_period' => null,
                'billing_limit' => 0,
                'trial_amount' => 0,
                'trial_limit' => 0
            ),
            array(
                'id' => 9,
                'level_id' => 9,
                'name' => 'Lifetime',
                'initial_payment' => 0,
                'billing_amount' => 0,
                'cycle_number' => 0,
                'cycle_period' => null,
                'billing_limit' => 0,
                'trial_amount' => 0,
                'trial_limit' => 0
            )
        );
        
        return rest_ensure_response($static_levels);
    }
    
    /**
     * Show admin notice
     */
    public function admin_notice() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        $cache = get_transient($this->cache_key);
        if (!$cache) {
            return;
        }
        
        $found = isset($cache['found']) ? $cache['found'] : array();
        $has_pmpro = in_array('pmpro/v1/levels', $found);
        
        $class = $has_pmpro ? 'notice notice-success' : 'notice notice-warning';
        $message = $has_pmpro 
            ? '✅ PMPro REST route detected. MiraCole REST Monitor is active.'
            : '⚠️ PMPro REST route not found. Fallback route created.';
        
        echo '<div class="' . esc_attr($class) . '"><p>' . esc_html($message) . '</p></div>';
    }
    
    /**
     * Log to browser console
     */
    public function admin_console_log() {
        $cache = get_transient($this->cache_key);
        if (!$cache) {
            return;
        }
        
        $found = isset($cache['found']) ? $cache['found'] : array();
        $timestamp = isset($cache['timestamp']) ? $cache['timestamp'] : time();
        
        $log_data = array(
            'plugin' => 'MiraCole REST Monitor',
            'status' => 'active',
            'found_routes' => $found,
            'cache_timestamp' => date('Y-m-d H:i:s', $timestamp),
            'pmpro_available' => in_array('pmpro/v1/levels', $found)
        );
        
        echo '<script>console.log(' . json_encode($log_data) . ');</script>';
    }
}

// Initialize plugin
new MiraCole_REST_Monitor();
