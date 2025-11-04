<?php
/**
 * Plugin Name: MiraCole REST Monitor
 * Description: Verifica rotas REST do PMPro e adiciona fallback se necessário. Exibe logs no console e error_log.
 * Version: 1.1.1
 * Author: MiraCole+ DevOps
 */

if (!defined('ABSPATH')) {
    exit;
}

// Prevent this plugin from running on the frontend (performance fix)
if (!is_admin() && !defined('REST_REQUEST')) {
    return;
}

class MiraCole_REST_Monitor {
    
    private $cache_key = 'miracole_rest_check_cache';
    private $cache_ttl = 3600; // 1 hour (reduced from 5 minutes to minimize checks)
    
    public function __construct() {
        // Register fallback route immediately (lightweight, no DB checks)
        add_action('rest_api_init', array($this, 'register_fallback_route'), 10);
        
        // Only check routes status on admin page loads (not on every REST request)
        add_action('admin_init', array($this, 'check_routes_status'), 10);
        
        // Add admin notice
        add_action('admin_notices', array($this, 'admin_notice'));
        
        // Log to console in admin (only on admin pages)
        add_action('admin_footer', array($this, 'admin_console_log'));
    }
    
    /**
     * Register fallback route immediately (lightweight check only)
     */
    public function register_fallback_route() {
        // Lightweight check - only register if route doesn't exist
        // This is called on REST init but uses minimal resources
        $routes = rest_get_server()->get_routes();
        $route_exists = false;
        
        // Quick check for PMPro route
        foreach ($routes as $route => $handlers) {
            if (strpos($route, 'pmpro/v1/levels') !== false) {
                $route_exists = true;
                break; // Exit early once found
            }
        }
        
        // Only register if route doesn't exist (one-time operation)
        if (!$route_exists) {
            register_rest_route('pmpro/v1', '/levels', array(
                'methods' => 'GET',
                'callback' => array($this, 'pmpro_levels_fallback'),
                'permission_callback' => '__return_true'
            ));
            
            // Only log once per hour to reduce error_log noise
            $log_key = 'miracole_rest_fallback_logged';
            if (!get_transient($log_key)) {
                error_log('[MiraCole REST Monitor] Fallback route /pmpro/v1/levels registered');
                set_transient($log_key, true, 3600); // Log once per hour
            }
        }
    }
    
    /**
     * Check routes status (only called on admin page loads, not on every REST request)
     */
    public function check_routes_status() {
        // Check cache first - return early if recent check exists
        $cached = get_transient($this->cache_key);
        if ($cached && (time() - $cached['timestamp']) < $this->cache_ttl) {
            return; // Use cached result
        }
        
        // Check routes directly from REST server (no HTTP request)
        $routes = rest_get_server()->get_routes();
        $found_routes = array();
        
        // Check if PMPro route exists
        foreach ($routes as $route => $handlers) {
            if (strpos($route, 'pmpro/v1/levels') !== false) {
                $found_routes[] = 'pmpro/v1/levels';
                break; // Exit early once found
            }
        }
        
        // Store results in cache (1 hour TTL)
        set_transient($this->cache_key, array(
            'found' => $found_routes,
            'timestamp' => time()
        ), $this->cache_ttl);
        
        // Only log summary once per hour
        if (empty($found_routes)) {
            error_log('[MiraCole REST Monitor] PMPro route not found, using fallback');
        } else {
            error_log('[MiraCole REST Monitor] Route check complete - PMPro route found');
        }
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
