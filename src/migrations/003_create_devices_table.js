exports.up = function(knex) {
  return knex.schema.createTable('devices', function(table) {
    table.increments('id').primary();
    table.integer('user_id').nullable();
    table.string('device_code', 16).notNullable().unique();
    table.boolean('linked').defaultTo(false);
    table.datetime('expires_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign key constraint
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    
    // Indexes for better performance
    table.index('user_id');
    table.index('device_code');
    table.index('linked');
    table.index('expires_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('devices');
};
