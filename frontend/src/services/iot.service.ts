/**
 * IoT Service - Handles communication with MES backend IoT endpoints
 */

const API_BASE_URL = 'http://localhost:3050/api/v1/iot';

export interface IoTDevice {
    id: string;
    deviceCode: string;
    name: string;
    deviceType: 'SENSOR' | 'PLC' | 'CAMERA' | 'GATEWAY' | 'SIMULATOR';
    isOnline: boolean;
    lastSeen: string | null;
    thingsBoardId: string | null;
    metadata: Record<string, unknown> | null;
    workcenter?: {
        id: string;
        code: string;
        name: string;
    };
    _count?: {
        telemetry: number;
        alerts: number;
    };
}

export interface IoTAlert {
    id: string;
    deviceId: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    acknowledged: boolean;
    acknowledgedAt: string | null;
    acknowledgedBy: string | null;
    createdAt: string;
    device?: {
        id: string;
        deviceCode: string;
        name: string;
    };
}

export interface DevicesResponse {
    devices: IoTDevice[];
    count: number;
}

export interface AlertsResponse {
    alerts: IoTAlert[];
    count: number;
}

/**
 * Fetch all IoT devices
 */
export async function getDevices(filters?: {
    workcenterId?: string;
    isOnline?: boolean;
}): Promise<DevicesResponse> {
    const params = new URLSearchParams();
    if (filters?.workcenterId) params.append('workcenterId', filters.workcenterId);
    if (filters?.isOnline !== undefined) params.append('isOnline', String(filters.isOnline));

    const response = await fetch(`${API_BASE_URL}/devices?${params}`);
    if (!response.ok) {
        throw new Error('Failed to fetch devices');
    }
    return response.json();
}

/**
 * Fetch device by ID
 */
export async function getDeviceById(id: string): Promise<IoTDevice> {
    const response = await fetch(`${API_BASE_URL}/devices/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch device');
    }
    return response.json();
}

/**
 * Connect to ThingsBoard
 */
export async function connectThingsBoard(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/connect`, { method: 'POST' });
    if (!response.ok) {
        throw new Error('Failed to connect to ThingsBoard');
    }
    return response.json();
}

/**
 * Fetch devices from ThingsBoard
 */
export async function getThingsBoardDevices(): Promise<{ devices: unknown[]; count: number }> {
    const response = await fetch(`${API_BASE_URL}/thingsboard/devices`);
    if (!response.ok) {
        throw new Error('Failed to fetch ThingsBoard devices');
    }
    return response.json();
}

/**
 * Fetch IoT alerts
 */
export async function getAlerts(filters?: {
    acknowledged?: boolean;
    limit?: number;
}): Promise<AlertsResponse> {
    const params = new URLSearchParams();
    if (filters?.acknowledged !== undefined) params.append('acknowledged', String(filters.acknowledged));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await fetch(`${API_BASE_URL}/alerts?${params}`);
    if (!response.ok) {
        throw new Error('Failed to fetch alerts');
    }
    return response.json();
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(id: string, acknowledgedBy: string): Promise<IoTAlert> {
    const response = await fetch(`${API_BASE_URL}/alerts/${id}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedBy }),
    });
    if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
    }
    return response.json();
}

/**
 * Get ThingsBoard connection status
 */
export async function getConnectionStatus(): Promise<{ connected: boolean; lastSync?: string }> {
    const response = await fetch(`${API_BASE_URL}/status`);
    if (!response.ok) {
        throw new Error('Failed to get connection status');
    }
    return response.json();
}
