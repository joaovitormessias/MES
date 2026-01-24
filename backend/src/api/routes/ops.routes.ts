import { Router } from 'express';
import { z } from 'zod';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import productionOrderService from '../../domain/production-order/production-order.service';
import executionService from '../../domain/execution/execution.service';
import qualityService from '../../domain/quality/quality.service';

const router = Router();

// Validation schemas
const searchOpsSchema = z.object({
    status: z.string().optional(),
    type: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    erpOrderCode: z.string().optional(),
});

const uuidParamSchema = z.object({
    id: z.string().uuid(),
});

const stepParamsSchema = z.object({
    id: z.string().uuid(),
    stepId: z.string().uuid(),
});

const startStepSchema = z.object({
    workcenterId: z.string().uuid(),
    operatorId: z.string().uuid(),
});

const countSchema = z.object({
    piecesPerCycle: z.number().int().positive().optional(),
    source: z.string().optional(),
});

const qualitySchema = z.object({
    lotId: z.string().uuid(),
    disposition: z.enum(['SCRAP_NO_REUSE', 'REUSE']),
    reasonCode: z.string(),
    qty: z.number().positive(),
    notes: z.string().optional(),
});

/**
 * GET /api/v1/ops
 * Search/filter production orders
 */
router.get(
    '/',
    authenticateToken,
    validateQuery(searchOpsSchema),
    async (req, res, next) => {
        try {
            const { status, type, dateFrom, dateTo, erpOrderCode } = req.query;

            const filters = {
                status: status ? (status as string).split(',') : undefined,
                type: type ? (type as string).split(',') : undefined,
                dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
                dateTo: dateTo ? new Date(dateTo as string) : undefined,
                erpOrderCode: erpOrderCode as string | undefined,
            };

            const orders = await productionOrderService.searchProductionOrders(filters);
            res.json(orders);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/v1/ops/:id
 * Get production order details
 */
router.get(
    '/:id',
    authenticateToken,
    validateParams(uuidParamSchema),
    async (req, res, next) => {
        try {
            const order = await productionOrderService.getProductionOrderById(req.params.id);
            res.json(order);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/v1/ops/:id/steps/:stepId/start
 * Start process step
 */
router.post(
    '/:id/steps/:stepId/start',
    authenticateToken,
    validateParams(stepParamsSchema),
    validateBody(startStepSchema),
    async (req, res, next) => {
        try {
            const { id, stepId } = req.params;
            const { workcenterId, operatorId } = req.body;

            const execution = await executionService.startStep({
                productionOrderId: id,
                processStepId: stepId,
                workcenterId,
                operatorId,
            });

            res.status(201).json(execution);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/v1/ops/:id/steps/:stepId/count
 * Record piece count
 */
router.post(
    '/:id/steps/:stepId/count',
    authenticateToken,
    validateParams(stepParamsSchema),
    validateBody(countSchema),
    async (req, res, next) => {
        try {
            const { id, stepId } = req.params;
            const { piecesPerCycle, source } = req.body;

            // Get workcenter from execution (simplified - should be in request)
            const execution = await executionService.countPieces({
                productionOrderId: id,
                processStepId: stepId,
                workcenterId: '', // TODO: Get from context or request
                piecesPerCycle,
                source,
            });

            res.json(execution);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/v1/ops/:id/steps/:stepId/quality
 * Record quality event
 */
router.post(
    '/:id/steps/:stepId/quality',
    authenticateToken,
    validateParams(stepParamsSchema),
    validateBody(qualitySchema),
    async (req, res, next) => {
        try {
            const { id, stepId } = req.params;
            const { lotId, disposition, reasonCode, qty, notes } = req.body;

            const qualityRecord = await qualityService.recordQuality({
                productionOrderId: id,
                lotId,
                processStepId: stepId,
                disposition,
                reasonCode,
                qty,
                notes,
            });

            res.status(201).json(qualityRecord);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/v1/ops/:id/steps/:stepId/complete
 * Complete process step
 */
router.post(
    '/:id/steps/:stepId/complete',
    authenticateToken,
    validateParams(stepParamsSchema),
    async (req, res, next) => {
        try {
            const { id, stepId } = req.params;

            const execution = await executionService.completeStep({
                productionOrderId: id,
                processStepId: stepId,
                workcenterId: '', // TODO: Get from context
            });

            // Recalculate production order quantities
            await productionOrderService.recalculateExecutedQuantities(id);

            res.json(execution);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
