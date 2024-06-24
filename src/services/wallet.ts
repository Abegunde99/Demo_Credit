import { IWallet, IWalletTf, Data, IWalletDataSave, WalletTransfer, WalletTransferEmail } from "../interface";
import WalletRepository from "../repository/wallet";
import { ErrorResponse } from "../utils/errorResponse";
import ErrorMiddleware from "../middlewares/error2";
import UserRepository from "../repository/user";
import PaystackService from "./paystack";
import UserService from "../services/user";
import TransactionService from "./transaction";
import { v4 as uuidv4 } from 'uuid';

class WalletService {
    async create(body: Omit<IWallet, "id" | "balance">): Promise<boolean> {
        const user = await WalletRepository.findByUser(body.userId);
        if (user) {
            ErrorMiddleware.errorHandler("wallet already exists for this user", 400);
        }
        return await WalletRepository.createWallet({ ...body });
    }

    async getMyWallet(id: number): Promise<IWallet | null> {
        const wallet = await WalletRepository.findByUser(id);
        if (!wallet) {
            ErrorMiddleware.errorHandler("wallet not found", 404);
        }
        return wallet;
    }

    async getMyWalletSave(id: number): Promise<IWalletDataSave | null> {
        const wallet = await WalletRepository.findByUserWithSave(id);
        if (!wallet) {
            ErrorMiddleware.errorHandler("wallet not found", 404);
        }
        return wallet;
    }

    async fund(id: number, amount: number): Promise<any> {
        const user = await UserService.getOneByID(id);
        if (user) {
            const payload = await PaystackService.initializePayment(user.email, amount);
            return payload;
        } else {
            ErrorMiddleware.errorHandler("User not found", 404);
        }
    }

    async verifyPayment(reference: string): Promise<any> {
        const transaction = await TransactionService.getTransactionsByRef(reference);
        if (transaction) {
            ErrorMiddleware.errorHandler("Transaction already completed", 400);
        }
        const payload = await PaystackService.validatePayment(reference);
        const getUser = await UserService.getOneByEmail((payload.data.customer as any).email);
        if (getUser) {
            const wallet = await WalletRepository.findByUserWithSave(getUser.id);
            if (wallet) {
                wallet.balance += (payload.data.amount as number) / 100;
                const user: IWalletTf = {
                    userId: getUser.id,
                    balance: wallet.balance
                }
                await WalletRepository.updateWallet(user);
                await TransactionService.create({ userId: getUser.id, receiverId: getUser.id, amount: (payload.data.amount as number) / 100, reference, transactionType: "Credit" });
            }
        }
        return payload;
    }

    async transfer(userId: number, data: WalletTransfer): Promise<any> {
        const senderWallet = await this.getMyWallet(userId);
        console.log({senderWallet})
        if (!senderWallet) {
            throw new ErrorResponse("You don't have a wallet", 404);
        }
        const recipientInfo = await UserRepository.findByAccountNumber(data.accountNumber);
        if (userId === recipientInfo?.id) {
            throw new ErrorResponse("Cannot send from the same account", 400);
        }
        console.log({recipientInfo})
        if (!recipientInfo) {
            throw new ErrorResponse("No user with such accountNumber", 404);
        } else {
            const recipientWallet = await WalletRepository.findByUser(recipientInfo.id);
            console.log({recipientWallet})
            if (!recipientWallet) {
                throw new ErrorResponse("Receiver doesn't have a wallet", 404);
            }
            if (data.amount === 0) {
                throw new ErrorResponse("Cannot transfer this amount", 400);
            }
            if (senderWallet.balance < data.amount) {
                throw new ErrorResponse("Insufficient balance", 400);
            }

            const senderBalance = senderWallet.balance -= data.amount;
            const recipientBalance = recipientWallet.balance += data.amount;

            const sender: IWalletTf = {
                userId,
                balance: senderBalance
            }

            const recipient: IWalletTf = {
                userId: recipientInfo.id,
                balance: recipientBalance
            }

            //update wallets
            await WalletRepository.updateWallet(sender);
            await WalletRepository.updateWallet(recipient);

            const trxRef = uuidv4();
            await TransactionService.createWithoutRefCheck({ userId, senderId: userId, receiverId: recipientInfo.id, amount: data.amount, reference: trxRef, transactionType: "Debit" });
            await TransactionService.createWithoutRefCheck({ userId: recipientInfo.id, senderId: userId, receiverId: recipientInfo.id, amount: data.amount, reference: trxRef, transactionType: "Credit" });

            return { message: "Transfer successful" };
        }
    }

    async transferWithEmail(userId: number, data: WalletTransferEmail): Promise<any> {
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
            const recipientWallet = await WalletRepository.findByUser(recipientInfo.id);
            if (!recipientWallet) {
                throw new ErrorResponse("Receiver doesn't have a wallet", 404);
            }
            if (data.amount === 0) {
                throw new ErrorResponse("Cannot transfer this amount", 400);
            }
            if (senderWallet.balance < data.amount) {
                throw new ErrorResponse("Insufficient balance", 400);
            }

            const senderBalance = senderWallet.balance -= data.amount;
            const recipientBalance = recipientWallet.balance += data.amount;

            const sender: IWalletTf = {
                userId,
                balance: senderBalance
            }

            const recipient: IWalletTf = {
                userId: recipientInfo.id,
                balance: recipientBalance
            }

            //update wallets
            await WalletRepository.updateWallet(sender);
            await WalletRepository.updateWallet(recipient);

            const trxRef = uuidv4();
            await TransactionService.createWithoutRefCheck({ userId, senderId: userId, receiverId: recipientInfo.id, amount: data.amount, reference: trxRef, transactionType: "Debit" });
            await TransactionService.createWithoutRefCheck({ userId: recipientInfo.id, senderId: userId, receiverId: recipientInfo.id, amount: data.amount, reference: trxRef, transactionType: "Credit" });

            return { message: "Transfer successful" };
        }
    }

    async withdraw(userId: number, amount: number): Promise<any> {
        const user = await UserService.getOneByID(userId);
        if (user) {
            const wallet = await WalletRepository.findByUser(userId);
            if (wallet) {
                if (wallet.balance < amount) {
                    ErrorMiddleware.errorHandler("Insufficient balance", 400);
                }
                wallet.balance -= amount;
                const user: IWalletTf = {
                    userId,
                    balance: wallet.balance
                }
                await WalletRepository.updateWallet(user);
                return { message: "Withdrawal successful" };
            } else {
                ErrorMiddleware.errorHandler("Wallet not found", 404);
            }
        } else {
            ErrorMiddleware.errorHandler("User not found", 404);
        }
    }
}

export default new WalletService();
