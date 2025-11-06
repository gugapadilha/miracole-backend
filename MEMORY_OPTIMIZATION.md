# Memory Optimization & 503 Error Fix

## Problem

The backend was returning `503 Service Unavailable` errors, likely due to memory exhaustion on Render's free tier.

## Root Causes Identified

1. **Database Connection Pool**: Too many connections (max: 10) consuming memory
2. **Unlimited Cache Growth**: PMProService cache Map growing indefinitely
3. **Request Throttle Map**: Growing without proper cleanup
4. **Migrations on Every Start**: Running migrations script on every server start
5. **No Database Connection Cleanup**: Connections not properly closed on shutdown
6. **No Memory Monitoring**: Health check didn't show memory usage

## Solutions Applied

### 1. Reduced Database Connection Pool
- **Before**: `min: 2, max: 10`
- **After**: `min: 0, max: 5`
- Added connection pool timeouts and cleanup settings
- **Impact**: ~50% reduction in connection pool memory usage

### 2. Cache Size Limiting
- Added `MAX_CACHE_SIZE = 1000` to PMProService
- Implemented automatic cleanup of old cache entries
- Periodic cleanup every 5 minutes
- **Impact**: Prevents unlimited memory growth

### 3. Optimized Request Throttle
- Reduced cleanup threshold from 1000 to 500 entries
- More aggressive cleanup (5x window instead of 10x)
- **Impact**: Faster cleanup of throttle entries

### 4. Removed Migrations from Start Script
- **Before**: `"start": "node run-migrations.js ; node src/server.js"`
- **After**: `"start": "node src/server.js"`
- Migrations should only run manually or via migration endpoint
- **Impact**: Faster startup, no unnecessary DB queries on every restart

### 5. Graceful Shutdown
- Added proper database connection cleanup on shutdown
- Handles SIGTERM, SIGINT, uncaught exceptions
- Closes database pool before exit
- **Impact**: Prevents connection leaks

### 6. Enhanced Health Check
- Added database connectivity check with timeout
- Added memory usage metrics (heap, RSS)
- Shows memory consumption in MB
- **Impact**: Better monitoring and debugging

## Memory Usage Improvements

### Before
- Database pool: ~10 connections × ~2MB each = ~20MB
- Unlimited cache growth potential
- No cleanup mechanisms
- Migrations running on every start

### After
- Database pool: ~5 connections × ~2MB each = ~10MB (50% reduction)
- Cache limited to 1000 entries with automatic cleanup
- Aggressive cleanup of throttle maps
- No migrations on start

## Expected Results

1. **Lower Memory Footprint**: ~30-40% reduction in baseline memory
2. **Stable Memory Usage**: No unlimited growth
3. **Faster Startup**: No migrations on every start
4. **Better Monitoring**: Health check shows memory usage
5. **Proper Cleanup**: Connections closed on shutdown

## Monitoring

Check memory usage via health endpoint:
```bash
GET /health
```

Response includes:
```json
{
  "status": "ok",
  "database": "connected",
  "memory": {
    "used": 45,  // MB
    "total": 60, // MB
    "rss": 120   // MB (Resident Set Size - total memory)
  }
}
```

## Render Free Tier Limits

- **Memory**: 512 MB RAM
- **CPU**: 0.1 CPU cores
- **Sleep**: Services sleep after 15 minutes of inactivity

## Additional Recommendations

1. **Monitor Memory**: Check `/health` endpoint regularly
2. **Upgrade Plan**: Consider Render paid plan if memory issues persist
3. **Cache Strategy**: Consider Redis for cache instead of in-memory (if available)
4. **Database**: Monitor connection pool usage
5. **Logs**: Check Render logs for memory-related errors

## Files Changed

- `src/db/knex.js` - Reduced connection pool, added timeouts
- `src/services/pmproService.js` - Added cache size limit and cleanup
- `src/routes/members.js` - Optimized throttle cleanup
- `src/server.js` - Added graceful shutdown
- `src/app.js` - Enhanced health check with memory metrics
- `package.json` - Removed migrations from start script

