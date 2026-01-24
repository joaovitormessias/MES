import { Router } from 'express';
import { z } from 'zod';
import { validateParams, validateQuery } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import prisma from '../../utils/prisma';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// Validation schemas
const lotIdSchema = z.object({
    lotId: z.string().uuid(),
});

const opIdSchema = z.object({
    opId: z.string().uuid(),
});

/**
 * GET /api/v1/traceability/lots/:lotId
 * Get lot timeline (all events and genealogy)
 */
router.get(
    '/lots/:lotId',
    authenticateToken,
    validateParams(lotIdSchema),
    async (req, res, next) => {
        try {
            const { lotId } = req.params;

            // Get lot details
            const lot = await prisma.lot.findUnique({
                where: { id: lotId },
                include: {
                    item: true,
                    productionOrder: true,
                },
            });

            if (!lot) {
                throw new AppError(404, 'NOT_FOUND', 'Lot not found');
            }

            // Get all execution events for this lot
            const events = await prisma.executionEvent.findMany({
                where: { lotId },
                include: {
                    processStep: true,
                    workcenter: true,
                    operator: true,
                },
                orderBy: { ts: 'asc' },
            });

            // Get genealogy (parent lots)
            const parentGenealogy = await prisma.lotGenealogy.findMany({
                where: { childLotId: lotId },
                include: {
                    parentLot: {
                        include: {
                            item: true,
                        },
                    },
                },
            });

            // Get genealogy (child lots)
            const childGenealogy = await prisma.lotGenealogy.findMany({
                where: { parentLotId: lotId },
                include: {
                    childLot: {
                        include: {
                            item: true,
                        },
                    },
                },
            });

            // Get quality records
            const qualityRecords = await prisma.qualityRecord.findMany({
                where: { lotId },
                include: {
                    processStep: true,
                },
                orderBy: { ts: 'asc' },
            });

            res.json({
                lot,
                timeline: events,
                parentLots: parentGenealogy,
                childLots: childGenealogy,
                qualityRecords,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/v1/traceability/ops/:opId
 * Get production order execution timeline
 */
router.get(
    '/ops/:opId',
    authenticateToken,
    validateParams(opIdSchema),
    async (req, res, next) => {
        try {
            const { opId } = req.params;

            // Get production order
            const productionOrder = await prisma.productionOrder.findUnique({
                where: { id: opId },
                include: {
                    item: true,
                },
            });

            if (!productionOrder) {
                throw new AppError(404, 'NOT_FOUND', 'Production order not found');
            }

            // Get all execution events
            const events = await prisma.executionEvent.findMany({
                where: { productionOrderId: opId },
                include: {
                    processStep: true,
                    workcenter: true,
                    operator: true,
                    lot: true,
                },
                orderBy: { ts: 'asc' },
            });

            // Get process executions summary
            const executions = await prisma.processExecution.findMany({
                where: { productionOrderId: opId },
                include: {
                    processStep: true,
                    workcenter: true,
                    operator: true,
                },
                orderBy: { startedAt: 'asc' },
            });

            res.json({
                productionOrder,
                timeline: events,
                executions,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
