/**
 * Digital Twin Service - Fetches real-time data from serra_01 device
 */

const DT_API_BASE = 'http://localhost:8000';

// API Response Interfaces (actual structure from backend)
interface DTApiStatusResponse {
    device: string;
    ts: number;
    values: {
        temperature: number;
        beltSpeed: number;
        vibration: number;
        woodCount: number;
        status: string;
        sawRpm: number;
        motorCurrent: number;
    };
    health: 'OK' | 'WARNING' | 'CRITICAL';
    alerts: Array<{
        type: string;
        level: string;
        value: number;
    }>;
    limits: Record<string, number>;
}

interface DTApiAlertsResponse {
    health: 'OK' | 'WARNING' | 'CRITICAL';
    alerts: Array<{
        type: string;
        level: string;
        value: number;
    }>;
}

// Frontend Interfaces (flat structure for components)
export interface Serra01Status {
    temperature: number;      // Celsius from API
    beltSpeed: number;
    vibration: number;
    sawRpm: number;
    motorCurrent: number;
    woodCount: number;
    status: string;           // RUNNING, IDLE, STOPPED
    ts?: number;
}

export interface HealthInfo {
    health: 'OK' | 'WARNING' | 'CRITICAL';
    issues: string[];
}

export interface Serra01FullStatus extends Serra01Status, HealthInfo { }

export interface HistoryEntry {
    ts: number;
    temperature: number;
    beltSpeed: number;
    vibration: number;
    sawRpm: number;
    motorCurrent: number;
    woodCount: number;
    status: string;
}

/**
 * Convert Celsius to Kelvin
 */
export function celsiusToKelvin(celsius: number): number {
    return celsius + 273.15;
}

/**
 * Transform API response to frontend format
 */
function transformStatusResponse(apiResponse: DTApiStatusResponse): Serra01FullStatus {
    const issues = apiResponse.alerts.map(alert =>
        `${alert.type}: ${alert.level} (${alert.value.toFixed(2)})`
    );

    return {
        temperature: apiResponse.values.temperature,
        beltSpeed: apiResponse.values.beltSpeed,
        vibration: apiResponse.values.vibration,
        sawRpm: apiResponse.values.sawRpm,
        motorCurrent: apiResponse.values.motorCurrent,
        woodCount: apiResponse.values.woodCount,
        status: apiResponse.values.status.toUpperCase(),
        ts: apiResponse.ts,
        health: apiResponse.health,
        issues: issues
    };
}

/**
 * Transform alerts response to frontend format
 */
function transformAlertsResponse(apiResponse: DTApiAlertsResponse): HealthInfo {
    const issues = apiResponse.alerts.map(alert =>
        `${alert.type}: ${alert.level} (${alert.value.toFixed(2)})`
    );

    return {
        health: apiResponse.health,
        issues: issues
    };
}

/**
 * Get current status of a device
 */
export async function getStatus(machineId: string = 'serra_01'): Promise<Serra01FullStatus> {
    const response = await fetch(`${DT_API_BASE}/status?machine_id=${machineId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
    }
    const data: DTApiStatusResponse = await response.json();
    return transformStatusResponse(data);
}

/**
 * Get telemetry history for a device
 */
export async function getHistory(machineId: string = 'serra_01', limit: number = 60): Promise<HistoryEntry[]> {
    const response = await fetch(`${DT_API_BASE}/history?machine_id=${machineId}&limit=${limit}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
    }
    const data = await response.json();

    // History endpoint returns array of objects with same nested structure
    if (Array.isArray(data)) {
        return data.map((item: any) => ({
            ts: item.ts,
            temperature: item.values?.temperature || 0,
            beltSpeed: item.values?.beltSpeed || 0,
            vibration: item.values?.vibration || 0,
            sawRpm: item.values?.sawRpm || 0,
            motorCurrent: item.values?.motorCurrent || 0,
            woodCount: item.values?.woodCount || 0,
            status: item.values?.status?.toUpperCase() || 'UNKNOWN'
        }));
    }

    return [];
}

/**
 * Get alerts/health info for a device
 */
export async function getAlerts(machineId: string = 'serra_01'): Promise<HealthInfo> {
    const response = await fetch(`${DT_API_BASE}/alerts?machine_id=${machineId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.status}`);
    }
    const data: DTApiAlertsResponse = await response.json();
    return transformAlertsResponse(data);
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${DT_API_BASE}/health`);
        return response.ok;
    } catch {
        return false;
    }
}
