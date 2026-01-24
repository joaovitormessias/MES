import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logWarn } from '../../utils/logger';

/**
 * Middleware to validate request body against Zod schema
 */
export function validateBody(schema: AnyZodObject) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                logWarn('Validation error', { errors: error.errors, path: req.path });
                res.status(400).json({
                    error: 'VALIDATION_ERROR',
                    message: 'Request validation failed',
                    details: error.errors.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
            } else {
                next(error);
            }
        }
    };
}

/**
 * Middleware to validate query parameters against Zod schema
 */
export function validateQuery(schema: AnyZodObject) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                logWarn('Query validation error', { errors: error.errors, path: req.path });
                res.status(400).json({
                    error: 'VALIDATION_ERROR',
                    message: 'Query parameter validation failed',
                    details: error.errors.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
            } else {
                next(error);
            }
        }
    };
}

/**
 * Middleware to validate route parameters against Zod schema
 */
export function validateParams(schema: AnyZodObject) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req.params);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                logWarn('Params validation error', { errors: error.errors, path: req.path });
                res.status(400).json({
                    error: 'VALIDATION_ERROR',
                    message: 'Route parameter validation failed',
                    details: error.errors.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
            } else {
                next(error);
            }
        }
    };
}
