const app = require('./app');
const config = require('./config');
const db = require('./db/knex');

// Start the server
// Listen on 0.0.0.0 to allow external connections (required for Render)
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📱 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://0.0.0.0:${config.port}/health`);
});

// Graceful shutdown function
async function gracefulShutdown(signal) {
  console.log(`${signal} received, shutting down gracefully`);
  
  // Stop accepting new requests
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Close database connections
  try {
    await db.destroy();
    console.log('Database connections closed');
  } catch (err) {
    console.error('Error closing database connections:', err);
  }
  
  // Force exit after timeout
  setTimeout(() => {
    console.log('Forcing shutdown');
    process.exit(0);
  }, 10000); // 10 second timeout
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit on unhandled rejection, just log it
});

module.exports = server;
