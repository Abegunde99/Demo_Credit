import { Request, Response } from 'express';
import { Knex } from 'knex';

// General Types
export type Data<T = unknown> = {
    [key: string]: T;
};

export type WalletTransfer = {
    accountNumber: number;
    amount: number;
}

export type WalletTransferEmail = {
    email: string;
    amount: number;
}

// Response Interface
export interface IResponseData<T = unknown> {
    status: number;
    message: string;
    data: Data<T>;
}

export interface KResponseData<T = unknown> {
    status: string;
    message: string;
    data: T;
    meta: Meta;
}

export interface Meta {
    cost: number;
    balance: number;
}

export interface kData {
    karma_identity: string;
    amount_in_contention: string;
    reason: string | null;
    default_date: string;
    karma_type: KarmaType;
    karma_identity_type: KarmaIdentityType;
    reporting_entity: ReportingEntity;
}

export interface KarmaType {
    karma: string;
}

export interface KarmaIdentityType {
    identity_type: string;
}

export interface ReportingEntity {
    name: string;
    email: string;
}

export interface IKarmaResponse {
    status: string;
    message: string;
    meta: {
      balance: number;
    };
  }
  

// User Interfaces
export interface IUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    accountNumber: number;
}

export interface IData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    accountNumber: number;
}

export interface IDataWPass {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    accessToken: string;
}

export interface IUserData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    accessToken: string;
    accountNumber: number;
}

export interface IUserDataWHToken {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    accountNumber: number;
}

// User Repository Interface
export interface IUserRepository {
    createUser(user: Omit<IUser, "id">): Promise<number>;
    findByEmail(email: string): Promise<IUser | null>;
}

// User Service Interface
export interface IUserService {
    register(body: Omit<IUser, "id">): Promise<IUserData | undefined>;
    login(data: Pick<IUser, "email" | "password">): Promise<IUserData | undefined>;
    hashPassword(password: string): Promise<string>;
    getOneByEmail(email: string): Promise<IUser | null>;
    isValidPassword(inputtedPassword: string, savedPassword: string): Promise<boolean>;
}

// User Controller Interface
export interface IUserController {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
}

// Wallet Interfaces
export interface IWalletData {
    userId: number;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
    id: number;
}

export interface IWalletDataSave {
    userId: number;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
    id: number;
    save(): Promise<this>;
}

export interface IWalletDataSaveWithSession {
    userId: number;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
    id: number;
    save(): Promise<this>;
    session?: Knex.Transaction;
}

export interface IWallet {
    userId: number;
    balance: number;
    id: number;
}

export interface IWalletTf {
    userId: number;
    balance: number;
}

// JWT Interface
export interface UserJWT {
    _id: number;
    iat: number;
    exp: number;
}

// Custom Request Interface
export interface CustomRequest extends Request {
    user?: UserJWT; // Define the 'user' property
}

// Transaction Interfaces
export interface ITransaction {
    senderId?: number;
    userId: number;
    receiverId?: number;
    amount: number;
    reference: string;
    transactionType: string;
}

export interface ITransactionData {
    id: number;
    senderId?: number;
    userId: number;
    receiverId?: number;
    amount: number;
    reference: string;
    transactionType: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CustomError extends Error {
    code?: string;
    value?: string;
    statusCode?: number;
}
