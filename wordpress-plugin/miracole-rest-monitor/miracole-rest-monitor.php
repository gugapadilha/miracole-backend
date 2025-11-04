<?php
/**
 * Plugin Name: MiraCole REST Monitor
 * Description: Monitora as rotas REST do PMPro e cria fallback automático se necessário. Loga no console e no error_log.
 * Version: 1.1.0
 * Author: MiraCole+ DevOps
 */

if (!defined('ABSPATH')) {
    exit;
}

class MiraCole_REST_Monitor {

    private $cache_key = 'miracole_rest_check_cache';
    private $cache_ttl = 300; // 5 minutos

    public function __construct() {
        // Hook principal — garante que a verificação ocorra logo após o carregamento das rotas
        add_action('rest_api_init', array($this, 'maybe_check_routes'), 20);

        // Avisos no painel
        add_action('admin_notices', array($this, 'admin_notice'));

        // Log no console do navegador
        add_action('admin_footer', array($this, 'admin_console_log'));
    }

    /**
     * Executa a checagem apenas se não estiver em cache
     */
    public function maybe_check_routes() {
        $cached = get_transient($this->cache_key);
        if ($cached) {
            return;
        }
        $this->check_routes();
    }

    /**
     * Verifica as rotas REST e cria fallback se necessário
     */
    public function check_routes() {
        $routes_to_check = array(
            'pmpro/v1/levels',
            'miracole/v1/levels'
        );

        $found_routes = array();

        foreach ($routes_to_check as $route) {
            $url = home_url('/wp-json/' . $route);
            $response = wp_remote_get($url, array(
                'timeout' => 5,
                'sslverify' => false
            ));

            if (is_wp_error($response)) {
                error_log('[MiraCole REST Monitor] Error checking ' . $route . ': ' . $response->get_error_message());
                continue;
            }

            $status_code = wp_remote_retrieve_response_code($response);
            $body = wp_remote_retrieve_body($response);

            if ($status_code === 200 && strpos($body, 'rest_no_route') === false && !empty($body)) {
                $found_routes[] = $route;
                error_log('[MiraCole REST Monitor] ✅ Route found: /wp-json/' . $route);
            } else {
                error_log('[MiraCole REST Monitor] ❌ Missing: /wp-json/' . $route . ' (HTTP ' . $status_code . ')');
            }
        }

        if (!in_array('pmpro/v1/levels', $found_routes)) {
            $this->create_pmpro_fallback();
        }

        set_transient($this->cache_key, array(
            'found' => $found_routes,
            'timestamp' => time()
        ), $this->cache_ttl);

        error_log('[MiraCole REST Monitor] Summary: ' . implode(', ', $found_routes ?: array('none')));
    }

    /**
     * Cria rota fallback se a rota do PMPro não existir
     */
    private function create_pmpro_fallback() {
        $routes = rest_get_server()->get_routes();
        if (isset($routes['/pmpro/v1/levels'])) {
            error_log('[MiraCole REST Monitor] PMPro route already exists, skipping fallback');
            return;
        }

        register_rest_route('pmpro/v1', '/levels', array(
            'methods' => 'GET',
            'callback' => array($this, 'pmpro_levels_fallback'),
            'permission_callback' => '__return_true',
        ));

        error_log('[MiraCole REST Monitor] ⚡ Fallback route /pmpro/v1/levels registered successfully');
    }

    /**
     * Callback da rota fallback
     */
    public function pmpro_levels_fallback($request) {
        if (function_exists('pmpro_getAllLevels')) {
            $levels = pmpro_getAllLevels(false, true);
            if ($levels) {
                $normalized = array_map(function ($level) {
                    return array(
                        'id' => $level->id ?? ($level->ID ?? null),
                        'level_id' => $level->id ?? ($level->ID ?? null),
                        'name' => $level->name ?? '',
                        'initial_payment' => floatval($level->initial_payment ?? 0),
                        'billing_amount' => floatval($level->billing_amount ?? 0),
                        'cycle_number' => intval($level->cycle_number ?? 0),
                        'cycle_period' => $level->cycle_period ?? null,
                        'billing_limit' => intval($level->billing_limit ?? 0),
                        'trial_amount' => floatval($level->trial_amount ?? 0),
                        'trial_limit' => intval($level->trial_limit ?? 0)
                    );
                }, $levels);
                return rest_ensure_response($normalized);
            }
        }

        error_log('[MiraCole REST Monitor] ⚠️ PMPro function not available, serving static fallback levels');
        return rest_ensure_response($this->get_static_fallback_levels());
    }

    /**
     * Dados estáticos fallback
     */
    private function get_static_fallback_levels() {
        return array(
            array('id' => 2, 'level_id' => 2, 'name' => 'Monthly', 'initial_payment' => 0, 'billing_amount' => 0, 'cycle_number' => 1, 'cycle_period' => 'Month', 'billing_limit' => 0, 'trial_amount' => 0, 'trial_limit' => 0),
            array('id' => 3, 'level_id' => 3, 'name' => 'Yearly', 'initial_payment' => 0, 'billing_amount' => 0, 'cycle_number' => 1, 'cycle_period' => 'Year', 'billing_limit' => 0, 'trial_amount' => 0, 'trial_limit' => 0),
            array('id' => 7, 'level_id' => 7, 'name' => 'Early Explorer', 'initial_payment' => 0, 'billing_amount' => 0, 'cycle_number' => 0, 'cycle_period' => null, 'billing_limit' => 0, 'trial_amount' => 0, 'trial_limit' => 0),
            array('id' => 8, 'level_id' => 8, 'name' => 'Early Adopter', 'initial_payment' => 0, 'billing_amount' => 0, 'cycle_number' => 0, 'cycle_period' => null, 'billing_limit' => 0, 'trial_amount' => 0, 'trial_limit' => 0),
            array('id' => 9, 'level_id' => 9, 'name' => 'Lifetime', 'initial_payment' => 0, 'billing_amount' => 0, 'cycle_number' => 0, 'cycle_period' => null, 'billing_limit' => 0, 'trial_amount' => 0, 'trial_limit' => 0)
        );
    }

    /**
     * Aviso no painel
     */
    public function admin_notice() {
        if (!current_user_can('manage_options')) return;

        $cache = get_transient($this->cache_key);
        if (!$cache) return;

        $found = $cache['found'] ?? array();
        $has_pmpro = in_array('pmpro/v1/levels', $found);
        $class = $has_pmpro ? 'notice notice-success' : 'notice notice-warning';
        $message = $has_pmpro
            ? '✅ PMPro REST route detected. MiraCole REST Monitor is active.'
            : '⚠️ PMPro REST route not found. Fallback route created.';

        echo '<div class="' . esc_attr($class) . '"><p>' . esc_html($message) . '</p></div>';
    }

    /**
     * Log no console do admin
     */
    public function admin_console_log() {
        $cache = get_transient($this->cache_key);
        if (!$cache) return;

        $log_data = array(
            'plugin' => 'MiraCole REST Monitor',
            'status' => 'active',
            'found_routes' => $cache['found'] ?? array(),
            'timestamp' => date('Y-m-d H:i:s', $cache['timestamp'] ?? time())
        );

        echo '<script>console.log(' . json_encode($log_data) . ');</script>';
    }
}

// Inicializa o plugin
new MiraCole_REST_Monitor();
