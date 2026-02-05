import { Client as PgClient } from 'pg';
import prisma from '../utils/prisma';
import { logInfo, logError } from '../utils/logger';

// Digital Twin database connection
const DT_DB_URL = process.env.DT_DATABASE_URL || 'postgresql://twin:twinpass@localhost:5432/digital_twin';

export class TelemetryBridgeService {
    private dtClient: PgClient;
    private isRunning: boolean = false;
    private intervalMs: number = 5000; // 5 seconds
    private lastSyncTs: Date = new Date(0); // Start from epoch
    private intervalId: NodeJS.Timeout | null = null;

    constructor() {
        this.dtClient = new PgClient({ connectionString: DT_DB_URL });
    }

    async start(): Promise<void> {
        try {
            await this.dtClient.connect();
            logInfo('Connected to Digital Twin database for telemetry bridge');

            this.isRunning = true;
            this.intervalId = setInterval(() => this.syncTelemetry(), this.intervalMs);

            // Initial sync
            await this.syncTelemetry();
            logInfo('Telemetry bridge started successfully');
        } catch (error) {
            logError('Failed to start telemetry bridge', error as Error);
            throw error;
        }
    }

    async stop(): Promise<void> {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        await this.dtClient.end();
        logInfo('Telemetry bridge stopped');
    }

    private async syncTelemetry(): Promise<void> {
        if (!this.isRunning) return;

        try {
            // Query new telemetry from Digital Twin DB
            const query = `
                SELECT device, ts, values 
                FROM telemetry_raw 
                WHERE ts > $1 
                ORDER BY ts ASC 
                LIMIT 100
            `;

            const result = await this.dtClient.query(query, [this.lastSyncTs]);

            if (result.rows.length === 0) {
                return; // No new data
            }

            logInfo(`Syncing ${result.rows.length} telemetry records`);

            for (const row of result.rows) {
                await this.processTelemetryRow(row);
            }

            // Update last sync timestamp
            this.lastSyncTs = result.rows[result.rows.length - 1].ts;

        } catch (error) {
            logError('Error syncing telemetry', error as Error);
        }
    }

    private async processTelemetryRow(row: any): Promise<void> {
        try {
            // Find or create device
            let device = await prisma.ioTDevice.findFirst({
                where: { deviceCode: row.device }
            });

            if (!device) {
                // Auto-register unknown devices
                device = await prisma.ioTDevice.create({
                    data: {
                        deviceCode: row.device,
                        name: `Device ${row.device}`,
                        deviceType: 'SIMULATOR',
                        isOnline: true,
                        lastSeenAt: row.ts
                    }
                });
                logInfo(`Auto-registered device: ${row.device}`);
            } else {
                // Update last seen
                await prisma.ioTDevice.update({
                    where: { id: device.id },
                    data: {
                        isOnline: true,
                        lastSeenAt: row.ts
                    }
                });
            }

            // Insert telemetry snapshot
            await prisma.telemetrySnapshot.create({
                data: {
                    deviceId: device.id,
                    ts: row.ts,
                    metrics: row.values
                }
            });

            // Check for alerts
            await this.checkAndGenerateAlerts(device.id, row.values);

        } catch (error) {
            logError(`Error processing telemetry for device ${row.device}`, error as Error);
        }
    }

    private async checkAndGenerateAlerts(deviceId: string, metrics: any): Promise<void> {
        const alerts = [];

        // Temperature threshold
        if (metrics.temperature > 90) {
            alerts.push({
                deviceId,
                alertType: 'TEMPERATURE_HIGH',
                severity: 'CRITICAL',
                message: `Temperature exceeds 90°C: ${metrics.temperature.toFixed(2)}°C`,
                value: metrics.temperature,
                threshold: 90
            });
        }

        // RPM threshold
        if (metrics.sawRpm > 4000) {
            alerts.push({
                deviceId,
                alertType: 'THRESHOLD_EXCEEDED',
                severity: 'WARNING',
                message: `Saw RPM exceeds 4000: ${metrics.sawRpm.toFixed(0)} RPM`,
                value: metrics.sawRpm,
                threshold: 4000
            });
        }

        // Vibration threshold
        if (metrics.vibration > 5.0) {
            alerts.push({
                deviceId,
                alertType: 'VIBRATION_HIGH',
                severity: 'WARNING',
                message: `Vibration exceeds 5.0 mm/s: ${metrics.vibration.toFixed(2)} mm/s`,
                value: metrics.vibration,
                threshold: 5.0
            });
        }

        // Create alerts if any
        for (const alert of alerts) {
            // Check if similar alert already exists (avoid duplicates)
            const existing = await prisma.ioTAlert.findFirst({
                where: {
                    deviceId: alert.deviceId,
                    alertType: alert.alertType as any,
                    acknowledged: false,
                    createdAt: {
                        gte: new Date(Date.now() - 60000) // Within last minute
                    }
                }
            });

            if (!existing) {
                await prisma.ioTAlert.create({ data: alert as any });
                logInfo(`Alert created: ${alert.message}`);
            }
        }
    }
}

// Singleton instance
let bridgeService: TelemetryBridgeService | null = null;

export function startTelemetryBridge(): void {
    if (bridgeService) {
        logInfo('Telemetry bridge already running');
        return;
    }

    bridgeService = new TelemetryBridgeService();
    bridgeService.start().catch(err => {
        logError('Failed to start telemetry bridge', err);
    });
}

export function stopTelemetryBridge(): void {
    if (bridgeService) {
        bridgeService.stop();
        bridgeService = null;
    }
}
