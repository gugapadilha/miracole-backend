<?php
/**
 * Plugin Name: MiraCole REST Monitor
 * Description: Verifica rotas REST do PMPro e adiciona fallback se necessário. Exibe logs no console e error_log.
 * Version: 1.2.1
 * Author: MiraCole+ DevOps
 */

if (!defined('ABSPATH')) {
    exit;
}

// Prevent loading outside of admin or REST calls (performance fix)
if (!defined('REST_REQUEST') && !is_admin()) {
    return;
}

// Lazy load - only initialize when needed
add_action('plugins_loaded', function () {
    // Safety check
    if (!class_exists('WP_REST_Controller')) {
        return;
    }

    // Register REST route only on REST API calls
    add_action('rest_api_init', function () {
        // Register ping endpoint for testing
        register_rest_route('miracole/v1', '/ping', [
            'methods' => 'GET',
            'callback' => function () {
                return ['status' => 'ok'];
            },
            'permission_callback' => '__return_true'
        ]);

        $routes = rest_get_server()->get_routes();
        $route_exists = false;

        // Quick check for PMPro route
        foreach ($routes as $route => $handlers) {
            if (strpos($route, 'pmpro/v1/levels') !== false) {
                $route_exists = true;
                break;
            }
        }

        // Only register fallback if route doesn't exist
        if (!$route_exists) {
            register_rest_route('pmpro/v1', '/levels', [
                'methods' => 'GET',
                'callback' => function ($request) {
                    // Try to use PMPro function if available
                    if (function_exists('pmpro_getAllLevels')) {
                        $levels = pmpro_getAllLevels(false, true);
                        if ($levels) {
                            $normalized = [];
                            foreach ($levels as $level) {
                                $normalized[] = [
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
                                ];
                            }
                            return rest_ensure_response($normalized);
                        }
                    }

                    // Fallback to static levels if PMPro function not available
                    $static_levels = [
                        [
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
                        ],
                        [
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
                        ],
                        [
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
                        ],
                        [
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
                        ],
                        [
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
                        ]
                    ];

                    return rest_ensure_response($static_levels);
                },
                'permission_callback' => '__return_true'
            ]);
        }
    }, 10);

    // Admin-only features (notifications, logging, etc.)
    if (is_admin()) {
        add_action('admin_init', function () {
            // Only check routes status on admin page loads
            $cache_key = 'miracole_rest_check_cache';
            $cache_ttl = 3600; // 1 hour

            $cached = get_transient($cache_key);
            if ($cached && (time() - $cached['timestamp']) < $cache_ttl) {
                return;
            }

            $routes = rest_get_server()->get_routes();
            $found_routes = [];

            foreach ($routes as $route => $handlers) {
                if (strpos($route, 'pmpro/v1/levels') !== false) {
                    $found_routes[] = 'pmpro/v1/levels';
                    break;
                }
            }

            set_transient($cache_key, [
                'found' => $found_routes,
                'timestamp' => time()
            ], $cache_ttl);
        });

        // Admin notice
        add_action('admin_notices', function () {
            if (!current_user_can('manage_options')) {
                return;
            }

            $cache = get_transient('miracole_rest_check_cache');
            if (!$cache) {
                return;
            }

            $found = isset($cache['found']) ? $cache['found'] : [];
            $has_pmpro = in_array('pmpro/v1/levels', $found);

            $class = $has_pmpro ? 'notice notice-success' : 'notice notice-warning';
            $message = $has_pmpro
                ? '✅ PMPro REST route detected. MiraCole REST Monitor is active.'
                : '⚠️ PMPro REST route not found. Fallback route created.';

            echo '<div class="' . esc_attr($class) . '"><p>' . esc_html($message) . '</p></div>';
        });

        // Console log (admin only)
        add_action('admin_footer', function () {
            $cache = get_transient('miracole_rest_check_cache');
            if (!$cache) {
                return;
            }

            $found = isset($cache['found']) ? $cache['found'] : [];
            $timestamp = isset($cache['timestamp']) ? $cache['timestamp'] : time();

            $log_data = [
                'plugin' => 'MiraCole REST Monitor',
                'status' => 'active',
                'found_routes' => $found,
                'cache_timestamp' => date('Y-m-d H:i:s', $timestamp),
                'pmpro_available' => in_array('pmpro/v1/levels', $found)
            ];

            echo '<script>console.log(' . json_encode($log_data) . ');</script>';
        });
    }
}, 10);
