import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import { getThingsBoardAdapter, initializeThingsBoard } from '../../integrations/iot';
import { logInfo, logError } from '../../utils/logger';

const router = Router();

// Validation schemas
const createDeviceSchema = z.object({
    deviceCode: z.string().min(1),
    name: z.string().min(1),
    workcenterId: z.string().uuid().optional(),
    deviceType: z.enum(['SENSOR', 'PLC', 'CAMERA', 'GATEWAY', 'SIMULATOR']),
    thingsBoardId: z.string().optional(),
    accessToken: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
});

const queryParamsSchema = z.object({
    deviceId: z.string().uuid().optional(),
    workcenterId: z.string().uuid().optional(),
    isOnline: z.enum(['true', 'false']).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
});

// GET /api/v1/iot/devices - List all IoT devices
router.get('/devices', async (req, res) => {
    try {
        const query = queryParamsSchema.parse(req.query);

        const devices = await prisma.ioTDevice.findMany({
            where: {
                workcenterId: query.workcenterId,
                isOnline: query.isOnline ? query.isOnline === 'true' : undefined,
            },
            include: {
                workcenter: { select: { id: true, code: true, name: true } },
                _count: { select: { telemetry: true, alerts: true } },
            },
            orderBy: { name: 'asc' },
        });

        res.json({ devices, count: devices.length });
    } catch (error) {
        logError('Failed to fetch IoT devices', error as Error);
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
});

// GET /api/v1/iot/devices/:id - Get device by ID
router.get('/devices/:id', async (req, res) => {
    try {
        const device = await prisma.ioTDevice.findUnique({
            where: { id: req.params.id },
            include: {
                workcenter: true,
                telemetry: {
                    take: 100,
                    orderBy: { ts: 'desc' }
                },
                alerts: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                    where: { acknowledged: false },
                },
            },
        });

        if (!device) {
            res.status(404).json({ error: 'Device not found' });
            return;
        }

        res.json(device);
    } catch (error) {
        logError('Failed to fetch device', error as Error);
        res.status(500).json({ error: 'Failed to fetch device' });
    }
});

// POST /api/v1/iot/devices - Register new device
router.post('/devices', async (req, res) => {
    try {
        const data = createDeviceSchema.parse(req.body);

        const device = await prisma.ioTDevice.create({
            data: {
                deviceCode: data.deviceCode,
                name: data.name,
                workcenterId: data.workcenterId,
                deviceType: data.deviceType,
                thingsBoardId: data.thingsBoardId,
                accessToken: data.accessToken,
                metadata: data.metadata,
            },
        });

        logInfo('IoT device registered', { deviceId: device.id, deviceCode: device.deviceCode });
        res.status(201).json(device);
    } catch (error) {
        if ((error as { code?: string }).code === 'P2002') {
            res.status(409).json({ error: 'Device code already exists' });
            return;
        }
        logError('Failed to create device', error as Error);
        res.status(500).json({ error: 'Failed to create device' });
    }
});

// GET /api/v1/iot/devices/:id/telemetry - Get device telemetry history
router.get('/devices/:id/telemetry', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const from = req.query.from ? new Date(req.query.from as string) : undefined;
        const to = req.query.to ? new Date(req.query.to as string) : undefined;

        const telemetry = await prisma.telemetrySnapshot.findMany({
            where: {
                deviceId: req.params.id,
                ts: {
                    gte: from,
                    lte: to,
                },
            },
            orderBy: { ts: 'desc' },
            take: limit,
        });

        res.json({ telemetry, count: telemetry.length });
    } catch (error) {
        logError('Failed to fetch telemetry', error as Error);
        res.status(500).json({ error: 'Failed to fetch telemetry' });
    }
});

// GET /api/v1/iot/status - Get ThingsBoard connection status
router.get('/status', async (_req, res) => {
    const adapter = getThingsBoardAdapter();
    const status = adapter.getConnectionStatus();
    res.json(status);
});

// POST /api/v1/iot/connect - Initialize ThingsBoard connection
router.post('/connect', async (_req, res) => {
    try {
        const adapter = await initializeThingsBoard();
        const status = adapter.getConnectionStatus();

        logInfo('ThingsBoard connection initialized', status);
        res.json({ message: 'Connected to ThingsBoard', ...status });
    } catch (error) {
        logError('Failed to connect to ThingsBoard', error as Error);
        res.status(500).json({ error: 'Failed to connect to ThingsBoard' });
    }
});

// GET /api/v1/iot/thingsboard/devices - Fetch devices from ThingsBoard
router.get('/thingsboard/devices', async (_req, res) => {
    try {
        const adapter = getThingsBoardAdapter();
        const devices = await adapter.getDevices();
        res.json({ devices, count: devices.length });
    } catch (error) {
        logError('Failed to fetch ThingsBoard devices', error as Error);
        res.status(500).json({ error: 'Failed to fetch ThingsBoard devices' });
    }
});

// GET /api/v1/iot/thingsboard/telemetry/:deviceId - Get live telemetry from ThingsBoard
router.get('/thingsboard/telemetry/:deviceId', async (req, res) => {
    try {
        const adapter = getThingsBoardAdapter();
        const telemetry = await adapter.getDeviceTelemetry(req.params.deviceId);

        if (!telemetry) {
            res.status(404).json({ error: 'No telemetry found' });
            return;
        }

        res.json(telemetry);
    } catch (error) {
        logError('Failed to fetch live telemetry', error as Error);
        res.status(500).json({ error: 'Failed to fetch live telemetry' });
    }
});

// GET /api/v1/iot/alerts - Get IoT alerts
router.get('/alerts', async (req, res) => {
    try {
        const acknowledged = req.query.acknowledged === 'true';
        const limit = parseInt(req.query.limit as string) || 50;

        const alerts = await prisma.ioTAlert.findMany({
            where: { acknowledged },
            include: {
                device: { select: { id: true, deviceCode: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        res.json({ alerts, count: alerts.length });
    } catch (error) {
        logError('Failed to fetch alerts', error as Error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// POST /api/v1/iot/alerts/:id/acknowledge - Acknowledge an alert
router.post('/alerts/:id/acknowledge', async (req, res) => {
    try {
        const alert = await prisma.ioTAlert.update({
            where: { id: req.params.id },
            data: {
                acknowledged: true,
                acknowledgedAt: new Date(),
                acknowledgedBy: req.body.acknowledgedBy || 'system',
            },
        });

        logInfo('Alert acknowledged', { alertId: alert.id });
        res.json(alert);
    } catch (error) {
        logError('Failed to acknowledge alert', error as Error);
        res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
});

export default router;
