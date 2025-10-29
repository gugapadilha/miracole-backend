# Miracole Backend API

A Node.js backend API for the Miracole video streaming platform, built with Express.js and integrated with WordPress/PMPro for user management and Bunny CDN for video delivery.

## Features

- **Authentication**: JWT-based authentication with RS256 algorithm
- **User Management**: Integration with WordPress and PMPro for membership management
- **Video Streaming**: Bunny CDN integration for video delivery
- **Device Management**: Multi-device registration and activation system
- **Rate Limiting**: Redis-based rate limiting for API protection
- **Security**: Helmet.js for security headers, CORS configuration
- **Logging**: Winston-based structured logging
- **Database**: MySQL with Knex.js for database operations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Knex.js
- **Cache**: Redis
- **Authentication**: JWT (RS256)
- **Video CDN**: Bunny CDN
- **CMS**: WordPress with PMPro
- **Logging**: Winston
- **Security**: Helmet, CORS
- **Rate Limiting**: rate-limiter-flexible

## Project Structure

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
│  │  └─ me.js               # User profile routes
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
│  └─ utils/                 # Utility functions
├─ migrations/               # Database migrations
├─ keys/                     # JWT RSA keys
├─ logs/                     # Application logs
├─ .env                      # Environment variables
└─ package.json
```

## Installation

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
   # Keys are automatically generated during setup
   # Located in keys/jwt_private.pem and keys/jwt_public.pem
   ```

5. **Set up database**
   ```bash
   # Create MySQL database
   # Update .env with database credentials
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

```env
NODE_ENV=development
PORT=4000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=miracole_api

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASS=

# JWT
JWT_PRIVATE_KEY_PATH=./keys/jwt_private.pem
JWT_PUBLIC_KEY_PATH=./keys/jwt_public.pem
ACCESS_TOKEN_LIFETIME=3600
REFRESH_TOKEN_LIFETIME=7776000

# Bunny CDN
BUNNY_READ_KEY=
BUNNY_LIBRARY_NAME=miracoleplus-library
BUNNY_ZONE_NAME=

# WordPress
WP_BASE_URL=https://miracoleplus.com
WP_API_KEY=

# Stripe
STRIPE_TEST_SK=sk_test_xxx

# Rate Limiting
RATE_LIMIT_DEVICE_PER_HOUR=7
LOGIN_MAX_ATTEMPTS=7
LOGIN_LOCK_MINUTES=30
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Device Management
- `POST /api/device/register` - Register new device
- `POST /api/device/code` - Generate activation code
- `POST /api/device/activate` - Activate device
- `GET /api/device/list` - List user devices
- `DELETE /api/device/:deviceId` - Remove device

### Video Streaming
- `GET /api/videos` - List available videos
- `GET /api/videos/:videoId` - Get video details and stream URL
- `GET /api/videos/:videoId/analytics` - Get video analytics
- `POST /api/videos/:videoId/watch` - Track video watch

### User Profile
- `GET /api/me/profile` - Get user profile
- `PUT /api/me/profile` - Update user profile
- `GET /api/me/membership` - Get membership info
- `GET /api/me/watch-history` - Get watch history
- `GET /api/me/favorites` - Get favorite videos
- `POST /api/me/favorites/:videoId` - Add to favorites
- `DELETE /api/me/favorites/:videoId` - Remove from favorites

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

### Database Migrations
```bash
# Run migrations
npx knex migrate:latest

# Rollback migrations
npx knex migrate:rollback
```

### Logging
Logs are stored in the `logs/` directory:
- `error.log` - Error level logs
- `combined.log` - All logs

## Security Features

- **JWT Authentication**: RS256 algorithm with RSA key pairs
- **Rate Limiting**: Redis-based rate limiting for API endpoints
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable CORS policy
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Structured error responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

