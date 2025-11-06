# MiraCole+ Backend API

A Node.js backend API for the MiraCole+ Christian streaming platform, built with Express.js and integrated with WordPress/PMPro for user management and Bunny CDN for video delivery.

## 🎯 Phase 1 Overview

MiraCole+ is a Christian-based streaming platform. This backend provides REST APIs for authentication, device linking, playlist/watchlist, search, catalog, and video detail, integrated with WordPress (StreamVid + PMPro + Stripe) and Roku.

## ✨ Features

### ✅ Implemented & Working

#### Authentication & Security
- **JWT Authentication**: RS256 algorithm with RSA key pairs
  - Access tokens: 60 minutes lifetime
  - Refresh tokens: 90 days lifetime
  - Token rotation on refresh
  - Token revocation on logout
- **Login Lockout**: 7 failed attempts = 30 minute lockout
- **Rate Limiting**: Redis-based (disabled in dev for testing)
  - Device code generation: 7 attempts per hour
  - Login attempts: Configurable via env vars
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable CORS policy
- **SSL/TLS**: PostgreSQL SSL connection support

#### Authentication Endpoints
- `POST /api/auth/login` - User login with WordPress credentials
- `POST /api/auth/refresh` - Refresh access token (with token rotation)
- `POST /api/auth/logout` - Logout and revoke refresh token

#### Device Linking (Roku)
- `POST /api/device/code` - Generate 8-character device activation code (15 min expiry)
- `GET /api/device/poll?code=XXX` - Poll device activation status
- `POST /api/device/poll` - Poll device activation status (POST variant)
- `POST /api/device/confirm` - Confirm device activation (requires auth)

#### User Profile
- `GET /api/me` - Get user information with subscription status
  - Returns: `subscribed`, `subscription_level`, `credits_balance`, `language`, `playlist_count`, `watchlist_count`, `parental_settings`, `profile`
- `GET /api/me/profile` - Get detailed user profile
- `PUT /api/me/profile` - Update user profile
- `GET /api/me/membership` - Get detailed membership information

#### Video Management
- `GET /api/videos` - List available videos (with search support)
- `GET /api/videos/:videoId` - Get video details and streaming URL
- `GET /api/videos/:videoId/analytics` - Get video analytics (requires auth)
- `POST /api/videos/:videoId/watch` - Track video watch event

#### Plans & Membership
- `GET /api/plans` - Get PMPro membership plans (with WordPress integration + fallback)
  - Falls back to static plans if WordPress unavailable
  - Caching: 5 minutes TTL

#### WordPress Integration
- WordPress user authentication via REST API
- PMPro membership level integration
- Membership status checking
- User profile synchronization
- Webhook support for membership changes: `POST /api/members/sync`

#### Database
- **PostgreSQL** (production on Render) or **MySQL** (local dev)
- Database migrations via Knex.js
- Tables: `users`, `refresh_tokens`, `devices`

#### Watch History & Favorites (Placeholder Structure)
- `GET /api/me/watch-history` - Get user's watch history (placeholder data)
- `GET /api/me/favorites` - Get user's favorite videos (placeholder data)
- `POST /api/me/favorites/:videoId` - Add video to favorites (placeholder)
- `DELETE /api/me/favorites/:videoId` - Remove from favorites (placeholder)

### ⚠️ Not Yet Implemented (Placeholders)

#### Credits System
- **Status**: Placeholder returns `0`
- **Location**: `/api/me` endpoint
- **TODO**: Implement credit balance tracking and management

#### Playlist/Watchlist
- **Status**: Placeholder structure exists, returns `0` for counts
- **Location**: `/api/me` endpoint
- **TODO**: Implement full playlist and watchlist functionality with database persistence

#### Parental Settings
- **Status**: Placeholder returns `{ locked: false }`
- **Location**: `/api/me` endpoint
- **TODO**: Implement parental control settings and management

#### WordPress /link Page
- **Status**: Not implemented (server overload issues on GreenGeeks)
- **TODO**: Create `/link` page on WordPress for device approval

## 🏗️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (production) / MySQL (development)
- **ORM**: Knex.js
- **Cache**: Redis (optional, for rate limiting)
- **Authentication**: JWT (RS256)
- **Video CDN**: Bunny CDN
- **CMS**: WordPress with PMPro
- **Logging**: Winston
- **Security**: Helmet, CORS
- **Rate Limiting**: rate-limiter-flexible
- **Deployment**: Render.com

## 📁 Project Structure

