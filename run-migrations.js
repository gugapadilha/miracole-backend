#!/usr/bin/env node

/**
 * Run database migrations for MiraCole+ Backend
 * 
 * This script will create the required tables in your MySQL database.
 * Make sure your .env file is configured with the correct database settings.
 */

const knex = require('knex');
const path = require('path');
require('dotenv').config();

// Detect database type by port (5432 = PostgreSQL, 3306 = MySQL)
const dbPort = parseInt(process.env.DB_PORT || '3306');
const isPostgreSQL = dbPort === 5432;
const dbClient = isPostgreSQL ? 'pg' : 'mysql2';

// Check if SSL should be enabled (via ENABLE_SSL env var or production mode)
const enableSSL = process.env.ENABLE_SSL === 'true' || process.env.NODE_ENV === 'production';

// Database configuration
const dbConfig = {
  client: dbClient,
  connection: isPostgreSQL ? {
    host: process.env.DB_HOST || 'localhost',
    port: dbPort,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'miracole_api',
    ssl: enableSSL ? { rejectUnauthorized: false } : false
  } : {
    host: process.env.DB_HOST || 'localhost',
    port: dbPort,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'miracole_api',
    charset: 'utf8mb4'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: path.join(__dirname, 'src', 'migrations'),
    tableName: 'knex_migrations'
  }
};

async function runMigrations() {
  console.log('🚀 Starting MiraCole+ database migrations...\n');
  
  try {
    // Check if database connection variables are set
    if (!process.env.DB_HOST || process.env.DB_HOST === 'localhost') {
      console.log('⚠️  DB_HOST not configured or is localhost. Skipping migrations.');
      console.log('💡 Configure DB_HOST in Render Environment Variables to run migrations.');
      return;
    }
    // Create database if it doesn't exist (MySQL only, PostgreSQL database must exist)
    if (!isPostgreSQL) {
      const dbWithoutDatabase = knex({
        ...dbConfig,
        connection: {
          ...dbConfig.connection,
          database: undefined
        }
      });
      
      await dbWithoutDatabase.raw(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.connection.database}\``);
      console.log(`✅ Database '${dbConfig.connection.database}' created/verified`);
      
      await dbWithoutDatabase.destroy();
    } else {
      console.log(`✅ Using PostgreSQL database: ${dbConfig.connection.database}`);
    }
    
    // Connect to the specific database
    const db = knex(dbConfig);
    
    // Test connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Run migrations
    console.log('\n📦 Running migrations...');
    const [batchNo, log] = await db.migrate.latest();
    
    if (log.length === 0) {
      console.log('✅ All migrations are up to date');
    } else {
      console.log(`✅ Migrated to batch ${batchNo}:`);
      log.forEach(migration => {
        console.log(`   - ${migration}`);
      });
    }
    
    // Show created tables
    console.log('\n📋 Created tables:');
    if (isPostgreSQL) {
      const tables = await db.raw(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      const tables = await db.raw('SHOW TABLES');
      tables[0].forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
    }
    
    await db.destroy();
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('\nFull error:', error);
    }
    console.error('\n💡 Troubleshooting:');
    console.error('1. Verify database connection settings in Environment Variables:');
    console.error('   - DB_HOST (should be: dpg-xxxxx.oregon-postgres.render.com)');
    console.error('   - DB_PORT (5432 for PostgreSQL, 3306 for MySQL)');
    console.error('   - DB_USER');
    console.error('   - DB_PASS');
    console.error('   - DB_NAME');
    console.error('\n2. If running on Render, make sure:');
    console.error('   - Database is created in Render Dashboard');
    console.error('   - DB_HOST is the FULL database hostname (NOT just the prefix)');
    console.error('   - Database is accessible from your service');
    console.error('\n⚠️  Server will start anyway, but migrations need to be run manually.');
    console.error('💡 You can retry migrations by restarting the service after fixing DB_HOST.');
    // Don't exit - let the server start anyway
    // process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
