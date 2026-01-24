import { Hono } from "jsr:@hono/hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "../types/database.types.ts";

const app = new Hono().basePath("/traceability");

function getSupabaseClient() {
    return createClient<Database>(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
}

// GET /traceability/lots/:lotId - Get lot timeline
app.get("/lots/:lotId", async (c) => {
    const supabase = getSupabaseClient();
    const lotId = c.req.param("lotId");

    // Get lot info
    const { data: lot, error: lotError } = await supabase
        .from("lots")
        .select(`
      *,
      production_orders(erp_order_code, item_code, status)
    `)
        .eq("id", lotId)
        .single();

    if (lotError || !lot) {
        return c.json({ error: "Lot not found", code: "NOT_FOUND" }, 404);
    }

    // Get all events for this lot
    const { data: events, error: eventsError } = await supabase
        .from("execution_events")
        .select(`
      id,
      event_type,
      ts,
      scan_raw,
      payload,
      process_steps(code, name, sequence),
      workcenters(code, name),
      operators(code, name)
    `)
        .eq("lot_id", lotId)
        .order("ts", { ascending: true });

    if (eventsError) {
        return c.json({ error: eventsError.message, code: "QUERY_ERROR" }, 500);
    }

    // Get quality records
    const { data: qualityRecords } = await supabase
        .from("quality_records")
        .select(`
      id,
      disposition,
      reason_code,
      qty,
      ts,
      process_steps(code, name)
    `)
        .eq("lot_id", lotId)
        .order("ts", { ascending: true });

    // Build timeline
    const timeline = [
        ...((events ?? []).map(e => ({
            type: "event",
            event_type: e.event_type,
            ts: e.ts,
            step: e.process_steps,
            workcenter: e.workcenters,
            operator: e.operators,
            details: e.payload,
        }))),
        ...((qualityRecords ?? []).map(q => ({
            type: "quality",
            disposition: q.disposition,
            ts: q.ts,
            step: q.process_steps,
            qty: q.qty,
            reason: q.reason_code,
        }))),
    ].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

    return c.json({
        lot: {
            id: lot.id,
            code: lot.lot_code,
            item_code: lot.item_code,
            origin: lot.origin,
            quantity: lot.quantity,
            production_order: lot.production_orders,
        },
        timeline,
        summary: {
            total_events: events?.length ?? 0,
            total_quality_records: qualityRecords?.length ?? 0,
            steps_completed: [...new Set(events?.filter(e => e.event_type === "COMPLETE").map(e => e.process_steps?.code))],
        }
    });
});

// GET /traceability/ops/:opId - Get OP traceability
app.get("/ops/:opId", async (c) => {
    const supabase = getSupabaseClient();
    const opId = c.req.param("opId");

    // Get OP with routing
    const { data: op, error: opError } = await supabase
        .from("production_orders")
        .select(`
      *,
      op_routing_steps(*, process_steps(*)),
      op_step_executions(*, process_steps(*), operators(*), workcenters(*))
    `)
        .eq("id", opId)
        .single();

    if (opError || !op) {
        return c.json({ error: "Production order not found", code: "NOT_FOUND" }, 404);
    }

    // Get all events for this OP
    const { data: events } = await supabase
        .from("execution_events")
        .select(`
      id,
      event_type,
      ts,
      process_steps(code, name, sequence),
      workcenters(code, name),
      operators(code, name),
      lots(lot_code)
    `)
        .eq("production_order_id", opId)
        .order("ts", { ascending: true });

    // Get related lots
    const { data: lots } = await supabase
        .from("lots")
        .select("id, lot_code, item_code, quantity")
        .eq("production_order_id", opId);

    // Check for replenishment links
    const { data: replenishments } = await supabase
        .from("replenishment_links")
        .select(`
      *,
      replenishment_order:replenishment_order_id(erp_order_code, status, planned_qty)
    `)
        .eq("original_order_id", opId);

    return c.json({
        production_order: op,
        events,
        lots,
        replenishments,
        summary: {
            steps_in_routing: op.op_routing_steps?.length ?? 0,
            steps_started: op.op_step_executions?.filter((e: any) => e.started_at)?.length ?? 0,
            steps_completed: op.op_step_executions?.filter((e: any) => e.completed_at)?.length ?? 0,
        }
    });
});

// GET /traceability/labels/:labelId - Get final product genealogy
app.get("/labels/:labelId", async (c) => {
    const supabase = getSupabaseClient();
    const labelId = c.req.param("labelId");

    // Get label print job
    const { data: label, error: labelError } = await supabase
        .from("label_print_jobs")
        .select(`
      *,
      production_orders(*),
      lots(*),
      operators(code, name)
    `)
        .eq("id", labelId)
        .single();

    if (labelError || !label) {
        return c.json({ error: "Label not found", code: "NOT_FOUND" }, 404);
    }

    // Get full OP traceability
    let opTrace = null;
    if (label.production_order_id) {
        const { data } = await supabase
            .from("execution_events")
            .select(`
        event_type,
        ts,
        process_steps(code, name),
        operators(code, name)
      `)
            .eq("production_order_id", label.production_order_id)
            .order("ts", { ascending: true });
        opTrace = data;
    }

    return c.json({
        label: {
            id: label.id,
            type: label.label_type,
            quantity: label.quantity,
            printed_at: label.printed_at,
            printed_by: label.operators,
            data: label.label_data,
        },
        production_order: label.production_orders,
        lot: label.lots,
        genealogy: opTrace,
    });
});

Deno.serve(app.fetch);