```
miracole-backend/
├─ src/
│  ├─ app.js                 # Express app configuration
│  ├─ server.js              # Server startup
│  ├─ config/
│  │  └─ index.js            # Configuration management
│  ├─ routes/
│  │  ├─ auth.js             # Authentication routes
│  │  ├─ device.js           # Device management routes
│  │  ├─ videos.js           # Video streaming routes
│  │  ├─ me.js               # User profile routes
│  │  ├─ plans.js            # Membership plans routes
│  │  └─ members.js          # Membership webhook routes
│  ├─ services/
│  │  ├─ jwtService.js       # JWT token management
│  │  ├─ pmproService.js     # PMPro membership service
│  │  ├─ bunnyService.js     # Bunny CDN service
│  │  └─ wordpressService.js # WordPress integration
│  ├─ db/
│  │  └─ knex.js             # Database configuration
│  ├─ middlewares/
│  │  ├─ auth.js             # Authentication middleware
│  │  ├─ rateLimit.js        # Rate limiting middleware
│  │  └─ logger.js           # Logging middleware
│  ├─ migrations/
│  │  ├─ 001_create_users_table.js
│  │  ├─ 002_create_refresh_tokens_table.js
│  │  └─ 003_create_devices_table.js
│  └─ utils/
│     ├─ deviceCodeGenerator.js
│     └─ loginLockout.js
├─ keys/                     # JWT RSA keys (gitignored)
├─ logs/                     # Application logs
├─ .env                      # Environment variables
└─ package.json
```

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL (production) or MySQL (development)
- Redis (optional, for rate limiting)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd miracole-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Generate JWT keys** (if not already generated)
   ```bash
   node scripts/generate-keys.js
   # Or use scripts/generate-keys-for-render.js for Render deployment
   ```

5. **Set up database**
   ```bash
   # For local development: Create MySQL database
   # For production: Use Render PostgreSQL database
   # Update .env with database credentials
   ```

6. **Run migrations**
   ```bash
   node run-migrations.js
   # Or: npx knex migrate:latest
   ```

7. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Environment Variables

```env
# Server
NODE_ENV=development
PORT=4000
BASE_URL=https://api.miracoleplus.com

# Database (PostgreSQL for production, MySQL for dev)
DB_HOST=localhost
DB_PORT=5432  # 5432 for PostgreSQL, 3306 for MySQL
DB_USER=your_user
DB_PASS=your_password
DB_NAME=miracole_api
ENABLE_SSL=true  # Enable SSL for PostgreSQL connections

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASS=

# JWT
JWT_PRIVATE_KEY_PATH=./keys/jwt_private.pem
JWT_PUBLIC_KEY_PATH=./keys/jwt_public.pem
# Or use environment variables for Render:
# JWT_PRIVATE_KEY=<full key with \n>
# JWT_PUBLIC_KEY=<full key with \n>
ACCESS_TOKEN_LIFETIME=3600  # 60 minutes
REFRESH_TOKEN_LIFETIME=7776000  # 90 days

# Bunny CDN
BUNNY_READ_KEY=your_bunny_read_key
BUNNY_LIBRARY_NAME=miracoleplus-library
BUNNY_ZONE_NAME=your_zone_name

# WordPress
WP_BASE_URL=https://miracoleplus.com
WP_API_KEY=your_wordpress_api_key

# Stripe
STRIPE_TEST_SK=sk_test_xxx

# Rate Limiting
RATE_LIMIT_DEVICE_PER_HOUR=7
LOGIN_MAX_ATTEMPTS=7
LOGIN_LOCK_MINUTES=30
```

## 📚 API Documentation

### Base URL
- **Production**: `https://api.miracoleplus.com`
- **Staging**: `https://miracole-backend.onrender.com`

### Authentication

All protected endpoints require an `Authorization` header:
```
Authorization: Bearer <access_token>
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": "Additional details (development only)"
}
```

### Endpoints

#### Authentication

**POST /api/auth/login**
```json
// Request
{
  "username": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600,
  "user": {
    "email": "user@example.com",
    "name": "User Name",
    "subscription": "premium"
  }
}
```

**POST /api/auth/refresh**
```json
// Request
{
  "refresh_token": "eyJhbGc..."
}

// Response
{
  "success": true,
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",  // New rotated token
  "expires_in": 3600
}
```

**POST /api/auth/logout**
```json
// Request
{
  "refresh_token": "eyJhbGc..."
}

// Response
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Device Linking

**POST /api/device/code**
```json
// Response
{
  "success": true,
  "device_code": "AB12CD34",
  "expires_in": 900  // 15 minutes
}
```

**GET /api/device/poll?code=AB12CD34**
```json
// Response (not activated)
{
  "success": true,
  "activated": false
}

