const express = require('express');
const router = express.Router();
const db = require('../db/knex');

// Security: require secret via query param or header
const MIGRATE_SECRET = process.env.MIGRATE_SECRET || 'temporary_dev_secret_change_me';

/**
 * Temporary migration endpoint
 * 
 * ⚠️ WARNING: This endpoint should be REMOVED after migrations are complete!
 * 
 * Usage:
 * GET /api/migrate?secret=YOUR_MIGRATE_SECRET
 * 
 * Or via header:
 * GET /api/migrate
 * Header: x-migrate-secret: YOUR_MIGRATE_SECRET
 */
router.get('/migrate', async (req, res) => {
  const secret = req.query.secret || req.get('x-migrate-secret');

  if (!secret || secret !== MIGRATE_SECRET) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Invalid or missing migration secret' 
    });
  }

  try {
    console.log('🔄 Starting database migrations...');

    // Test database connection first
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');

    // Run migrations
    const [batchNo, log] = await db.migrate.latest();

    if (log.length === 0) {
      console.log('✅ All migrations are up to date');
      return res.json({ 
        success: true, 
        message: 'All migrations are up to date',
        batch: batchNo,
        migrations: []
      });
    }

    console.log(`✅ Migrated to batch ${batchNo}:`);
    log.forEach(migration => {
      console.log(`   - ${migration}`);
    });

    // Get list of created tables (PostgreSQL)
    const isPostgreSQL = process.env.DB_PORT === '5432' || process.env.DB_PORT === 5432;
    let tables = [];

    if (isPostgreSQL) {
      const result = await db.raw(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      tables = result.rows.map(row => row.table_name);
    } else {
      const result = await db.raw('SHOW TABLES');
      tables = result[0].map(table => Object.values(table)[0]);
    }

    return res.json({ 
      success: true, 
      message: 'Migrations executed successfully',
      batch: batchNo,
      migrations: log,
      tables: tables
    });

  } catch (err) {
    console.error('❌ Migration error:', err);
    return res.status(500).json({ 
      error: 'Migration failed', 
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;

