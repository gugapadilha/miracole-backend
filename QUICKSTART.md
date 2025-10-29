# Quick Start Guide - Miracole Backend API

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Copy the environment template and fill in your values:
```bash
# Create .env file with this content:
NODE_ENV=development
PORT=4000

DB_HOST=chi211.greengeeks.net
DB_PORT=3306
DB_USER=WebDeveloper
DB_PASS=wYpVOgai7T
DB_NAME=chris183_ytlbre

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_PRIVATE_KEY_PATH=./keys/jwt_private.pem
JWT_PUBLIC_KEY_PATH=./keys/jwt_public.pem
ACCESS_TOKEN_LIFETIME=3600
REFRESH_TOKEN_LIFETIME=7776000

BUNNY_READ_KEY=74ccf82d-419e-4c3a-86895b3ac145-8e9d-4d95
BUNNY_LIBRARY_NAME=miracoleplus-library
BUNNY_ZONE_NAME=vz-ca4682e2-e0e.b-cdn.net

WP_BASE_URL=https://miracoleplus.com

STRIPE_TEST_PK=pk_test_xxx
STRIPE_TEST_SK=sk_test_xxx

RATE_LIMIT_DEVICE_PER_HOUR=7
LOGIN_MAX_ATTEMPTS=7
LOGIN_LOCK_MINUTES=30
```

### 3. Start Server
```bash
npm run dev
```

### 4. Test It
```bash
curl http://localhost:4000/health
```

---

## 📋 Phase 1 Endpoints

### POST /api/auth/login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'
```

### GET /api/me
```bash
curl http://localhost:4000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST /api/device/code
```bash
curl -X POST http://localhost:4000/api/device/code \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"device-123"}'
```

---

## ☁️ Deploy to Render

1. Push to Git
2. Connect repository on Render.com
3. Render will auto-detect `render.yaml`
4. Add Redis instance
5. Deploy!

---

## 📚 Documentation

- **SETUP.md** - Detailed setup instructions
- **PHASE1_SUMMARY.md** - Phase 1 implementation details
- **README.md** - Complete project documentation

---

**Thanks Guga!** 🎉

