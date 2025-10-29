exports.up = function(knex) {
  return knex.schema.createTable('refresh_tokens', function(table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.text('token').notNullable();
    table.boolean('revoked').defaultTo(false);
    table.datetime('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Foreign key constraint
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes for better performance
    table.index('user_id');
    table.index('token');
    table.index('expires_at');
    table.index('revoked');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('refresh_tokens');
};
