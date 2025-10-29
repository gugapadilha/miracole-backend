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

// Database configuration
const dbConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
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
    // Create database if it doesn't exist
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
    const tables = await db.raw('SHOW TABLES');
    tables[0].forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    await db.destroy();
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
