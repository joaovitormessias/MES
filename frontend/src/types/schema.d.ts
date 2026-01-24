
export type UUID = string;
export type DateTime = string; // ISO-8601 UTC

// Enums
export enum OrderType {
    PRODUCTION = "PRODUCTION",
    REPLENISHMENT = "REPLENISHMENT"
}

export enum OrderStatus {
    OPEN_NOT_STARTED = "OPEN_NOT_STARTED",
    IN_PROGRESS = "IN_PROGRESS",
    OPEN_PARTIAL = "OPEN_PARTIAL",
    CLOSED = "CLOSED"
}

export enum LotOrigin {
    RAW = "RAW",
    WIP = "WIP",
    FINISHED = "FINISHED"
}

export enum EventType {
    SCAN = "SCAN",
    START = "START",
    STOP = "STOP",
    COUNT = "COUNT",
    QUALITY = "QUALITY",
    COMPLETE = "COMPLETE"
}

export enum QualityDisposition {
    SCRAP_NO_REUSE = "SCRAP_NO_REUSE",
    REUSE = "REUSE"
}

export enum ApprovalType {
    OVERTIME = "OVERTIME",
    ENABLE_EQUIPMENT = "ENABLE_EQUIPMENT",
    DISABLE_EQUIPMENT = "DISABLE_EQUIPMENT",
    SPECIAL_OPERATION = "SPECIAL_OPERATION"
}

export enum ApprovalStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

// Entities
export interface ProductionOrder {
    id: UUID;
    erp_order_code: string;
    type: OrderType;
    status: OrderStatus;
    planned_qty: number;
    executed_good_qty: number;
    executed_total_qty: number;
    due_date: DateTime;
}

export interface Lot {
    id: UUID;
    lot_code: string;
    item_code: string;
    origin: LotOrigin;
}

export interface ProcessStep {
    id: UUID;
    code: string;
    name: string;
    sequence: number;
}

export interface Workcenter {
    id: UUID;
    code: string;
    name: string;
    is_enabled: boolean;
}

export interface ExecutionEvent {
    id: UUID;
    event_type: EventType;
    production_order_id: UUID;
    lot_id: UUID;
    process_step_id: UUID;
    workcenter_id: UUID;
    operator_id: UUID;
    ts: DateTime;
    payload?: Record<string, unknown>;
}

export interface QualityRecord {
    id: UUID;
    production_order_id: UUID;
    lot_id: UUID;
    process_step_id: UUID;
    disposition: QualityDisposition;
    reason_code: string;
    qty: number;
    ts: DateTime;
}

export interface DowntimeEvent {
    id: UUID;
    workcenter_id: UUID;
    reason_code: string;
    start_ts: DateTime;
    end_ts?: DateTime;
    is_micro_stop: boolean;
}

export interface Approval {
    id: UUID;
    type: ApprovalType;
    requested_by: UUID;
    approved_by?: UUID;
    status: ApprovalStatus;
    justification: string;
    ts: DateTime;
}

// Responses
export interface OEEData {
    availability: number;
    performance: number;
    quality: number;
    oee: number;
}
