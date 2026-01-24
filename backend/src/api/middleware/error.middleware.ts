import { Request, Response, NextFunction } from 'express';
import { logError } from '../../utils/logger';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public errorCode: string,
        message: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handling middleware
 */
export function errorHandler(
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    // Log error
    logError('Error occurred', err, {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
    });

    // Handle known AppError
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.errorCode,
            message: err.message,
            ...(err.details && { details: err.details }),
        });
        return;
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;

        if (prismaError.code === 'P2002') {
            res.status(409).json({
                error: 'CONFLICT_IDEMPOTENCY',
                message: 'Resource already exists',
                details: { field: prismaError.meta?.target },
            });
            return;
        }

        if (prismaError.code === 'P2025') {
            res.status(404).json({
                error: 'NOT_FOUND',
                message: 'Resource not found',
            });
            return;
        }
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(403).json({
            error: 'FORBIDDEN',
            message: 'Invalid authentication token',
        });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(403).json({
            error: 'FORBIDDEN',
            message: 'Authentication token expired',
        });
        return;
    }

    // Default to 500 server error
    res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message,
    });
}

/**
 * 404 handler for unknown routes
 */
export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        error: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
    });
}
