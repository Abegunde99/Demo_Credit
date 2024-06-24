import knex from '../database/db';
import { IWallet, IWalletData, IWalletTf, IWalletDataSave } from '../interface';
import {Knex} from 'knex';

class WalletRepository {
    async createWallet(item: Omit<IWallet, "id" | "balance">): Promise<boolean> {
        const [result] = await knex('wallets')
            .insert(item)
            .returning('*');
        return !!result;
    }
    
    async findByUser(user: number): Promise<IWalletData | null> {
        const result = await knex('wallets')
            .where({ userId: user })
            .first();
        return result || null;
    }

    async findByUserWithSave(user: number): Promise<IWalletDataSave | null> {
        const result = await knex('wallets')
            .where({ userId: user })
            .first();
        return result ? { ...result, save: async () => result } : null;
    }

    async updateWallet(user: IWalletTf): Promise<IWalletData | null> {
        const result = await knex('wallets')
            .where({ userId: user.userId })
            .update({ balance: user.balance }, ['id', 'userId', 'balance', 'createdAt', 'updatedAt']);
        return result.length ? result[0] : null;
    }
}

export default new WalletRepository();
