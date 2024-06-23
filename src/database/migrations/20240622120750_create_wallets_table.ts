import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('wallets', (table) => {
    table.increments('id').primary();
    table.integer('user').notNullable();
    table.decimal('balance', 10, 2).defaultTo(0);
    table.timestamps(true, true);
    table.foreign('user').references('users.id').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('wallets');
}


