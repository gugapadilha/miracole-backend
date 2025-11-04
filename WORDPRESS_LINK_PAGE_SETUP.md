# WordPress /link Page Setup Guide

This guide explains how to create the `/link` page in WordPress for Roku device approval.

---

## Step 1: Verify Plugin is Active

1. Go to WordPress Admin → **Plugins**
2. Find **"MiraCole Device Link"**
3. Ensure it's **activated**

---

## Step 2: Create the /link Page

1. Go to WordPress Admin → **Pages** → **Add New**
2. Set the page title: **"Link Device"** or **"Device Approval"**
3. In the **Permalink** section (below title), set the slug to: **`link`**
   - This creates the URL: `https://miracoleplus.com/link`
4. In the page content, add this shortcode:
   ```
   [miracole_device_link]
   ```
5. Set page visibility to **Public** (default)
6. Click **Publish**

---

## Step 3: Configure Backend URL

Add this line to `wp-config.php` (before "That's all, stop editing!"):

```php
// MiraCole Backend API URL
define('MIRACOLE_BACKEND_BASE_URL', 'https://your-api-domain.com');
```

**Replace `https://your-api-domain.com` with your actual backend API URL:**
- For staging: `https://miracole-api-staging.onrender.com`
- For production: `https://api.miracoleplus.com` (or your domain)

**Note:** If this constant is not set, the plugin will try to use `site_url('/api')` as a fallback.

---

## Step 4: Test the Page

1. Visit: `https://miracoleplus.com/link`
2. You should see:
   - "Confirm Device Link" heading
   - Device code input field
   - "Confirm Link" button
   - "Sign in (if needed)" expandable section

3. Test the flow:
   - Enter a device code from Roku
   - Sign in with WordPress credentials
   - Click "Confirm Link"
   - Verify it shows "Device linked!" message

---

## Troubleshooting

### Page Not Found (404)
- Check that the page slug is exactly `link` (lowercase)
- Verify permalinks are enabled in WordPress
- Try flushing permalinks: **Settings** → **Permalinks** → **Save Changes**

### Plugin Shortcode Not Working
- Verify the plugin is activated
- Check that the shortcode is exactly: `[miracole_device_link]`
- Check browser console for JavaScript errors

### Backend Connection Issues
- Verify `MIRACOLE_BACKEND_BASE_URL` is set correctly in `wp-config.php`
- Check that the backend API is accessible
- Check browser network tab for failed requests

### Login Not Working
- Verify backend `/api/auth/login` endpoint is working
- Check that WordPress JWT plugin is configured
- Check browser console for error messages

---

## Expected User Flow

1. **Roku displays 8-character code** (e.g., "AB12CD34")
2. **User visits** `https://miracoleplus.com/link?code=AB12CD34`
3. **Page auto-fills** the device code from URL parameter
4. **User signs in** with WordPress credentials (if not already logged in)
5. **User clicks "Confirm Link"**
6. **Page confirms** device is linked
7. **Roku polls** `/api/device/poll` and receives `activated: true`
8. **Roku completes** login flow

---

## Files Involved

- **Plugin:** `wordpress-plugin/miracole-device-link/miracole-device-link.php`
- **Page:** Created in WordPress Admin (not a file)
- **Config:** `wp-config.php` (add constant)

---

**Thanks Guga!** 🎉
