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
            .where({ user })
            .first();
        return result || null;
    }

    async findByUserWithSave(user: number): Promise<IWalletDataSave | null> {
        const result = await knex('wallets')
            .where({ user })
            .first();
        return result ? { ...result, save: async () => result } : null;
    }

    async updateWallet(user: IWalletTf): Promise<IWalletData | null> {
        const result = await knex('wallets')
            .where({ user: user.userId })
            .update({ balance: user.balance }, ['id', 'user', 'balance', 'createdAt', 'updatedAt']);
        return result.length ? result[0] : null;
    }

    async startTransaction(): Promise<Knex.Transaction> {
        return knex.transaction();
    }

    async saveWallet(wallet: any, trx: Knex.Transaction): Promise<void> {
        await knex('wallets')
            .where({ id: wallet.id })
            .update(wallet)
            .transacting(trx);
    }
}

export default new WalletRepository();
