const knex = require('knex');
const config = require('../config');

const dbConfig = {
  client: 'mysql2',
  connection: {
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