// Response (activated)
{
  "success": true,
  "activated": true,
  "user_id": 123
}
```

**POST /api/device/confirm**
```json
// Request (requires Authorization header)
{
  "device_code": "AB12CD34"
}

// Response
{
  "success": true,
  "activated": true,
  "user_id": 123
}
```

#### User Profile

**GET /api/me**
```json
// Response
{
  "subscribed": true,
  "subscription_level": {
    "id": 9,
    "name": "Lifetime"
  },
  "credits_balance": 0,
  "language": "en",
  "playlist_count": 0,
  "watchlist_count": 0,
  "parental_settings": {
    "locked": false
  },
  "profile": {
    "id": 123,
    "username": "user",
    "email": "user@example.com",
    "display_name": "User Name"
  }
}
```

#### Videos

**GET /api/videos?page=1&perPage=20&search=query**
```json
// Response
{
  "success": true,
  "videos": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**GET /api/videos/:videoId**
```json
// Response
{
  "success": true,
  "video": {
    "id": "video-123",
    "title": "Video Title",
    "description": "Video description",
    "duration": 3600,
    "thumbnail": "https://...",
    "streamUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "status": "published",
    "views": 1234
  }
}
```

#### Plans

**GET /api/plans**
```json
// Response
{
  "success": true,
  "source": "wordpress",  // or "fallback"
  "plans": [
    {
      "id": 2,
      "name": "Monthly",
      "billing_amount": 9.99,
      "cycle_number": 1,
      "cycle_period": "Month"
    },
    ...
  ]
}
```

## 🔐 Security Features

- **JWT Authentication**: RS256 algorithm with RSA key pairs
- **Rate Limiting**: Redis-based rate limiting for API endpoints
  - Device code: 7 attempts per hour
  - Login: 7 failed attempts = 30 min lockout
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable CORS policy
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Structured error responses (details hidden in production)
- **Token Rotation**: Refresh tokens are rotated on each use
- **Token Revocation**: Refresh tokens can be revoked on logout

## 📊 Database Schema

### Users Table
- `id` (primary key)
- `wordpress_id` (unique)
- `email`
- `username`
- `created_at`
- `updated_at`

### Refresh Tokens Table
- `id` (primary key)
- `user_id` (foreign key)
- `token` (hashed)
- `expires_at`
- `revoked` (boolean)
- `created_at`

### Devices Table
- `id` (primary key)
- `device_code` (unique, 8 characters)
- `user_id` (foreign key, nullable)
- `linked` (boolean)
- `expires_at` (nullable)
- `created_at`
- `updated_at`

## 🚀 Deployment

### Render.com Deployment

1. Connect your GitHub repository to Render
2. Set up PostgreSQL database on Render
3. Configure environment variables in Render dashboard
4. Set `ENABLE_SSL=true` for PostgreSQL connection
5. Deploy service (auto-deploy on git push)

### Database Migrations

Migrations run automatically on service start, or you can run manually:
```bash
node run-migrations.js
```

## 📝 Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

### Logging
Logs are stored in the `logs/` directory:
- `error.log` - Error level logs
- `combined.log` - All logs

### Rate Limiting
In development, global and per-route rate limiters are disabled to avoid 429 during local testing. In production they are enabled with policy from `.env`.

## 🎯 PMPro Level IDs

- **Free**: None
- **Monthly**: 2
- **Yearly**: 3
- **Early Explorer**: 7
- **Early Adopter**: 8
- **Lifetime**: 9

## 📋 Phase 1 Completion Status

### ✅ Completed
- [x] Authentication endpoints (`/auth/login`, `/auth/refresh`, `/auth/logout`)
- [x] Device linking endpoints (`/device/code`, `/device/poll`, `/device/confirm`)
- [x] JWT implementation (RS256, access + refresh tokens)
- [x] Token security (rotation, revocation, expiration)
- [x] Login lockout (7 attempts, 30 min)
- [x] Rate limiting (device code: 7/hour)
- [x] `/me` endpoint with subscription status
- [x] WordPress + PMPro integration
- [x] Video endpoints (list, detail, search)
- [x] Plans endpoint with fallback
- [x] Database migrations
- [x] PostgreSQL SSL configuration
- [x] Deployment on Render.com

### ⚠️ Pending (Placeholders)
- [ ] Credits system implementation
- [ ] Playlist functionality (full implementation)
- [ ] Watchlist functionality (full implementation)
- [ ] Parental settings implementation
- [ ] WordPress `/link` page (server overload issues)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Links

- **Production API**: https://api.miracoleplus.com
- **WordPress Site**: https://miracoleplus.com
- **Documentation**: See `ENDPOINT_TESTING_GUIDE.md` for detailed testing instructions
