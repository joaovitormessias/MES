import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken, authenticateToken, AuthUser } from '../middleware/auth.middleware';
import { logInfo, logWarn } from '../../utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/v1/auth/login
 * Login with badge and return JWT token
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { badge } = req.body;

        if (!badge) {
            res.status(400).json({
                error: 'VALIDATION_ERROR',
                message: 'Badge is required',
            });
            return;
        }

        // Find operator by badge
        const operator = await prisma.operator.findUnique({
            where: { badge: String(badge) },
        });

        if (!operator) {
            logWarn('Login failed: operator not found', { badge });
            res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Invalid badge',
            });
            return;
        }

        if (!operator.isActive) {
            logWarn('Login failed: operator inactive', { badge });
            res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Operator account is inactive',
            });
            return;
        }

        // Generate JWT token
        const user: AuthUser = {
            id: operator.id,
            badge: operator.badge,
            role: operator.role as AuthUser['role'],
        };

        const token = generateToken(user);

        logInfo('Operator logged in', { badge: operator.badge, role: operator.role });

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: operator.id,
                    badge: operator.badge,
                    name: operator.name,
                    role: operator.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/auth/me
 * Get current user info
 */
router.get('/me', authenticateToken, (req: Request, res: Response) => {
    res.json({
        success: true,
        data: req.user,
    });
});

/**
 * POST /api/v1/auth/register
 * Create a new operator (for testing/development)
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { badge, name, role = 'OPERATOR' } = req.body;

        if (!badge || !name) {
            res.status(400).json({
                error: 'VALIDATION_ERROR',
                message: 'Badge and name are required',
            });
            return;
        }

        // Check if operator already exists
        const existing = await prisma.operator.findUnique({
            where: { badge: String(badge) },
        });

        if (existing) {
            res.status(409).json({
                error: 'CONFLICT',
                message: 'Operator with this badge already exists',
            });
            return;
        }

        // Create operator
        const operator = await prisma.operator.create({
            data: {
                badge: String(badge),
                name: String(name),
                role: role as 'OPERATOR' | 'SUPERVISOR' | 'PCP' | 'MANAGER',
                isActive: true,
            },
        });

        // Generate token
        const user: AuthUser = {
            id: operator.id,
            badge: operator.badge,
            role: operator.role as AuthUser['role'],
        };

        const token = generateToken(user);

        logInfo('Operator registered', { badge: operator.badge, role: operator.role });

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: operator.id,
                    badge: operator.badge,
                    name: operator.name,
                    role: operator.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
