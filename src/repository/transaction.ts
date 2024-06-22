import knex from '../database/db';
import { ITransaction, ITransactionData } from '../interface';

class TransactionRepository {
  async createTransaction(item: ITransaction): Promise<ITransactionData> {
    const [result] = await knex('transactions')
      .insert(item)
      .returning('*');
    return result;
  }

  async findByUserId(id: number): Promise<ITransactionData[]> {
    const results = await knex('transactions')
      .where({ userId: id })
      .select('*');
    return results;
  }

  async findByReference(reference: string): Promise<ITransactionData | null> {
    const result = await knex('transactions')
      .where({ reference })
      .first();
    return result || null;
  }
}

export default new TransactionRepository();
