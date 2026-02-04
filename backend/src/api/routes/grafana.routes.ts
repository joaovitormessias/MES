import { Router } from 'express';
import config from '../../config';
import { logExternalService, logExternalServiceError } from '../../utils/logger';

const router = Router();

/**
 * GET /api/v1/grafana/dashboards
 * Proxies search request to Grafana to find dashboards
 */
router.get('/dashboards', async (_req, res, next) => {
    const startTime = Date.now();
    try {
        logExternalService('grafana', 'Fetching dashboards list');
        const grafanaUrl = `${config.grafana.apiUrl}/api/search?type=dash-db`;

        const response = await fetch(grafanaUrl, {
            headers: {
                'Authorization': `Bearer ${config.grafana.apiKey}`,
                'Accept': 'application/json',
            },
        });

        const durationMs = Date.now() - startTime;

        if (!response.ok) {
            const errorText = await response.text();
            logExternalServiceError('grafana', 'Fetch dashboards', new Error(errorText), {
                statusCode: response.status,
                durationMs
            });
            return res.status(response.status).json({
                error: 'GRAFANA_API_ERROR',
                message: 'Failed to fetch dashboards from Grafana',
                details: errorText
            });
        }

        const dashboards = await response.json();
        logExternalService('grafana', 'Dashboards fetched successfully', {
            count: dashboards.length,
            durationMs
        });
        return res.json({ data: dashboards });
    } catch (error) {
        logExternalServiceError('grafana', 'Fetch dashboards', error as Error);
        return next(error);
    }
});

/**
 * GET /api/v1/grafana/dashboards/:uid
 * Proxies request to get dashboard details/panels
 */
router.get('/dashboards/:uid', async (req, res, next) => {
    const startTime = Date.now();
    const { uid } = req.params;
    try {
        logExternalService('grafana', `Fetching dashboard details`, { uid });
        const grafanaUrl = `${config.grafana.apiUrl}/api/dashboards/uid/${uid}`;

        const response = await fetch(grafanaUrl, {
            headers: {
                'Authorization': `Bearer ${config.grafana.apiKey}`,
                'Accept': 'application/json',
            },
        });

        const durationMs = Date.now() - startTime;

        if (!response.ok) {
            const errorText = await response.text();
            logExternalServiceError('grafana', `Fetch dashboard ${uid}`, new Error(errorText), {
                statusCode: response.status,
                durationMs
            });
            return res.status(response.status).json({
                error: 'GRAFANA_API_ERROR',
                message: `Failed to fetch dashboard ${uid} from Grafana`,
                details: errorText
            });
        }

        const dashboardData = await response.json();
        logExternalService('grafana', 'Dashboard fetched successfully', {
            uid,
            durationMs,
            title: dashboardData?.dashboard?.title
        });
        return res.json({ data: dashboardData });
    } catch (error) {
        logExternalServiceError('grafana', `Fetch dashboard ${uid}`, error as Error);
        return next(error);
    }
});

export default router;

