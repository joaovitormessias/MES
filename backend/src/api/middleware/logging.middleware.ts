import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logInfo } from '../../utils/logger';
import { httpRequestDuration, httpRequestTotal } from '../../utils/metrics';

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const requestId = uuidv4();
    const startTime = Date.now();

    // Attach request ID to request object
    (req as any).requestId = requestId;

    // Log request
    logInfo('Incoming request', {
        requestId,
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });

    // Capture response
    res.on('finish', () => {
        const duration = (Date.now() - startTime) / 1000; // seconds
        const statusCode = res.statusCode;

        // Log response
        logInfo('Request completed', {
            requestId,
            method: req.method,
            path: req.path,
            statusCode,
            duration: `${duration.toFixed(3)}s`,
        });

        // Record metrics
        const route = req.route?.path || req.path;
        httpRequestDuration.observe(
            { method: req.method, route, status_code: statusCode.toString() },
            duration
        );
        httpRequestTotal.inc({
            method: req.method,
            route,
            status_code: statusCode.toString(),
        });
    });

    next();
}
