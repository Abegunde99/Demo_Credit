import { IWallet, IWalletTf, Data, IWalletDataSave, WalletTransfer, WalletTransferEmail } from "../interface";
import WalletRepository from "../repository/wallet";
import { ErrorResponse } from "../utils/errorResponse";
import UserRepository from "../repository/user";
import PaystackService from "./paystack";
import UserService from "../services/user";
import TransactionService from "./transaction";
import { v4 as uuidv4 } from 'uuid';

class WalletService {
    async create(body: Omit<IWallet, "id" | "balance">): Promise<boolean> {
        const user = await WalletRepository.findByUser(body.userId);
        if (user) {
            throw new ErrorResponse("wallet already exists for this user", 400);
        }
        return await WalletRepository.createWallet({...body});
    }

    async getMyWallet(id: number): Promise<IWallet | undefined> {
        const wallet = await WalletRepository.findByUser(id);
        if (!wallet) {
            throw new ErrorResponse("wallet not found", 404);
        }
        return wallet;
    }

    async getMyWalletSave(id: number): Promise<IWalletDataSave | undefined> {
        const wallet = await WalletRepository.findByUserWithSave(id);
        if (!wallet) {
            throw new ErrorResponse("wallet not found", 404);
        }
        return wallet;
    }

    async fund(id: number, amount: number): Promise<any> {
        const user = await UserService.getOneByID(id);
        if (user) {
            const payload = await PaystackService.initializePayment(user.email, amount);
            return payload;
        } else {
            throw new ErrorResponse("User not found", 404);
        }
    }

    async verifyPayment(reference: string): Promise<any> {
        const transaction = await TransactionService.getTransactionsByRef(reference);
        if (transaction) {
            throw new ErrorResponse("Transaction already completed", 400);
        }
        const payload = await PaystackService.validatePayment(reference);
        const getUser = await UserService.getOneByEmail((payload.data.customer as any).email);
        if (getUser) {
            const wallet = await WalletRepository.findByUserWithSave(getUser.id);
            if (wallet) {
                wallet.balance += (payload.data.amount as number) / 100;
                await wallet.save();
                await TransactionService.create({ userId: getUser.id, receiverId: getUser.id, amount: (payload.data.amount as number) / 100, reference, transactionType: "Credit" });
            }
        }
        return payload;
    }

    async transfer(userId: number, data: WalletTransfer): Promise<any> {
        const trx = await WalletRepository.startTransaction();

        try {
            const senderWallet = await this.getMyWalletSave(userId);
            if (!senderWallet) {
                throw new ErrorResponse("You don't have a wallet", 404);
            }
            const recipientInfo = await UserRepository.findByAccountNumber(data.accountNumber);
            if (userId === recipientInfo?.id) {
                throw new ErrorResponse("Cannot send from the same account", 400);
            }
            if (!recipientInfo) {
                throw new ErrorResponse("No user with such accountNumber", 404);
            } else {
                const recipientWallet = await WalletRepository.findByUserWithSave(recipientInfo.id);
                if (!recipientWallet) {
                    throw new ErrorResponse("Receiver doesn't have a wallet", 404);
                }
                if (data.amount === 0) {
                    throw new ErrorResponse("Cannot transfer this amount", 400);
                }
                if (senderWallet.balance < data.amount) {
                    throw new ErrorResponse("Insufficient balance", 400);
                }

                senderWallet.balance -= data.amount;
                recipientWallet.balance += data.amount;

                await WalletRepository.saveWallet(senderWallet, trx);
                await WalletRepository.saveWallet(recipientWallet, trx);

                const trxRef = uuidv4();
                await TransactionService.createWithoutRefCheck({ userId, senderId: userId, receiverId: recipientInfo.id, amount: data.amount, reference: trxRef, transactionType: "Debit" });
                await TransactionService.createWithoutRefCheck({ userId: recipientInfo.id, senderId: userId, receiverId: recipientInfo.id, amount: data.amount, reference: trxRef, transactionType: "Credit" });

                await trx.commit();
                return { message: "Transfer successful" };
            }
        } catch (error) {
            await trx.rollback();
            throw error;
        } finally {
            trx.destroy();
        }
    }

    async transferWithEmail(userId: number, data: WalletTransferEmail): Promise<any> {
        const trx = await WalletRepository.startTransaction();

        try {
            const senderWallet = await this.getMyWalletSave(userId);
            if (!senderWallet) {
                throw new ErrorResponse("You don't have a wallet", 404);
            }
            const recipientInfo = await UserRepository.findByEmail(data.email);
            if (userId === recipientInfo?.id) {
                throw new ErrorResponse("Cannot send from the same account", 400);
            }
            if (!recipientInfo) {
                throw new ErrorResponse("No user with such email", 404);
            } else {
                const recipientWallet = await WalletRepository.findByUserWithSave(recipientInfo.id);
                if (!recipientWallet) {
                    throw new ErrorResponse("Receiver doesn't have a wallet", 404);
                }
                if (data.amount === 0) {
                    throw new ErrorResponse("Cannot transfer this amount", 400);
                }
                if (senderWallet.balance < data.amount) {
                    throw new ErrorResponse("Insufficient balance", 400);
                }

                senderWallet.balance -= data.amount;
                recipientWallet.balance += data.amount;

                await WalletRepository.saveWallet(senderWallet, trx);
                await WalletRepository.saveWallet(recipientWallet, trx);

                const trxRef = uuidv4();
                await TransactionService.createWithoutRefCheck({ userId, senderId: userId, receiverId: recipientInfo.id, amount: data.amount, reference: trxRef, transactionType: "Debit" });
                await TransactionService.createWithoutRefCheck({ userId: recipientInfo.id, senderId: userId, receiverId: recipientInfo.id, amount: data.amount, reference: trxRef, transactionType: "Credit" });

                await trx.commit();
                return { message: "Transfer successful" };
            }
        } catch (error) {
            await trx.rollback();
            throw error;
        } finally {
            trx.destroy();
        }
    }
}

export default new WalletService();
