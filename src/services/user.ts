import { IUser, IUserData, IUserDataWHToken, IUserService } from "../interface";
import { ErrorResponse } from "../utils/errorResponse";
import ErrorMiddleware from "../middlewares/error2";
import { genSalt, hash, compare } from "bcryptjs";
import JwtUtility from "../utils/jwt";
import UserRepository from "../repository/user";
import WalletService from "./wallet";
import KarmaService from './karma';
import { SHA256 } from 'crypto-js';

class UserService implements IUserService {
    generateUniqueNumber(): number {
        const randomNumber = Math.floor(Math.random() * 1e9); // Generate a random number with up to 9 digits
        const timestamp = Date.now();
        const data = `${timestamp}${randomNumber}`;
        const hashedData = SHA256(data).toString();
        const uniqueNumberString = hashedData.substring(0, 9);
        const uniqueNumber = parseInt(uniqueNumberString, 16);
        
        // Ensure the number is within the range of 9 digits
        const maxNineDigitNumber = 999999999;
        return uniqueNumber % maxNineDigitNumber;
    }

    async userResponseObject(id: number): Promise<IUserData | undefined> {
        const user = await this.getOneByID(id);
        if (user) {
            return {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                id: user.id,
                accessToken: JwtUtility.generateToken(user.id),
                accountNumber: user.accountNumber
            };
        }
    }

    userResponseObject1(user: IUser): IUserData {
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

    async register(body: Omit<IUser, "id" | "accountNumber">): Promise<IUserData | undefined> {
        const user = await UserRepository.findByEmail(body.email);
        if (user) {
            ErrorMiddleware.errorHandler("user already exists", 400);
        }
        body.password = await this.hashPassword(body.password);

        //check if user is karma blacklisted
        const response = await KarmaService.checkKarma(body.email);
        if (response) {
            ErrorMiddleware.errorHandler("user is blacklisted", 400);
        }
        
        const createdUser = await UserRepository.createUser({ ...body, accountNumber: this.generateUniqueNumber() });
        await WalletService.create({ userId: createdUser });
        return this.userResponseObject(createdUser);
    }

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
            ErrorMiddleware.errorHandler("user not found", 404);
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
            ErrorMiddleware.errorHandler("user not found", 404);
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
                // throw new ErrorResponse("Invalid email or password", 400);
                ErrorMiddleware.errorHandler("Invalid email or password", 400);
            }
            return this.userResponseObject1(user);
        }
    }
}

export default new UserService();
