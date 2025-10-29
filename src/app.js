const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { generalRateLimit } = require('./middlewares/rateLimit');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://miracoleplus.com', 'https://www.miracoleplus.com']
    : true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(requestLogger);

// Health check endpoint (before rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Rate limiting middleware (apply to all other routes)
app.use(generalRateLimit);

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/device', require('./routes/device'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/me', require('./routes/me'));
app.use('/api/plans', require('./routes/plans'));

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

module.exports = app;
