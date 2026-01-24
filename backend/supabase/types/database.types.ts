export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            approvals: {
                Row: {
                    approved_by: string | null
                    created_at: string
                    id: string
                    justification: string | null
                    reference_id: string | null
                    reference_type: string | null
                    requested_at: string
                    requested_by: string
                    responded_at: string | null
                    response_notes: string | null
                    status: Database["public"]["Enums"]["approval_status"]
                    type: Database["public"]["Enums"]["approval_type"]
                }
                Insert: {
                    approved_by?: string | null
                    created_at?: string
                    id?: string
                    justification?: string | null
                    reference_id?: string | null
                    reference_type?: string | null
                    requested_at?: string
                    requested_by: string
                    responded_at?: string | null
                    response_notes?: string | null
                    status?: Database["public"]["Enums"]["approval_status"]
                    type: Database["public"]["Enums"]["approval_type"]
                }
                Update: {
                    approved_by?: string | null
                    created_at?: string
                    id?: string
                    justification?: string | null
                    reference_id?: string | null
                    reference_type?: string | null
                    requested_at?: string
                    requested_by?: string
                    responded_at?: string | null
                    response_notes?: string | null
                    status?: Database["public"]["Enums"]["approval_status"]
                    type?: Database["public"]["Enums"]["approval_type"]
                }
            }
            audit_logs: {
                Row: {
                    action: string
                    entity_id: string | null
                    entity_type: string
                    id: string
                    ip_address: string | null
                    new_values: Json | null
                    old_values: Json | null
                    operator_id: string | null
                    ts: string
                    user_agent: string | null
                }
                Insert: {
                    action: string
                    entity_id?: string | null
                    entity_type: string
                    id?: string
                    ip_address?: string | null
                    new_values?: Json | null
                    old_values?: Json | null
                    operator_id?: string | null
                    ts?: string
                    user_agent?: string | null
                }
                Update: {
                    action?: string
                    entity_id?: string | null
                    entity_type?: string
                    id?: string
                    ip_address?: string | null
                    new_values?: Json | null
                    old_values?: Json | null
                    operator_id?: string | null
                    ts?: string
                    user_agent?: string | null
                }
            }
            downtime_events: {
                Row: {
                    created_at: string
                    description: string | null
                    downtime_type: Database["public"]["Enums"]["downtime_type"]
                    duration_seconds: number | null
                    end_ts: string | null
                    id: string
                    operator_id: string | null
                    reason_code: string | null
                    start_ts: string
                    workcenter_id: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    downtime_type: Database["public"]["Enums"]["downtime_type"]
                    duration_seconds?: number | null
                    end_ts?: string | null
                    id?: string
                    operator_id?: string | null
                    reason_code?: string | null
                    start_ts: string
                    workcenter_id: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    downtime_type?: Database["public"]["Enums"]["downtime_type"]
                    duration_seconds?: number | null
                    end_ts?: string | null
                    id?: string
                    operator_id?: string | null
                    reason_code?: string | null
                    start_ts?: string
                    workcenter_id?: string
                }
            }
            execution_events: {
                Row: {
                    created_at: string
                    event_type: Database["public"]["Enums"]["event_type"]
                    id: string
                    idempotency_key: string
                    lot_id: string | null
                    operator_id: string | null
                    payload: Json | null
                    process_step_id: string | null
                    production_order_id: string | null
                    scan_raw: string | null
                    ts: string
                    workcenter_id: string | null
                }
                Insert: {
                    created_at?: string
                    event_type: Database["public"]["Enums"]["event_type"]
                    id?: string
                    idempotency_key: string
                    lot_id?: string | null
                    operator_id?: string | null
                    payload?: Json | null
                    process_step_id?: string | null
                    production_order_id?: string | null
                    scan_raw?: string | null
                    ts?: string
                    workcenter_id?: string | null
                }
                Update: {
                    created_at?: string
                    event_type?: Database["public"]["Enums"]["event_type"]
                    id?: string
                    idempotency_key?: string
                    lot_id?: string | null
                    operator_id?: string | null
                    payload?: Json | null
                    process_step_id?: string | null
                    production_order_id?: string | null
                    scan_raw?: string | null
                    ts?: string
                    workcenter_id?: string | null
                }
            }
            lots: {
                Row: {
                    created_at: string
                    id: string
                    item_code: string
                    lot_code: string
                    origin: Database["public"]["Enums"]["lot_origin"]
                    production_order_id: string | null
                    quantity: number
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    item_code: string
                    lot_code: string
                    origin?: Database["public"]["Enums"]["lot_origin"]
                    production_order_id?: string | null
                    quantity?: number
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    item_code?: string
                    lot_code?: string
                    origin?: Database["public"]["Enums"]["lot_origin"]
                    production_order_id?: string | null
                    quantity?: number
                    updated_at?: string
                }
            }
            operators: {
                Row: {
                    code: string
                    created_at: string
                    id: string
                    is_active: boolean
                    name: string
                    role: string
                    updated_at: string
                    user_id: string | null
                }
                Insert: {
                    code: string
                    created_at?: string
                    id?: string
                    is_active?: boolean
                    name: string
                    role?: string
                    updated_at?: string
                    user_id?: string | null
                }
                Update: {
                    code?: string
                    created_at?: string
                    id?: string
                    is_active?: boolean
                    name?: string
                    role?: string
                    updated_at?: string
                    user_id?: string | null
                }
            }
            piece_counts: {
                Row: {
                    count_qty: number
                    created_at: string
                    execution_event_id: string | null
                    id: string
                    operator_id: string | null
                    pieces_per_cycle: number
                    process_step_id: string
                    production_order_id: string
                    source: string | null
                    ts: string
                    workcenter_id: string | null
                }
                Insert: {
                    count_qty: number
                    created_at?: string
                    execution_event_id?: string | null
                    id?: string
                    operator_id?: string | null
                    pieces_per_cycle?: number
                    process_step_id: string
                    production_order_id: string
                    source?: string | null
                    ts?: string
                    workcenter_id?: string | null
                }
                Update: {
                    count_qty?: number
                    created_at?: string
                    execution_event_id?: string | null
                    id?: string
                    operator_id?: string | null
                    pieces_per_cycle?: number
                    process_step_id?: string
                    production_order_id?: string
                    source?: string | null
                    ts?: string
                    workcenter_id?: string | null
                }
            }
            process_steps: {
                Row: {
                    code: string
                    created_at: string
                    description: string | null
                    id: string
                    name: string
                    sequence: number
                    standard_cycle_time_seconds: number | null
                }
                Insert: {
                    code: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    name: string
                    sequence: number
                    standard_cycle_time_seconds?: number | null
                }
                Update: {
                    code?: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    name?: string
                    sequence?: number
                    standard_cycle_time_seconds?: number | null
                }
            }
            production_orders: {
                Row: {
                    completed_at: string | null
                    created_at: string
                    due_date: string | null
                    erp_order_code: string
                    executed_good_qty: number
                    executed_total_qty: number
                    id: string
                    item_code: string
                    item_description: string | null
                    planned_qty: number
                    started_at: string | null
                    status: Database["public"]["Enums"]["op_status"]
                    type: Database["public"]["Enums"]["op_type"]
                    updated_at: string
                }
                Insert: {
                    completed_at?: string | null
                    created_at?: string
                    due_date?: string | null
                    erp_order_code: string
                    executed_good_qty?: number
                    executed_total_qty?: number
                    id?: string
                    item_code: string
                    item_description?: string | null
                    planned_qty: number
                    started_at?: string | null
                    status?: Database["public"]["Enums"]["op_status"]
                    type?: Database["public"]["Enums"]["op_type"]
                    updated_at?: string
                }
                Update: {
                    completed_at?: string | null
                    created_at?: string
                    due_date?: string | null
                    erp_order_code?: string
                    executed_good_qty?: number
                    executed_total_qty?: number
                    id?: string
                    item_code?: string
                    item_description?: string | null
                    planned_qty?: number
                    started_at?: string | null
                    status?: Database["public"]["Enums"]["op_status"]
                    type?: Database["public"]["Enums"]["op_type"]
                    updated_at?: string
                }
            }
            quality_records: {
                Row: {
                    created_at: string
                    disposition: Database["public"]["Enums"]["quality_disposition"]
                    execution_event_id: string | null
                    id: string
                    lot_id: string | null
                    notes: string | null
                    operator_id: string | null
                    process_step_id: string
                    production_order_id: string
                    qty: number
                    reason_code: string | null
                    reason_id: string | null
                    ts: string
                    workcenter_id: string | null
                }
                Insert: {
                    created_at?: string
                    disposition: Database["public"]["Enums"]["quality_disposition"]
                    execution_event_id?: string | null
                    id?: string
                    lot_id?: string | null
                    notes?: string | null
                    operator_id?: string | null
                    process_step_id: string
                    production_order_id: string
                    qty: number
                    reason_code?: string | null
                    reason_id?: string | null
                    ts?: string
                    workcenter_id?: string | null
                }
                Update: {
                    created_at?: string
                    disposition?: Database["public"]["Enums"]["quality_disposition"]
                    execution_event_id?: string | null
                    id?: string
                    lot_id?: string | null
                    notes?: string | null
                    operator_id?: string | null
                    process_step_id?: string
                    production_order_id?: string
                    qty?: number
                    reason_code?: string | null
                    reason_id?: string | null
                    ts?: string
                    workcenter_id?: string | null
                }
            }
            workcenters: {
                Row: {
                    code: string
                    created_at: string
                    disabled_at: string | null
                    disabled_by: string | null
                    disabled_reason: string | null
                    id: string
                    is_enabled: boolean
                    name: string
                    process_step_id: string | null
                    updated_at: string
                }
                Insert: {
                    code: string
                    created_at?: string
                    disabled_at?: string | null
                    disabled_by?: string | null
                    disabled_reason?: string | null
                    id?: string
                    is_enabled?: boolean
                    name: string
                    process_step_id?: string | null
                    updated_at?: string
                }
                Update: {
                    code?: string
                    created_at?: string
                    disabled_at?: string | null
                    disabled_by?: string | null
                    disabled_reason?: string | null
                    id?: string
                    is_enabled?: boolean
                    name?: string
                    process_step_id?: string | null
                    updated_at?: string
                }
            }
        }
        Enums: {
            approval_status: "PENDING" | "APPROVED" | "REJECTED"
            approval_type: "OVERTIME" | "ENABLE_EQUIPMENT" | "DISABLE_EQUIPMENT" | "SPECIAL_OPERATION"
            downtime_type: "PLANNED" | "UNPLANNED" | "MICRO_STOP"
            event_type: "SCAN" | "START" | "STOP" | "COUNT" | "QUALITY" | "COMPLETE"
            lot_origin: "RAW" | "WIP" | "FINISHED"
            op_status: "OPEN_NOT_STARTED" | "IN_PROGRESS" | "OPEN_PARTIAL" | "CLOSED"
            op_type: "PRODUCTION" | "REPLENISHMENT"
            quality_disposition: "SCRAP_NO_REUSE" | "REUSE"
        }
    }
}
