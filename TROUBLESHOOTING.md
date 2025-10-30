# Troubleshooting Guide

## ✅ PowerShell Execution Policy Issue - SOLVED

### Problem
When running `npm` commands in PowerShell, you got this error:
```
npm : O arquivo C:\Program Files\nodejs\npm.ps1 não pode ser carregado porque a execução de scripts foi desabilitiada neste sistema.
```

### Solution
Use `npm.cmd` instead of `npm`:

```powershell
# Instead of:
npm install
npm run dev

# Use:
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" run dev
```

### Alternative Solutions

#### Option 1: Change Execution Policy (Requires Admin Rights)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Option 2: Bypass for Current Session
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

---

## ✅ Rate Limiting Issues - SOLVED

### Problem
Health check endpoint was returning "Too Many Requests" errors.

### Solution
Two fixes were applied:

1. **Memory-based fallback**: Added fallback to `RateLimiterMemory` when Redis is not available
2. **Health check exclusion**: Moved health check endpoint before rate limiting middleware
3. **Development override**: In development, global and per-route limiters are disabled to prevent 429 during local tests. In production they are enabled.

### Files Modified
- `src/middlewares/rateLimit.js` - Added memory-based fallback
- `src/app.js` - Moved health check before rate limiting

### Test
```powershell
Invoke-WebRequest -Uri http://localhost:4000/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected response:
```json
{"status":"OK","timestamp":"2025-10-28T20:23:34.521Z","environment":"development"}
```

---

## 📋 Common Issues

### Redis Connection Error
If you see "Redis connection failed", don't worry! The rate limiter will automatically fall back to memory-based limiting.

### Database Connection Error
```powershell
# Verify MySQL is running
# Check .env file has correct credentials
```

### Port Already in Use
```powershell
# Kill all Node processes
Get-Process node | Stop-Process -Force
```

### Cannot Find Module
```powershell
# Reinstall dependencies
& "C:\Program Files\nodejs\npm.cmd" install
```

---

## 🔗 Plans Endpoint 502 / Fallback

If `/api/plans` returns 502 locally, WordPress may be blocking `wp-json`. During development a safe fallback list (IDs 2,3,7,8,9) is returned. In production ensure `https://miracoleplus.com/wp-json/pmpro/v1/levels` is reachable.

---

## 🚀 Running the Server

### Development Mode
```powershell
cd C:\Users\guga\Desktop\miracole-backend\miracole-backend
& "C:\Program Files\nodejs\npm.cmd" run dev
```

### Production Mode
```powershell
cd C:\Users\guga\Desktop\miracole-backend\miracole-backend
node src/server.js
```

### Test Server
```powershell
# Health check
Invoke-WebRequest -Uri http://localhost:4000/health -UseBasicParsing

# Or with curl (if available)
curl http://localhost:4000/health
```

---

## 🔧 Quick Fixes

### Reset Everything
```powershell
# Stop server
Get-Process node | Stop-Process -Force

# Clean and reinstall
Remove-Item -Recurse -Force node_modules
& "C:\Program Files\nodejs\npm.cmd" install

# Restart server
node src/server.js
```

### View Logs
```powershell
# Error logs
Get-Content logs/error.log -Tail 20

# All logs
Get-Content logs/combined.log -Tail 20
```

---

**Server is now running at:** http://localhost:4000

Thanks Guga! 🎉

