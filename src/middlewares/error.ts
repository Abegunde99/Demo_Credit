import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils/errorResponse';

interface CustomError extends Error {
    code?: string;
    value?: string;
    statusCode?: number;
}
const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    let error = { ...err };
    error.message = err.message;

    // SQL-specific error handling
    if (err.code && typeof err.code === 'string') {
        if (err.code.startsWith('ECONN')) {
            error = new ErrorResponse('Database connection error', 503);
        } else if (err.code === 'ER_DUP_ENTRY') {
            error = new ErrorResponse('Duplicate key value entered', 400);
        } else if (err.code === 'ER_NO_REFERENCED_ROW') {
            error = new ErrorResponse(`Resource not found with id of ${err.value}`, 404);
        } else if (err.code === 'ER_BAD_FIELD_ERROR') {
            error = new ErrorResponse('Invalid input', 400);
        } else if (err.code === 'ER_PARSE_ERROR') {
            error = new ErrorResponse('Invalid query syntax', 400);
        }
    }

    // Handle generic errors
    if (!error.statusCode) {
        console.error(err); // Log unexpected errors for debugging
        error = new ErrorResponse('Internal server error', 500);
    }

    res.status(error.statusCode as number).json({
        success: false,
        status: error.statusCode,
        error: error.message
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next();
};

export default errorHandler;
