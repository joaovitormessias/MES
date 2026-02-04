import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { logExternalService, logExternalServiceError } from '../../utils/logger';

const router = Router();

// Create connection pool to dt-postgres
const dtPool = new Pool({
    host: process.env.DT_POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.DT_POSTGRES_PORT || '5432'),
    database: process.env.DT_POSTGRES_DB || 'digital_twin',
    user: process.env.DT_POSTGRES_USER || 'twin',
    password: process.env.DT_POSTGRES_PASSWORD || 'twinpass',
});

/**
 * GET /api/v1/telemetry
 * Fetch telemetry data from dt-postgres for visualization
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const { device = 'serra_01', limit = '100', from, to } = req.query;

    try {
        logExternalService('dt-postgres', `Fetching telemetry for device: ${device}`);

        const params: any[] = [device];
        let query = `
            SELECT device, ts, values
            FROM telemetry_raw
            WHERE device = $1
        `;

        if (from) {
            params.push(from);
            query += ` AND ts >= $${params.length}::timestamp`;
        }
        if (to) {
            params.push(to);
            query += ` AND ts <= $${params.length}::timestamp`;
        }

        query += ` ORDER BY ts DESC LIMIT ${parseInt(limit as string)}`;

        const result = await dtPool.query(query, params);
        const telemetryData = result.rows;

        const durationMs = Date.now() - startTime;
        logExternalService('dt-postgres', 'Telemetry fetched successfully', {
            device,
            count: telemetryData.length,
            durationMs
        });

        res.json({
            success: true,
            data: telemetryData,
            meta: {
                device,
                count: telemetryData.length,
                from: from || null,
                to: to || null
            }
        });
    } catch (error) {
        logExternalServiceError('dt-postgres', 'Fetch telemetry', error as Error);
        next(error);
    }
});

export default router;
