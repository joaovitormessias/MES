import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import config from '../config';

// Create a Registry
export const register = new Registry();

// Collect default metrics (CPU, memory, etc.)
if (config.metrics.enabled) {
    collectDefaultMetrics({ register });
}

// Custom metrics
export const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register],
});

export const httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

export const executionEventsTotal = new Counter({
    name: 'execution_events_total',
    help: 'Total number of execution events',
    labelNames: ['event_type', 'workcenter'],
    registers: [register],
});

export const pieceCountTotal = new Counter({
    name: 'piece_count_total',
    help: 'Total pieces counted',
    labelNames: ['workcenter', 'process_step'],
    registers: [register],
});

export const qualityEventsTotal = new Counter({
    name: 'quality_events_total',
    help: 'Total quality events',
    labelNames: ['disposition', 'process_step'],
    registers: [register],
});

export const downtimeMinutes = new Counter({
    name: 'downtime_minutes_total',
    help: 'Total downtime in minutes',
    labelNames: ['workcenter', 'reason_code'],
    registers: [register],
});

export const oeeGauge = new Gauge({
    name: 'oee_current',
    help: 'Current OEE value',
    labelNames: ['workcenter', 'shift'],
    registers: [register],
});

export const availabilityGauge = new Gauge({
    name: 'availability_current',
    help: 'Current availability factor',
    labelNames: ['workcenter', 'shift'],
    registers: [register],
});

export const performanceGauge = new Gauge({
    name: 'performance_current',
    help: 'Current performance factor',
    labelNames: ['workcenter', 'shift'],
    registers: [register],
});

export const qualityGauge = new Gauge({
    name: 'quality_current',
    help: 'Current quality factor',
    labelNames: ['workcenter', 'shift'],
    registers: [register],
});

export const activeProductionOrders = new Gauge({
    name: 'active_production_orders',
    help: 'Number of active production orders',
    labelNames: ['status'],
    registers: [register],
});

export const erpIntegrationErrors = new Counter({
    name: 'erp_integration_errors_total',
    help: 'Total ERP integration errors',
    labelNames: ['operation'],
    registers: [register],
});

export const equipmentIntegrationErrors = new Counter({
    name: 'equipment_integration_errors_total',
    help: 'Total equipment integration errors',
    labelNames: ['equipment_type'],
    registers: [register],
});

export const websocketConnections = new Gauge({
    name: 'websocket_connections_active',
    help: 'Number of active WebSocket connections',
    registers: [register],
});
