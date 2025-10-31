# Render Deployment Guide

## ✅ What Has Been Fixed

The code now supports reading JWT keys from environment variables (`JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY`), which is perfect for Render deployment.

---

## 🔧 Steps to Configure on Render

### 1. Environment Variables on Render

Go to your Render service → **Environment** tab, and set these variables:

#### **JWT Keys (REQUIRED - Replace with your generated keys)**

```
JWT_PRIVATE_KEY
```

**Value:** Copy the ENTIRE private key from below (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`):

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCUDCdcR9fias+C
c77IBlsSamKDOYluIf4rB8pGtlzr5SqlwoXTT2NAmAsI3o/Qd++y3JBj3FDTZBZ4
uKgAPZ5kbZikDNWvJ7Pf/s7vH6pmejUN5ZmwKm5mL5q9FJ1MvXwPhQtkMPRsaQqG
mjAOiyWzCCdEJutxSaVosYE/OAv41saQh/jKRwt2EoRAJ/XYCmrkgGvSrjmSvIEt
Sm1XfuPfFU7YGfN340kO57ySxOWFI1NdFsVzJeZe7mzNRb8VUbU8H86gSffre+G0
HyQJayYJHQ5+Q3ZG3uxRLQkAqtfuzt6oUj9ChBLSXtIWGoVyT8zyuDTBWAVOIZw9
vNnPZiQzAgMBAAECggEARoCBMANwjfzyg/utw2CvdxYdgsNgLIfYm9JSZBlNJ/NS
u2xmwYoBSI3/V0Jxt0OebQ13X27YOMrlnqjFLJQrfUTp11nbWtWr5cRY9GwegD27
TTplVYznVRdfd6K9BAIKdfOUSKq9g3EEV7ROpWZjVh5QYLauEZ2SPUimtZ3xqZaY
XNNWJuCKByYnXP6wMdVS2xC+2KFD21cwTQbRxPzrUmDbRtiGC9I1irweW04DKng3
t/MO5Xhet2MTGzj94RQKgHkisNQo2cEgMftYRXUPihHkw2pnRFxJdlHqyC6iaRyw
nDx5jkmKW1GbAuukkS6JJ3Of9guE5mz+bdwOwxd3EQKBgQDPjpBEakoPHnbRkLDk
kFpMEc+qP+AA1OCIAO5h6zhfvphwsHbtCIfCe3J1Xb3WHYKOmoCfGKFTIHhaqeHm
2dE0PrnuVXjT4lGeaTo1aHcVeiP7ogit1ii88/ohNNDxv08ZIxoQjeDt2/Qyowr8
70PbusVH/pEtIxHPFxFZAWKPIwKBgQC2me2KreIIW4cOU/0rtnwfVBDMII3mnKeX
FZ7xXm6VW7JuALE+yt0tdoz8svz93y+36Mit5dEd0ju6zWnQufiFHqeGSPsVXKwS
8gOrX3Ttk8nXFto6ckxlqy+0oa6gG8ND3KzasS7lQP7AXtkfBwrjurvFZSChf4Ve
8RQB/JtvsQKBgFkbc4RrvW/QPGKsI8V808dkvirxUVIKEntRKwaO3Zz9TqTSnbwV
tXMhXHpWzHFoKezfF+k1wczWW9VQqdNaIB61700LFNyihTflJUBYoQdvcJNPdTps
fwDgHbqz2iBvaZ35G++PecmkbKpwpP8CGbfz706BVAJ00+h8ls4HcjDRAoGBAKtx
+StVOb25GiRkzXcmfoH3r1HJWxJkkaH0heiATnnjv7My6ThYxrQx9AwrjghbbnVR
lmJYPjCuvLAWv7xfcCyk7IvTqBOVkGa1XqagGKwcL83IwhtQR9TJlyAVEl130626
23z2EV7k2IwMQfW06g+Ju1WKLsoTbkkHN07qO5LxAoGAEQKgLnjGbA7+j4vDNmem
5tQdZayjgn5eTu7WxKqn6yg6Wnui4dLFFZqBUe6b51ZI/araNtGRbNvwBxlnXi/W
CQdxF2Z/XIwceOWOpRjjgzJIhhqW5q9uw33izcuMVu4v0rQCANH69EA0mZFhcg/h
yhG8kJA7h7anXgM9wPpYa7o=
-----END PRIVATE KEY-----
```

```
JWT_PUBLIC_KEY
```

**Value:** Copy the ENTIRE public key from below:

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlAwnXEfX4mrPgnO+yAZb
EmpigzmJbiH+KwfKRrZc6+UqpcKF009jQJgLCN6P0HfvstyQY9xQ02QWeLioAD2e
ZG2YpAzVryez3/7O7x+qZno1DeWZsCpuZi+avRSdTL18D4ULZDD0bGkKhpowDosl
swgnRCbrcUmlaLGBPzgL+NbGkIf4ykcLdhKEQCf12Apq5IBr0q45kryBLUptV37j
3xVO2Bnzd+NJDue8ksTlhSNTXRbFcyXmXu5szUW/FVG1PB/OoEn363vhtB8kCWsm
CR0OfkN2Rt7sUS0JAKrX7s7eqFI/QoQS0l7SFhqFck/M8rg0wVgFTiGcPbzZz2Yk
MwIDAQAB
-----END PUBLIC KEY-----
```

**⚠️ IMPORTANT:** When pasting in Render:
- Copy the ENTIRE key including the `-----BEGIN` and `-----END` lines
- Preserve all line breaks (Render should handle this automatically)
- Do NOT add quotes around the values

---

#### **Other Required Environment Variables**

```
NODE_ENV=production
PORT=4000
```

```
DB_HOST=your-mysql-host.render.com
DB_PORT=3306
DB_USER=your-db-user
DB_PASS=your-db-password
DB_NAME=miracole_api
```

```
REDIS_HOST=your-redis-host.render.com
REDIS_PORT=6379
REDIS_PASS=your-redis-password
```

```
ACCESS_TOKEN_LIFETIME=3600
REFRESH_TOKEN_LIFETIME=7776000
```

```
BUNNY_READ_KEY=your-bunny-read-key
BUNNY_LIBRARY_NAME=miracoleplus-library
BUNNY_ZONE_NAME=your-zone-name
```

```
WP_BASE_URL=https://miracoleplus.com
WP_API_KEY=your-wp-api-key
```

```
STRIPE_TEST_SK=sk_test_your_stripe_key
```

```
RATE_LIMIT_DEVICE_PER_HOUR=7
LOGIN_MAX_ATTEMPTS=7
LOGIN_LOCK_MINUTES=30
```

```
WP_JWT_SECRET=your-wordpress-jwt-secret
```

---

### 2. Remove These Variables (Not Needed)

You can DELETE these variables from Render (they're not used anymore):
- ❌ `JWT_PRIVATE_KEY_PATH`
- ❌ `JWT_PUBLIC_KEY_PATH`

---

### 3. Build & Deploy Settings

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Root Directory:** (leave empty or set to `/`)

---

### 4. Verify Deployment

After deployment, check:

1. **Health Check:** Visit `https://your-app.onrender.com/health`
   - Should return: `{"status":"OK","timestamp":"...","environment":"production"}`

2. **Check Logs:** In Render dashboard → **Logs** tab
   - Look for: `✅ Redis connected` or warnings
   - Should NOT see: `Error: ENOENT: no such file or directory, open './keys/jwt_private.pem'`

3. **Test Endpoints:**
   - `GET /health` - Should work
   - `POST /api/auth/login` - Test with valid credentials

---

## 🐛 Troubleshooting

### Error: "ENOENT: no such file or directory, open './keys/jwt_private.pem'"

**Solution:** This means the environment variables `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` are not set correctly. 

1. Check that both variables exist in Render
2. Check that the values are complete (including BEGIN/END lines)
3. Check that there are no extra quotes around the values

### Error: "JWT keys not found"

**Solution:** Make sure both `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` environment variables are set in Render.

### Error: "Invalid or expired token"

**Solution:** This is a different issue (not related to key loading). Check your JWT token format and expiration.

---

## 📝 Notes

- The keys generated above are NEW keys. If you already have existing tokens, they will become invalid.
- For local development, the keys are still saved in `./keys/` directory
- The code automatically detects if environment variables are set and uses them, otherwise falls back to files

---

## ✅ Summary

1. ✅ Add `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` environment variables in Render
2. ✅ Use the keys generated above
3. ✅ Remove `JWT_PRIVATE_KEY_PATH` and `JWT_PUBLIC_KEY_PATH` (not needed)
4. ✅ Deploy and test

The code is already configured to read from environment variables, so once you set them in Render, it should work! 🚀

Thanks, Guga! 🙏
