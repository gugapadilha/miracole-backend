exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.integer('wp_user_id').notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('display_name', 255);
    table.string('subscription_level', 50);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes for better performance
    table.index('wp_user_id');
    table.index('email');
    table.index('subscription_level');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
