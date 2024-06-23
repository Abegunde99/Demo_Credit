import { Request, Response, NextFunction } from "express";
import { CustomRequest, Data, UserJWT } from "../interface";
import JwtUtility from "../utils/jwt";
import { ErrorResponse } from "../utils/errorResponse";



class AuthMiddleware {
  authorize(req: CustomRequest, res: Response, next: NextFunction) {
    const header: any = req.header("Authorization");
    if (!header) {
        return next(new ErrorResponse("No bearer token provided", 401));
    }
    const token = header.split(" ")[1];
      if (!token)
        return next(new ErrorResponse("Access Denied: No token provided", 401));
    try {
      req.user = JwtUtility.validateToken(token, process.env.JWT_SECRET as string) as UserJWT;
      next();
    } catch (err) {
        throw new ErrorResponse("Invalid token", 400);
    }
  }

  checkParams(req: CustomRequest, res: Response, next: NextFunction) {
    const reference = req.query.reference
    if(!reference){
        return next(new ErrorResponse("No reference to validate transaction", 400));
    }
    next();
  }

  checkEmailParams(req: CustomRequest, res: Response, next: NextFunction) {
    const reference = req.query.email
    if(!reference){
        return next(new ErrorResponse("No email to validate transaction", 400));
    }
    next();
  }

  checkAccountNumberParams(req: CustomRequest, res: Response, next: NextFunction) {
    const accountNumber = req.query.accountNumber
    if(!accountNumber){
        return next(new ErrorResponse("No account number to validate transaction", 400));
    }
    next();
  }
}

export default new AuthMiddleware();