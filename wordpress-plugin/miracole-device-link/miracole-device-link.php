<?php
/*
Plugin Name: MiraCole Device Link
Description: Renders /link page UI to confirm Roku device codes against the Node backend.
Version: 0.1.0
Author: MiraCole+
*/

if (!defined('ABSPATH')) { exit; }

// Backend base URL setting (filterable). Uses same URL as backend connector
function miracole_device_link_backend_base_url() {
    // First check WordPress option (from backend connector settings)
    $backend_url = get_option('miracole_backend_url');
    if ($backend_url) {
        return apply_filters('miracole_device_link_backend_base_url', rtrim($backend_url, '/'));
    }
    
    // Then check environment variable
    $default = getenv('MIRACOLE_BACKEND_URL');
    if (!$default) {
        $default = getenv('MIRACOLE_BACKEND_BASE_URL');
    }
    
    // Final fallback
    if (!$default) {
        $default = 'https://miracole-backend.onrender.com';
    }
    
    return apply_filters('miracole_device_link_backend_base_url', rtrim($default, '/'));
}

// Shortcode: [miracole_device_link]
function miracole_device_link_shortcode() {
    $backend = esc_url(miracole_device_link_backend_base_url());
    $device_code = isset($_GET['code']) ? sanitize_text_field($_GET['code']) : '';

    ob_start();
    ?>
    <div id="mc-link" style="max-width:480px;margin:2rem auto;padding:1rem;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="margin:0 0 12px;">Confirm Device Link</h2>
        <p id="mc-status" style="color:#6b7280;margin:0 0 12px;">Enter the 8-character code shown on your TV.</p>

        <label style="display:block;margin-bottom:8px;">Device Code</label>
        <input id="mc-code" type="text" value="<?php echo esc_attr($device_code); ?>" maxlength="8" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;" />

        <div style="height:12px"></div>
        <button id="mc-confirm" style="padding:10px 14px;background:#111827;color:#fff;border:none;border-radius:6px;cursor:pointer;">Confirm Link</button>

        <div style="height:16px"></div>
        <details>
            <summary>Sign in (if needed)</summary>
            <div style="margin-top:8px">
                <label>Email or Username</label>
                <input id="mc-user" type="text" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;" />
                <div style="height:8px"></div>
                <label>Password</label>
                <input id="mc-pass" type="password" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;" />
                <div style="height:8px"></div>
                <button id="mc-login" style="padding:10px 14px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;">Sign In</button>
            </div>
        </details>
    </div>

    <script>
    (function(){
      const backend = <?php echo json_encode($backend); ?>;
      const $ = (id) => document.getElementById(id);
      const statusEl = $('mc-status');

      function setStatus(text, color){
        statusEl.textContent = text;
        statusEl.style.color = color || '#6b7280';
      }

      async function login(){
        try{
          const username = $('mc-user').value.trim();
          const password = $('mc-pass').value;
          if(!username || !password){ setStatus('Enter username and password.', '#b91c1c'); return; }
          setStatus('Signing in...', '#6b7280');
          const res = await fetch(backend + '/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const json = await res.json();
          if(!res.ok){ throw new Error(json?.message || 'Login failed'); }
          localStorage.setItem('mc_access', json.access_token);
          setStatus('Signed in. You can confirm the device now.', '#065f46');
        }catch(err){ setStatus(err.message || 'Login error', '#b91c1c'); }
      }

      async function confirm(){
        try{
          const code = $('mc-code').value.trim();
          if(!code){ setStatus('Enter the device code.', '#b91c1c'); return; }
          const token = localStorage.getItem('mc_access');
          if(!token){ setStatus('Sign in first, then confirm the device.', '#b91c1c'); return; }
          setStatus('Confirming device...', '#6b7280');
          const res = await fetch(backend + '/api/device/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ deviceCode: code })
          });
          const json = await res.json();
          if(!res.ok){ throw new Error(json?.message || 'Confirm failed'); }
          setStatus('Device linked! You can return to your TV.', '#065f46');
        }catch(err){ setStatus(err.message || 'Confirm error', '#b91c1c'); }
      }

      $('mc-login').addEventListener('click', function(e){ e.preventDefault(); login(); });
      $('mc-confirm').addEventListener('click', function(e){ e.preventDefault(); confirm(); });
    })();
    </script>
    <?php
    return ob_get_clean();
}

add_shortcode('miracole_device_link', 'miracole_device_link_shortcode');


