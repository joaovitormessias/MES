import { Router } from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import oeeService from '../../domain/oee/oee.service';

const router = Router();

// Validation schema
const oeeQuerySchema = z.object({
    workcenter: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    date: z.string().optional(),
    shift: z.string().optional(),
});

/**
 * GET /api/v1/kpis/oee
 * Get OEE drill-down
 */
router.get(
    '/oee',
    authenticateToken,
    validateQuery(oeeQuerySchema),
    async (req, res, next) => {
        try {
            const { workcenter, dateFrom, dateTo, date, shift } = req.query;

            // If specific date and shift requested, calculate real-time
            if (date && shift && workcenter) {
                const oeeResult = await oeeService.calculateOEE({
                    workcenterId: workcenter as string,
                    date: new Date(date as string),
                    shiftNumber: parseInt(shift as string, 10),
                });

                res.json(oeeResult);
                return;
            }

            // Otherwise, return historical snapshots
            const filters = {
                workcenterId: workcenter as string | undefined,
                dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
                dateTo: dateTo ? new Date(dateTo as string) : undefined,
            };

            const snapshots = await oeeService.getOEEHistory(filters);
            res.json(snapshots);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/v1/kpis/mttr
 * Mean Time To Repair
 */
router.get('/mttr', authenticateToken, async (req, res, next) => {
    try {
        // TODO: Implement MTTR calculation
        res.json({ message: 'MTTR endpoint - to be implemented' });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/kpis/mtbf
 * Mean Time Between Failures
 */
router.get('/mtbf', authenticateToken, async (req, res, next) => {
    try {
        // TODO: Implement MTBF calculation
        res.json({ message: 'MTBF endpoint - to be implemented' });
    } catch (error) {
        next(error);
    }
});

export default router;
