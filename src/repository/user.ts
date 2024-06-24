import knex from '../database/db';
import { IData, IUser, IUserRepository } from '../interface';

class UserRepository implements IUserRepository {
  async createUser(item: Omit<IUser, "id">): Promise<number> {
      console.log({item})
    const [result] = await knex('users')
        .insert(item)
        .returning('*');
      console.log({result})
    return result;
  }

  async findById(id: number): Promise<IUser | null> {
    const result = await knex('users')
      .where({ id })
      .first();
    return result || null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const result = await knex('users')
      .where({ email })
      .first();
    return result || null;
  }

  async findByAccountNumber(accountNumber: number): Promise<IUser | null> {
    const result = await knex('users')
      .where({ accountNumber })
      .first();
    return result || null;
  }
}

export default new UserRepository();
