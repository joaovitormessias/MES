import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import executionService from '../../domain/execution/execution.service';

const router = Router();

// Validation schema
const scanSchema = z.object({
    scanRaw: z.string(),
    productionOrderId: z.string().uuid(),
    lotId: z.string().uuid(),
    processStepId: z.string().uuid(),
    workcenterId: z.string().uuid(),
    operatorId: z.string().uuid(),
    idempotencyKey: z.string().optional(),
});

/**
 * POST /api/v1/scans
 * Ingest barcode scan (idempotent)
 */
router.post(
    '/',
    authenticateToken,
    validateBody(scanSchema),
    async (req, res, next) => {
        try {
            const event = await executionService.processScan(req.body);
            res.status(201).json(event);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
