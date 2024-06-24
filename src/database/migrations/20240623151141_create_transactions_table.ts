import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.integer('senderId').unsigned().references('id').inTable('users');
    table.integer('userId').unsigned().notNullable().references('id').inTable('users');
    table.integer('receiverId').unsigned().references('id').inTable('users');
    table.decimal('amount', 14, 2).notNullable();
    table.string('reference').notNullable();
    table.string('transactionType').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
}


