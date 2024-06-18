import { knex } from 'knex';
import config from '../knexfile';
import dotenv from 'dotenv';
dotenv.config();

const _knex = knex(config);

export default _knex;