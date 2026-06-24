exports.up = async function(knex) {
  await knex.schema.createTable('sites', t=>{
    t.increments('id').primary();
    t.string('name').notNullable();
  });
  await knex.schema.createTable('users', t=>{
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('email').notNullable().unique();
    t.string('password_hash').notNullable();
    t.string('role').notNullable().defaultTo('user');
    t.integer('site_id').unsigned().references('id').inTable('sites');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
  await knex.schema.createTable('items', t=>{
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('category');
    t.string('serial_number');
    t.integer('quantity').defaultTo(1);
    t.date('acquisition_date');
    t.string('condition');
    t.integer('site_id').unsigned().references('id').inTable('sites');
    t.integer('registered_by').unsigned().references('id').inTable('users');
    t.text('notes');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
  await knex.schema.createTable('photos', t=>{
    t.increments('id').primary();
    t.integer('item_id').unsigned().references('id').inTable('items').onDelete('CASCADE');
    t.string('file_path');
    t.string('thumb_path');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('photos');
  await knex.schema.dropTableIfExists('items');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('sites');
};
