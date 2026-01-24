import { supabase, callEdgeFunction } from "./supabase";

// ============================================================================
// Types
// ============================================================================

export type UUID = string;

export interface ProductionOrder {
    id: UUID;
    erp_order_code: string;
    type: "PRODUCTION" | "REPLENISHMENT";
    status: "OPEN_NOT_STARTED" | "IN_PROGRESS" | "OPEN_PARTIAL" | "CLOSED";
    item_code: string;
    planned_qty: number;
    executed_good_qty: number;
    executed_total_qty: number;
    due_date: string;
    priority: number;
    created_at: string;
    updated_at: string;
    started_at?: string;
    completed_at?: string;
    op_routing_steps?: RoutingStep[];
    op_step_executions?: StepExecution[];
}

export interface RoutingStep {
    id: UUID;
    production_order_id: UUID;
    process_step_id: UUID;
    sequence: number;
    process_steps?: ProcessStep;
}

export interface ProcessStep {
    id: UUID;
    code: string;
    name: string;
    sequence: number;
}

export interface StepExecution {
    id: UUID;
    production_order_id: UUID;
    process_step_id: UUID;
    workcenter_id: UUID;
    operator_id?: UUID;
    status: "NOT_STARTED" | "IN_PROGRESS" | "CLOSED" | "PAUSED";
    started_at?: string;
    completed_at?: string;
    good_qty: number;
    scrap_qty: number;
}

export interface ExecutionEvent {
    id: UUID;
    idempotency_key: string;
    event_type: "SCAN" | "START" | "STOP" | "COUNT" | "QUALITY" | "COMPLETE";
    production_order_id: UUID;
    lot_id?: UUID;
    process_step_id: UUID;
    workcenter_id: UUID;
    operator_id: UUID;
    ts: string;
    payload?: Record<string, unknown>;
}

export interface OEEFactor {
    value: string;
    numeric: number;
    planned_time_seconds?: number;
    planned_downtime_seconds?: number;
    unplanned_downtime_seconds?: number;
    running_time_seconds?: number;
    total_produced?: number;
    ideal_production?: number;
    avg_cycle_time_seconds?: number;
    good_count?: number;
    scrap_count?: number;
}

export interface OEEData {
    period: {
        start: string;
        end: string;
        days: number;
    };
    workcenter_id: string;
    oee: { value: string; numeric: number };
    factors: {
        availability: OEEFactor;
        performance: OEEFactor;
        quality: OEEFactor;
    };
    losses: {
        availability_loss: string;
        performance_loss: string;
        quality_loss: string;
    };
}

export interface ShiftDashboard {
    date: string;
    summary: {
        total_planned: number;
        total_executed: number;
        today_counts: number;
        completion_rate: string;
    };
    orders: ProductionOrder[];
    hourly_production: Record<number, number>;
}

