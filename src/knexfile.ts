import { Knex } from 'knex';
import environ from './config/config';

const config: Knex.Config = {
  client: 'mysql2',
  useNullAsDefault: true,
  connection: {
    port: parseInt(environ.DB_PORT as string),                          
    host: environ.DB_HOST,
    user: environ.DB_USER,
    password: environ.DB_PASSWORD,
    database: environ.DB
  },
  migrations: {
    directory: './database/migrations'
  },
  seeds: {
    directory: './database/seeds'
  }
};

export default config;