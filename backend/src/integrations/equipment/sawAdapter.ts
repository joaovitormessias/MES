/**
 * Saw Equipment Adapter
 * 
 * This adapter defines the interface for the Digital Twin Saw integration.
 * It documents the payload structures and event mappings expected from the bridging service.
 * 
 * Integration Flow:
 * Digital Twin (MQTT) -> Bridge Service (Python) -> MES API (REST)
 * 
 * Events Handled:
 * 1. Step Start
 *    - Trigger: Status changes to 'running'
 *    - API: POST /ops/:opId/steps/:stepId/start
 * 
 * 2. Step Complete
 *    - Trigger: Status changes from 'running' to 'idle'
 *    - API: POST /ops/:opId/steps/:stepId/complete
 * 
 * 3. Piece Count
 *    - Trigger: 'woodCount' increment
 *    - API: POST /ops/:opId/steps/:stepId/count
 *    - Payload: { "count": number }
 * 
 * 4. Quality Alert
 *    - Trigger: Telemetry threshold breach (Temp > 80, Vib > 10)
 *    - API: POST /ops/:opId/steps/:stepId/quality
 *    - Payload: { "code": "HIGH_TEMP" | "HIGH_VIBRATION", "reason": string }
 */

export interface TelemetryPayload {
    temperature: number;
    beltSpeed: number;
    vibration: number;
    woodCount: number;
    status: 'idle' | 'running' | 'error';
    sawRpm: number;
    motorCurrent: number;
}

export interface MesEventPayload {
    count?: number;
    code?: string;
    reason?: string;
}