export interface Workcenter {
    id: UUID;
    code: string;
    name: string;
    type: string;
    is_enabled: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

export const mesApi = {
    // -------------------------------------------------------------------------
    // Production Orders
    // -------------------------------------------------------------------------
    async getOps(filters?: {
        status?: string;
        type?: string;
        item_code?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ data: ProductionOrder[]; count: number }> {
        const params: Record<string, string> = {};
        if (filters?.status) params.status = filters.status;
        if (filters?.type) params.type = filters.type;
        if (filters?.item_code) params.item_code = filters.item_code;
        if (filters?.limit) params.limit = String(filters.limit);
        if (filters?.offset) params.offset = String(filters.offset);

        const { data, error } = await callEdgeFunction<{ data: ProductionOrder[]; count: number }>(
            "ops",
            { params }
        );

        if (error) throw error;
        return data ?? { data: [], count: 0 };
    },

    async getOpById(id: UUID): Promise<ProductionOrder> {
        const { data, error } = await callEdgeFunction<{ data: ProductionOrder }>(
            `ops/${id}`
        );

        if (error) throw error;
        return data!.data;
    },

    async startStep(
        opId: UUID,
        stepId: UUID,
        operatorId: UUID,
        workcenterId: UUID,
        idempotencyKey: string
    ): Promise<ExecutionEvent> {
        const { data, error } = await callEdgeFunction<{ data: ExecutionEvent }>(
            `ops/${opId}/steps/${stepId}/start`,
            {
                method: "POST",
                body: {
                    operator_id: operatorId,
                    workcenter_id: workcenterId,
                    idempotency_key: idempotencyKey,
                },
            }
        );

        if (error) throw error;
        return data!.data;
    },

    async completeStep(
        opId: UUID,
        stepId: UUID,
        operatorId: UUID,
        idempotencyKey: string,
        goodQty?: number
    ): Promise<ExecutionEvent> {
        const { data, error } = await callEdgeFunction<{ data: ExecutionEvent }>(
            `ops/${opId}/steps/${stepId}/complete`,
            {
                method: "POST",
                body: {
                    operator_id: operatorId,
                    idempotency_key: idempotencyKey,
                    good_qty: goodQty,
                },
            }
        );

        if (error) throw error;
        return data!.data;
    },

    // -------------------------------------------------------------------------
    // Scans
    // -------------------------------------------------------------------------
    async recordScan(params: {
        idempotencyKey: string;
        scanRaw: string;
        productionOrderId: UUID;
        processStepId: UUID;
        workcenterId: UUID;
        operatorId: UUID;
        lotId?: UUID;
    }): Promise<ExecutionEvent> {
        const { data, error } = await callEdgeFunction<{ data: ExecutionEvent }>(
            "scans",
            {
                method: "POST",
                body: {
                    idempotency_key: params.idempotencyKey,
                    scan_raw: params.scanRaw,
                    production_order_id: params.productionOrderId,
                    process_step_id: params.processStepId,
                    workcenter_id: params.workcenterId,
                    operator_id: params.operatorId,
                    lot_id: params.lotId,
                },
            }
        );

        if (error) throw error;
        return data!.data;
    },

    // -------------------------------------------------------------------------
    // Counts
    // -------------------------------------------------------------------------
    async recordCount(params: {
        idempotencyKey: string;
        productionOrderId: UUID;
        processStepId: UUID;
        workcenterId: UUID;
        operatorId: UUID;
        countQty: number;
        piecesPerCycle?: number;
        source?: string;
    }): Promise<{ event: ExecutionEvent; count: unknown }> {
        const { data, error } = await callEdgeFunction<{ data: { event: ExecutionEvent; count: unknown } }>(
            "counts",
            {
                method: "POST",
                body: {
                    idempotency_key: params.idempotencyKey,
                    production_order_id: params.productionOrderId,
                    process_step_id: params.processStepId,
                    workcenter_id: params.workcenterId,
                    operator_id: params.operatorId,
                    count_qty: params.countQty,
                    pieces_per_cycle: params.piecesPerCycle,
                    source: params.source,
                },
            }
        );

        if (error) throw error;
        return data!.data;
    },

    // -------------------------------------------------------------------------
    // Quality
    // -------------------------------------------------------------------------
    async recordQuality(params: {
        idempotencyKey: string;
        productionOrderId: UUID;
        processStepId: UUID;
        workcenterId?: UUID;
        operatorId?: UUID;
        lotId?: UUID;
        disposition: "SCRAP_NO_REUSE" | "REUSE";
        reasonCode: string;
        qty: number;
        notes?: string;
    }): Promise<{ event: ExecutionEvent; quality: unknown; replenishmentTriggered: boolean }> {
        const { data, error } = await callEdgeFunction<{
            data: { event: ExecutionEvent; quality: unknown };
            replenishment_triggered: boolean;
        }>("quality", {
            method: "POST",
            body: {
                idempotency_key: params.idempotencyKey,
                production_order_id: params.productionOrderId,
                process_step_id: params.processStepId,
                workcenter_id: params.workcenterId,
                operator_id: params.operatorId,
                lot_id: params.lotId,
                disposition: params.disposition,
                reason_code: params.reasonCode,
                qty: params.qty,
                notes: params.notes,
            },
        });

        if (error) throw error;
        return {
            event: data!.data.event,
            quality: data!.data.quality,
            replenishmentTriggered: data!.replenishment_triggered,
        };
    },

    // -------------------------------------------------------------------------
    // Dashboards
    // -------------------------------------------------------------------------
    async getShiftDashboard(
        date?: string,
        workcenterId?: UUID
    ): Promise<ShiftDashboard> {
        const params: Record<string, string> = {};
        if (date) params.date = date;
        if (workcenterId) params.workcenter_id = workcenterId;

        const { data, error } = await callEdgeFunction<ShiftDashboard>(
            "dashboards/shift",
            { params }
        );

        if (error) throw error;
        return data!;
    },

    async getQualityDashboard(days?: number): Promise<{
        summary: { total_scrap: number; total_reuse: number; scrap_rate: string };
        by_step: Record<string, { scrap: number; reuse: number }>;
        top_reasons: [string, number][];
    }> {
        const params: Record<string, string> = {};
        if (days) params.days = String(days);

        const { data, error } = await callEdgeFunction<{
            summary: { total_scrap: number; total_reuse: number; scrap_rate: string };
            by_step: Record<string, { scrap: number; reuse: number }>;
            top_reasons: [string, number][];
        }>("dashboards/quality", { params });

        if (error) throw error;
        return data!;
    },

    async getUtilizationDashboard(date?: string): Promise<{
        date: string;
        workcenters: Array<{
            workcenter_id: UUID;
            code: string;
            name: string;
            is_enabled: boolean;
            utilization_rate: string;
        }>;
    }> {
        const params: Record<string, string> = {};
        if (date) params.date = date;

        const { data, error } = await callEdgeFunction<{
            date: string;
            workcenters: Array<{
                workcenter_id: UUID;
                code: string;
                name: string;
                is_enabled: boolean;
                utilization_rate: string;
            }>;
        }>("dashboards/utilization", { params });

        if (error) throw error;
        return data!;
    },

    // -------------------------------------------------------------------------
    // KPIs
    // -------------------------------------------------------------------------
    async getOEE(params?: {
        workcenterId?: UUID;
        date?: string;
        days?: number;
    }): Promise<OEEData> {
        const queryParams: Record<string, string> = {};
        if (params?.workcenterId) queryParams.workcenter_id = params.workcenterId;
        if (params?.date) queryParams.date = params.date;
        if (params?.days) queryParams.days = String(params.days);

        const { data, error } = await callEdgeFunction<OEEData>(
            "kpis/oee",
            { params: queryParams }
        );

        if (error) throw error;
        return data!;
    },

    async getMTTR(workcenterId?: UUID, days?: number): Promise<{
        mttr: { seconds: number; minutes: string; hours: string };
        total_repairs: number;
    }> {
        const params: Record<string, string> = {};
        if (workcenterId) params.workcenter_id = workcenterId;
        if (days) params.days = String(days);

        const { data, error } = await callEdgeFunction<{
            mttr: { seconds: number; minutes: string; hours: string };
            total_repairs: number;
        }>("kpis/mttr", { params });

        if (error) throw error;
        return data!;
    },

    async getMTBF(workcenterId?: UUID, days?: number): Promise<{
        mtbf: { hours: string; days: string };
        total_failures: number;
    }> {
        const params: Record<string, string> = {};
        if (workcenterId) params.workcenter_id = workcenterId;
        if (days) params.days = String(days);

        const { data, error } = await callEdgeFunction<{
            mtbf: { hours: string; days: string };
            total_failures: number;
        }>("kpis/mtbf", { params });

        if (error) throw error;
        return data!;
    },

    // -------------------------------------------------------------------------
    // Traceability
    // -------------------------------------------------------------------------
    async getLotTraceability(lotId: UUID): Promise<{
        lot: unknown;
        timeline: unknown[];
        summary: unknown;
    }> {
        const { data, error } = await callEdgeFunction<{
            lot: unknown;
            timeline: unknown[];
            summary: unknown;
        }>(`traceability/lots/${lotId}`);

        if (error) throw error;
        return data!;
    },

    async getOpTraceability(opId: UUID): Promise<{
        production_order: ProductionOrder;
        events: ExecutionEvent[];
        lots: unknown[];
        replenishments: unknown[];
        summary: unknown;
    }> {
        const { data, error } = await callEdgeFunction<{
            production_order: ProductionOrder;
            events: ExecutionEvent[];
            lots: unknown[];
            replenishments: unknown[];
            summary: unknown;
        }>(`traceability/ops/${opId}`);

        if (error) throw error;
        return data!;
    },

    // -------------------------------------------------------------------------
    // Approvals
    // -------------------------------------------------------------------------
    async requestApproval(params: {
        type: "OVERTIME" | "ENABLE_EQUIPMENT" | "DISABLE_EQUIPMENT" | "SPECIAL_OPERATION";
        referenceId?: UUID;
        referenceType?: string;
        requestedBy: UUID;
        justification: string;
    }): Promise<unknown> {
        const { data, error } = await callEdgeFunction<{ data: unknown }>(
            "approvals",
            {
                method: "POST",
                body: {
                    type: params.type,
                    reference_id: params.referenceId,
                    reference_type: params.referenceType,
                    requested_by: params.requestedBy,
                    justification: params.justification,
                },
            }
        );

        if (error) throw error;
        return data!.data;
    },

    async getPendingApprovals(): Promise<{ total: number; by_type: Record<string, number> }> {
        const { data, error } = await callEdgeFunction<{ total: number; by_type: Record<string, number> }>(
            "approvals/pending"
        );

        if (error) throw error;
        return data!;
    },

    // -------------------------------------------------------------------------
    // Direct Supabase Queries (for real-time data)
    // -------------------------------------------------------------------------
    async getWorkcenters(): Promise<Workcenter[]> {
        const { data, error } = await supabase
            .from("workcenters")
            .select("*")
            .eq("is_enabled", true)
            .order("code");

        if (error) throw error;
        return data ?? [];
    },

    async getProcessSteps(): Promise<ProcessStep[]> {
        const { data, error } = await supabase
            .from("process_steps")
            .select("*")
            .order("sequence");

        if (error) throw error;
        return data ?? [];
    },
};

export default mesApi;
