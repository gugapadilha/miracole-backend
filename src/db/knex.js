const knex = require('knex');
const config = require('../config');

// Detect database type by port (5432 = PostgreSQL, 3306 = MySQL)
const isPostgreSQL = config.database.port === 5432 || config.database.port === '5432';
const dbClient = isPostgreSQL ? 'pg' : 'mysql2';

// Determine if SSL should be enabled for PostgreSQL
// Render and most cloud providers require SSL for PostgreSQL
const shouldEnableSSL = isPostgreSQL && (
  process.env.NODE_ENV === 'production' ||
  process.env.ENABLE_SSL === 'true' ||
  config.database.host !== 'localhost'
);

const dbConfig = {
  client: dbClient,
  connection: isPostgreSQL ? {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    ssl: shouldEnableSSL ? { rejectUnauthorized: false } : false
  } : {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    charset: config.database.charset
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: '../migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: '../seeds'
  }
};

const db = knex(dbConfig);

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = db;
