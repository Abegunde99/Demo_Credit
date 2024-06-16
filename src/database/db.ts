import { knex } from 'knex';
import config from '../knexfile';

const _knex = knex(config);

export default _knex;