import { createClient, RedisClientType } from 'redis';
import config from '../config';
import { logInfo, logError, logDebug } from '../utils/logger';

let pubClient: RedisClientType | null = null;
let subClient: RedisClientType | null = null;

type EventHandler = (data: any) => void | Promise<void>;

const eventHandlers: Map<string, EventHandler[]> = new Map();

/**
 * Domain events as per shared contract
 */
export enum DomainEvent {
    OP_IMPORTED_FROM_ERP = 'OP_IMPORTED_FROM_ERP',
    BARCODE_SCANNED = 'BARCODE_SCANNED',
    STEP_STARTED = 'STEP_STARTED',
    PIECE_COUNTED = 'PIECE_COUNTED',
    QUALITY_RECORDED = 'QUALITY_RECORDED',
    REPLENISHMENT_OP_CREATED = 'REPLENISHMENT_OP_CREATED',
    STEP_COMPLETED = 'STEP_COMPLETED',
}

/**
 * Initialize event bus
 */
export async function initializeEventBus(): Promise<void> {
    // Publisher client
    pubClient = createClient({ url: config.redis.url });
    await pubClient.connect();
    logInfo('Event bus publisher connected');

    // Subscriber client
    subClient = createClient({ url: config.redis.url });
    await subClient.connect();
    logInfo('Event bus subscriber connected');

    // Subscribe to all domain events
    for (const event of Object.values(DomainEvent)) {
        await subClient.subscribe(`event:${event}`, async (message) => {
            try {
                const data = JSON.parse(message);
                logDebug(`Event received: ${event}`, data);

                const handlers = eventHandlers.get(event) || [];
                for (const handler of handlers) {
                    await handler(data);
                }
            } catch (error) {
                logError(`Error processing event ${event}`, error as Error);
            }
        });
    }

    logInfo('Event bus initialized and subscribed to all domain events');
}

/**
 * Publish domain event
 */
export async function publishEvent(event: DomainEvent, data: any): Promise<void> {
    if (!pubClient) {
        throw new Error('Event bus not initialized');
    }

    const payload = {
        ...data,
        ts: data.ts || new Date().toISOString(),
        eventType: event,
    };

    await pubClient.publish(`event:${event}`, JSON.stringify(payload));
    logDebug(`Event published: ${event}`, payload);
}

/**
 * Register event handler
 */
export function onEvent(event: DomainEvent, handler: EventHandler): void {
    const handlers = eventHandlers.get(event) || [];
    handlers.push(handler);
    eventHandlers.set(event, handlers);
    logDebug(`Handler registered for event: ${event}`);
}

/**
 * Close event bus
 */
export async function closeEventBus(): Promise<void> {
    if (pubClient) {
        await pubClient.quit();
        logInfo('Event bus publisher disconnected');
    }
    if (subClient) {
        await subClient.quit();
        logInfo('Event bus subscriber disconnected');
    }
}
