/**
 * Digital Twin Service - Fetches real-time data from serra_01 device
 */

const DT_API_BASE = 'http://localhost:8000';

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
 * Get current status of a device
 */
export async function getStatus(machineId: string = 'serra_01'): Promise<Serra01FullStatus> {
    const response = await fetch(`${DT_API_BASE}/status?machine_id=${machineId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
    }
    return response.json();
}

/**
 * Get telemetry history for a device
 */
export async function getHistory(machineId: string = 'serra_01', limit: number = 60): Promise<HistoryEntry[]> {
    const response = await fetch(`${DT_API_BASE}/history?machine_id=${machineId}&limit=${limit}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
    }
    return response.json();
}

/**
 * Get alerts/health info for a device
 */
export async function getAlerts(machineId: string = 'serra_01'): Promise<HealthInfo> {
    const response = await fetch(`${DT_API_BASE}/alerts?machine_id=${machineId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.status}`);
    }
    return response.json();
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
