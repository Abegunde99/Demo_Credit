import { IUser, IUserData, IUserDataWHToken, IUserService } from "../interface";
import { ErrorResponse } from "../utils/errorResponse";
import { genSalt, hash, compare } from "bcryptjs";
import JwtUtility from "../utils/jwt";
import UserRepository from "../repository/user";
import WalletService from "./wallet";
import { SHA256 } from 'crypto-js';

class UserService implements IUserService {
    generateUniqueNumber(): number {
        const randomNumber = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const data = `${Date.now()}${randomNumber}`;
        const hashedData = SHA256(data).toString();
        const uniqueNumberString = hashedData.substring(0, 10);
        const uniqueNumber = parseInt(uniqueNumberString, 16);
      
        return uniqueNumber;
    }

    userResponseObject(user: IUser) {
        return { 
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            id: user.id, 
            accessToken: JwtUtility.generateToken(user.id),
            accountNumber: user.accountNumber
        };
    }

    userResponseNoToken(user: IUser): IUserDataWHToken {
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            id: user.id,
            accountNumber: user.accountNumber
        };
    }

    async register(body: Omit<IUser, "id" | "accountNumber">): Promise<IUserData> {
        let user = await UserRepository.findByEmail(body.email);
        if (user) {
            throw new ErrorResponse("user already exists", 400);
        }
        body.password = await this.hashPassword(body.password);
        
        user =  await UserRepository.createUser({ ...body, accountNumber: this.generateUniqueNumber() });
        await WalletService.create({ userId: user.id});
        return this.userResponseObject(user);
    }

    // removePassword(body: IUser) {
    //     const { password, ...result } = body;
    //     return result;
    // }

    removePassword(body: IUser): Omit<IUser, 'password'> {
        const result = { ...body };
        // delete result.password;
        return result;
    }
    

    async hashPassword(password: string): Promise<string> {
        const salt = await genSalt(10);
        return await hash(password, salt);
    }

    async getOneByEmail(email: string): Promise<IUser | null> {
        const user = await UserRepository.findByEmail(email.toLowerCase());
        if (!user) {
            throw new ErrorResponse("user not found", 404);
        }
        return user;
    }

    async getEmailWithoutPassword(email: string): Promise<IUserDataWHToken | undefined> {
        const user = await this.getOneByEmail(email);
        if (user) {
            return this.userResponseNoToken(user);
        }
    }

    async getOneByID(id: number): Promise<IUser | null> {
        const user = await UserRepository.findById(id);
        if (!user) {
            throw new ErrorResponse("user not found", 404);
        }
        return user;
    }

    async getIdWithoutPassword(id: number): Promise<IUserDataWHToken | undefined> {
        const user = await this.getOneByID(id);
        if (user) {
            return this.userResponseNoToken(user);
        }
    }

    async getOneByAccountNumber(accountNumber: number): Promise<IUserDataWHToken | undefined> {
        const user = await UserRepository.findByAccountNumber(accountNumber);
        if (!user) {
            throw new ErrorResponse("user not found", 404);
        } else {
            return this.userResponseNoToken(user);
        }
    }

    async isValidPassword(inputtedPassword: string, savedPassword: string): Promise<boolean> {
        return await compare(inputtedPassword, savedPassword);
    }

    async login(data: Pick<IUser, "email" | "password">): Promise<IUserData | undefined> {
        const user = await this.getOneByEmail(data.email);
        if (user) {
            const validPassword = await this.isValidPassword(data.password, user.password);
            if (!validPassword) {
                throw new ErrorResponse("Invalid email or password", 400);
            }
            return this.userResponseObject(user);
        }
    }
}

export default new UserService();
