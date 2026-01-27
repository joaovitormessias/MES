import config from '../../config';
import { logInfo, logError, logDebug } from '../../utils/logger';
import { EventEmitter } from 'events';

export interface ThingsBoardTelemetry {
    deviceId: string;
    deviceName: string;
    timestamp: number;
    values: Record<string, number | string | boolean>;
}

export interface ThingsBoardDevice {
    id: { id: string; entityType: string };
    name: string;
    type: string;
    label?: string;
    additionalInfo?: Record<string, unknown>;
    createdTime: number;
}

export class ThingsBoardAdapter extends EventEmitter {
    private baseUrl: string;
    private accessToken: string;
    private jwtToken: string | null = null;
    private pollingInterval: NodeJS.Timeout | null = null;
    private isConnected = false;
    private ws: WebSocket | null = null;

    constructor() {
        super();
        this.baseUrl = config.thingsboard.url;
        this.accessToken = config.thingsboard.accessToken;
    }

    async authenticate(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: config.thingsboard.username,
                    password: config.thingsboard.password,
                }),
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.statusText}`);
            }

            const data = await response.json() as { token: string };
            this.jwtToken = data.token;
            this.isConnected = true;
            logInfo('ThingsBoard authentication successful');
            return true;
        } catch (error) {
            logError('ThingsBoard authentication failed', error as Error);
            this.isConnected = false;
            return false;
        }
    }

    async getDeviceTelemetry(deviceId: string): Promise<ThingsBoardTelemetry | null> {
        if (!this.jwtToken) {
            logError('Not authenticated with ThingsBoard');
            return null;
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`,
                {
                    headers: {
                        'X-Authorization': `Bearer ${this.jwtToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to get telemetry: ${response.statusText}`);
            }

            const data = await response.json() as Record<string, Array<{ ts: number; value: number | string | boolean }>>;

            const values: Record<string, number | string | boolean> = {};
            for (const [key, arr] of Object.entries(data)) {
                if (Array.isArray(arr) && arr.length > 0) {
                    values[key] = arr[0].value;
                }
            }

            return {
                deviceId,
                deviceName: config.thingsboard.deviceName,
                timestamp: Date.now(),
                values,
            };
        } catch (error) {
            logError('Failed to fetch ThingsBoard telemetry', error as Error);
            return null;
        }
    }

    async getDeviceTelemetryByToken(): Promise<ThingsBoardTelemetry | null> {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/v1/${this.accessToken}/telemetry`,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to get telemetry: ${response.statusText}`);
            }

            const data = await response.json() as Record<string, number | string | boolean>;

            return {
                deviceId: this.accessToken,
                deviceName: config.thingsboard.deviceName,
                timestamp: Date.now(),
                values: data,
            };
        } catch (error) {
            logError('Failed to fetch ThingsBoard telemetry by token', error as Error);
            return null;
        }
    }

    async getDevices(): Promise<ThingsBoardDevice[]> {
        if (!this.jwtToken) {
            await this.authenticate();
        }

        if (!this.jwtToken) {
            return [];
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/api/tenant/devices?pageSize=100&page=0`,
                {
                    headers: {
                        'X-Authorization': `Bearer ${this.jwtToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to get devices: ${response.statusText}`);
            }

            const data = await response.json() as { data: ThingsBoardDevice[] };
            return data.data || [];
        } catch (error) {
            logError('Failed to fetch ThingsBoard devices', error as Error);
            return [];
        }
    }

    startPolling(deviceId: string): void {
        if (this.pollingInterval) {
            this.stopPolling();
        }

        const intervalMs = config.thingsboard.pollIntervalS * 1000;

        logInfo(`Starting ThingsBoard polling for device ${deviceId}`, { intervalMs });

        this.pollingInterval = setInterval(async () => {
            const telemetry = await this.getDeviceTelemetry(deviceId);
            if (telemetry) {
                logDebug('Received telemetry', { telemetry });
                this.emit('telemetry', telemetry);
            }
        }, intervalMs);
    }

    stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            logInfo('Stopped ThingsBoard polling');
        }
    }

    async sendTelemetry(payload: Record<string, number | string | boolean>): Promise<boolean> {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/v1/${this.accessToken}/telemetry`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );

            return response.ok;
        } catch (error) {
            logError('Failed to send telemetry to ThingsBoard', error as Error);
            return false;
        }
    }

    getConnectionStatus(): { isConnected: boolean; baseUrl: string } {
        return {
            isConnected: this.isConnected,
            baseUrl: this.baseUrl,
        };
    }

    async disconnect(): Promise<void> {
        this.stopPolling();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.jwtToken = null;
        this.isConnected = false;
        logInfo('Disconnected from ThingsBoard');
    }
}

let adapterInstance: ThingsBoardAdapter | null = null;

export function getThingsBoardAdapter(): ThingsBoardAdapter {
    if (!adapterInstance) {
        adapterInstance = new ThingsBoardAdapter();
    }
    return adapterInstance;
}

export async function initializeThingsBoard(): Promise<ThingsBoardAdapter> {
    const adapter = getThingsBoardAdapter();
    await adapter.authenticate();
    return adapter;
}
