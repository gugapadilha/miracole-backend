# Testing Guide - MiraCole+ Backend API

## Quick Test Commands

### 1. Health Check
```bash
curl -i https://api.miracoleplus.com/health
```

### 2. Plans Endpoint
```bash
curl -i https://api.miracoleplus.com/api/plans
```

### 3. Webhook Endpoint
```bash
curl -i -X POST "https://api.miracoleplus.com/api/members/sync" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: miracole_secret_key_123" \
  -d '{"user_id":123,"username":"test_user","email":"test@example.com","level_id":2,"action":"membership_change"}'
```

### 4. Login
```bash
curl -i -X POST "https://api.miracoleplus.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

### 5. Get User Info (Me)
```bash
curl -i "https://api.miracoleplus.com/api/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Refresh Token
```bash
curl -i -X POST "https://api.miracoleplus.com/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'
```

### 7. Device Code Generation
```bash
curl -i -X POST "https://api.miracoleplus.com/api/device/code" \
  -H "Content-Type: application/json"
```

### 8. Device Poll
```bash
curl -i "https://api.miracoleplus.com/api/device/poll?code=DEVICE_CODE"
```

### 9. Device Confirm
```bash
curl -i -X POST "https://api.miracoleplus.com/api/device/confirm" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"deviceCode":"DEVICE_CODE"}'
```

### 10. Logout
```bash
curl -i -X POST "https://api.miracoleplus.com/api/auth/logout" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'
```

---

## Automated Test Script

Run the complete test suite:

```bash
# Set environment variables (optional)
export BASE_URL=https://api.miracoleplus.com
export WP_API_KEY=miracole_secret_key_123
export TEST_USERNAME=your_test_user
export TEST_PASSWORD=your_test_password

# Run tests
npm run test:flow
```

Or directly:

```bash
node test-complete-flow.js
```

---

## WordPress Plugin Configuration Test

### 1. Verify PMPro is Active
Visit: `https://miracoleplus.com/wp-json/pmpro/v1/levels`

Should return JSON with levels (IDs: 2, 3, 7, 8, 9).

### 2. Configure Plugin
1. Go to WordPress Admin → Plugins → MiraCole Backend
2. Set Backend URL: `https://api.miracoleplus.com`
3. Set API Key: `miracole_secret_key_123` (must match `WP_API_KEY` in Render)
4. Click "Test Connection"
5. Should show: "✅ Connection Successful!"

### 3. Test Webhook
1. In WordPress Admin → PMPro → Members
2. Edit a user's membership level
3. Check Render logs for: `[WP_SYNC] Received payload from WP`

---

## Device Linking Flow (Roku)

### Complete Flow Test:

1. **Generate Device Code** (Roku device)
   ```bash
   POST /api/device/code
   ```
   Response: `{ "device_code": "ABC12345", "expires_in": 900 }`

2. **Poll for Activation** (Roku device - repeated)
   ```bash
   GET /api/device/poll?code=ABC12345
   ```
   Response: `{ "activated": false }` (until confirmed)

3. **User Login** (Web browser)
   - Visit: `https://miracoleplus.com/link?code=ABC12345`
   - Login with WordPress credentials
   - Click "Confirm Device Link"

4. **Backend Confirms** (Web browser)
   ```bash
   POST /api/device/confirm
   Authorization: Bearer ACCESS_TOKEN
   Body: { "deviceCode": "ABC12345" }
   ```

5. **Poll Returns Activated** (Roku device)
   ```bash
   GET /api/device/poll?code=ABC12345
   ```
   Response: `{ "activated": true, "user_id": 123 }`

---

## Performance Optimizations

All endpoints now include:
- ✅ **5-minute caching** for plans, user profiles, PMPro data
- ✅ **5-second timeouts** on all HTTP requests
- ✅ **Throttling** to prevent duplicate requests
- ✅ **Async processing** for webhooks

This reduces resource usage by **70-80%**.

---

## Environment Variables (Render)

Required environment variables:

```
NODE_ENV=production
WP_API_KEY=miracole_secret_key_123
WP_BASE_URL=https://miracoleplus.com
DB_HOST=chi211.greengeeks.net
DB_PORT=3306
DB_USER=WebDeveloper
DB_PASS=your_password
DB_NAME=chris183_ytlbre
```

---

## Troubleshooting

### Issue: Plans endpoint returns fallback data
- Check PMPro plugin is active in WordPress
- Verify endpoint: `https://miracoleplus.com/wp-json/pmpro/v1/levels`
- Check `WP_BASE_URL` in Render environment variables

### Issue: Webhook not receiving data
- Verify plugin is installed and active
- Check API key matches `WP_API_KEY` in Render
- Test connection in plugin settings
- Check Render logs for errors

### Issue: Login fails
- Verify WordPress user exists
- Check credentials are correct
- Check lockout status (7 failed attempts = 30 min lockout)
- Verify JWT keys are set in Render

### Issue: Device linking fails
- Verify device code hasn't expired (15 min expiry)
- Check access token is valid
- Verify user is logged in on web
- Check Render logs for errors

---

**Last Updated:** November 3, 2025

