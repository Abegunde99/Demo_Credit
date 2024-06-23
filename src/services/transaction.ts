import { ITransaction, ITransactionData } from "../interface";
import { ErrorResponse } from "../utils/errorResponse";
import TransactionRepository from "../repository/transaction";

class TransactionService {
    async create(body: ITransaction): Promise<ITransactionData> {
        const transaction = await TransactionRepository.findByReference(body.reference);
        if (transaction) {
           throw new ErrorResponse("Transaction already exists", 400);
        }
        return await TransactionRepository.createTransaction({...body});
        
    }

    async createWithoutRefCheck(body: ITransaction): Promise<ITransactionData> {
        return await TransactionRepository.createTransaction({...body});
        
    }

    async getMyTransactions(id: number): Promise<ITransactionData[]> {
        const transaction = await TransactionRepository.findByUserId(id);
        return transaction;
    }
    async getTransactionsByRef(reference: string): Promise<ITransactionData | null> {
        const transaction = await TransactionRepository.findByReference(reference);
        return transaction;
    }
}

export default new TransactionService();