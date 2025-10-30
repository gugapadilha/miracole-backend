# Miracole Backend API - Setup Guide

## 🚀 Phase 1 Setup Instructions

This guide will help you set up the Miracole+ Backend API for local development and staging deployment.

---

## Prerequisites

- **Node.js** (v18 or higher)
- **MySQL** database access
- **Redis** server (for rate limiting)
- **Git** for version control

---

## 📦 Step 1: Install Dependencies

```bash
cd miracole-backend
npm install
```

---

## 🔐 Step 2: Generate JWT Keys

The JWT keys have already been generated. If you need to regenerate them:

```bash
npm run generate-keys
```

This will create:
- `keys/jwt_private.pem` (private key - keep secure)
- `keys/jwt_public.pem` (public key - safe to share)

**Note:** The private key is already in `.gitignore` and should never be committed.

---

## ⚙️ Step 3: Configure Environment Variables

### Create `.env` file

Create a `.env` file in the root directory with the following content:

```env
NODE_ENV=development
PORT=4000

# Database (GreenGeeks)
DB_HOST=chi211.greengeeks.net
DB_PORT=3306
DB_USER=WebDeveloper
DB_PASS=wYpVOgai7T
DB_NAME=chris183_ytlbre

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_PRIVATE_KEY_PATH=./keys/jwt_private.pem
JWT_PUBLIC_KEY_PATH=./keys/jwt_public.pem
ACCESS_TOKEN_LIFETIME=3600
REFRESH_TOKEN_LIFETIME=7776000

# Bunny CDN
BUNNY_READ_KEY=74ccf82d-419e-4c3a-86895b3ac145-8e9d-4d95
BUNNY_LIBRARY_NAME=miracoleplus-library
BUNNY_ZONE_NAME=vz-ca4682e2-e0e.b-cdn.net

# WordPress
WP_BASE_URL=https://miracoleplus.com

# Stripe (test mode)
STRIPE_TEST_PK=pk_test_xxx
STRIPE_TEST_SK=sk_test_xxx

# Rate Limiting
RATE_LIMIT_DEVICE_PER_HOUR=7
LOGIN_MAX_ATTEMPTS=7
LOGIN_LOCK_MINUTES=30
```

### Important Notes:
- Replace `pk_test_xxx` and `sk_test_xxx` with actual Stripe test keys when available
- For local development, you'll need a local Redis instance
- The WordPress JWT plugin may need additional configuration

---

## 🗄️ Step 4: Database Setup

### Local Development

If you're setting up locally, ensure your MySQL server is running and create the database:

```sql
CREATE DATABASE miracole_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Run Migrations

```bash
npm run migrate
```

---

## 🎬 Step 5: Start the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:4000`

---

## ✅ Step 6: Verify Setup

### Health Check

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

---

## 🧪 Testing the API

### 1. Login Endpoint

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

### 2. Get User Info (/me)

```bash
curl http://localhost:4000/api/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Device Code Generation

```bash
curl -X POST http://localhost:4000/api/device/code \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-123"
  }'
```

---

## 🔗 WordPress /link Page

The repository includes a minimal plugin that powers the `/link` device approval page.

1. Zip and upload `wordpress-plugin/miracole-device-link/` as a plugin and activate it
2. In `wp-config.php`, set the backend base URL for the shortcode UI:
   ```php
   putenv('MIRACOLE_BACKEND_BASE_URL=http://localhost:4000/api');
   // In staging/production: putenv('MIRACOLE_BACKEND_BASE_URL=https://<your-api-domain>/api');
   ```
3. Create a WordPress page with slug `link` and content `[miracole_device_link]`
4. Visit `https://miracoleplus.com/link?code=123456` to approve a device code

Note: The page logs into the Node API using your WordPress credentials via `/api/auth/login` and then calls `/api/device/confirm`.

---

## ☁️ Deploy to Staging (Render.com)

### Step 1: Push to Git Repository

```bash
git add .
git commit -m "Phase 1 implementation"
git push origin master
```

### Step 2: Connect to Render

1. Log in to [Render.com](https://render.com) with credentials:
   - Email: `shimira.mcmw@gmail.com`
   - Password: `MiraCole305 (z.TyRsvT4DX#y2s)`

2. Create a new **Web Service**
3. Connect your repository
4. Render will automatically detect the `render.yaml` file

### Step 3: Configure Environment Variables

In the Render dashboard, add the following environment variables:

- `NODE_ENV`: `production`
- `PORT`: `4000`
- Database credentials (from .env)
- Redis connection string (provided by Render)
- All other variables from the `.env` file

### Step 4: Deploy

Render will automatically:
- Run `npm install`
- Start with `npm start`
- Expose on port 4000

---

## 📊 Phase 1 Endpoints Summary

### Authentication
- `POST /api/auth/login` - User login with WP credentials
- `POST /api/auth/refresh` - Refresh access token using refresh token
- `POST /api/auth/logout` - Logout user

### User Info
- `GET /api/me` - Get user data and subscription info

### Device Linking
- `POST /api/device/code` - Generate temporary device code
- `POST /api/device/poll` - Poll for activation status
- `POST /api/device/confirm` - Confirm device activation

---

## 🔒 Security Features

- ✅ JWT RS256 authentication
- ✅ Access token: 60 minutes lifetime
- ✅ Refresh token: 90 days lifetime
- ✅ Token rotation on refresh
- ✅ Rate limiting with Redis (disabled in development for easier testing)
- ✅ Login lockout after 7 failed attempts (30 min)
- ✅ Helmet.js security headers
- ✅ CORS protection

---

## 🐛 Troubleshooting

### Database Connection Error

If you see "Database connection failed":
- Check that MySQL is running
- Verify credentials in `.env`
- Ensure database exists
- Check firewall rules

### Redis Connection Error

If rate limiting fails:
- Ensure Redis is running: `redis-cli ping`
- For local dev, install Redis or use Docker: `docker run -p 6379:6379 redis`

### JWT Key Error

If you see "JWT key not found":
- Run `npm run generate-keys`
- Check file permissions on `keys/` directory

### WordPress Authentication Fails

- Ensure WordPress JWT plugin is installed
- Verify `WP_BASE_URL` in `.env`
- Check WordPress API endpoints are accessible
 - If `/api/plans` returns fallback, WordPress may be restricted locally; this is expected during dev.

---

## 📝 Next Steps

Once Phase 1 is working:

- [ ] Implement database migrations for devices
- [ ] Add credit system integration
- [ ] Implement refresh token revocation
- [ ] Add comprehensive error handling
- [ ] Write unit tests
- [ ] Set up CI/CD pipeline

---

## 🆘 Support

For issues or questions:
- Check the logs in `logs/` directory
- Review the README.md for detailed documentation
- Contact the development team

---

**Thanks Guga!** 🎉

