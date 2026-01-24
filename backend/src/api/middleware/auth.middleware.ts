import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { logWarn } from '../../utils/logger';

export interface AuthUser {
    id: string;
    badge: string;
    role: 'OPERATOR' | 'SUPERVISOR' | 'PCP' | 'MANAGER';
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

/**
 * Middleware to verify JWT token
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({
            error: 'FORBIDDEN',
            message: 'Authentication token required',
        });
        return;
    }

    try {
        const user = jwt.verify(token, config.jwt.secret) as AuthUser;
        req.user = user;
        next();
    } catch (error) {
        logWarn('Invalid token', { error: (error as Error).message });
        res.status(403).json({
            error: 'FORBIDDEN',
            message: 'Invalid or expired token',
        });
    }
}

/**
 * Middleware to check user role
 */
export function requireRole(...roles: AuthUser['role'][]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                error: 'FORBIDDEN',
                message: 'Authentication required',
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                error: 'FORBIDDEN',
                message: `Insufficient permissions. Required roles: ${roles.join(', ')}`,
            });
            return;
        }

        next();
    };
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: AuthUser): string {
    return jwt.sign(user, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
}
