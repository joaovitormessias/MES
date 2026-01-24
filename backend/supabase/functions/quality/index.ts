import { Hono } from "jsr:@hono/hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "../types/database.types.ts";

const app = new Hono().basePath("/quality");

function getSupabaseClient() {
    return createClient<Database>(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
}

// POST /quality - Record quality event (scrap/reuse)
app.post("/", async (c) => {
    const supabase = getSupabaseClient();
    const body = await c.req.json();
    const {
        idempotency_key,
        production_order_id,
        lot_id,
        process_step_id,
        workcenter_id,
        operator_id,
        disposition,
        reason_id,
        reason_code,
        qty,
        notes,
        ts,
    } = body;

    if (!idempotency_key || !production_order_id || !process_step_id || !disposition || !qty) {
        return c.json({
            error: "Missing required fields: idempotency_key, production_order_id, process_step_id, disposition, qty",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    if (!["SCRAP_NO_REUSE", "REUSE"].includes(disposition)) {
        return c.json({
            error: "Invalid disposition: must be SCRAP_NO_REUSE or REUSE",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    if (qty <= 0) {
        return c.json({
            error: "qty must be positive",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    // Idempotency check
    const { data: existingEvent } = await supabase
        .from("execution_events")
        .select("*")
        .eq("idempotency_key", idempotency_key)
        .single();

    if (existingEvent) {
        const { data: existingQuality } = await supabase
            .from("quality_records")
            .select("*")
            .eq("execution_event_id", existingEvent.id)
            .single();

        return c.json({
            data: { event: existingEvent, quality: existingQuality },
            message: "Quality record already exists"
        }, 200);
    }

    const eventTs = ts ?? new Date().toISOString();

    // Create quality event
    const { data: event, error: eventError } = await supabase
        .from("execution_events")
        .insert({
            idempotency_key,
            event_type: "QUALITY",
            production_order_id,
            lot_id,
            process_step_id,
            workcenter_id,
            operator_id,
            ts: eventTs,
            payload: { disposition, reason_code, qty },
        })
        .select()
        .single();

    if (eventError) {
        if (eventError.code === "23505") {
            return c.json({ message: "Quality record already exists" }, 200);
        }
        return c.json({ error: eventError.message, code: "INSERT_ERROR" }, 500);
    }

    // Create quality record
    const { data: qualityRecord, error: qualityError } = await supabase
        .from("quality_records")
        .insert({
            execution_event_id: event.id,
            production_order_id,
            lot_id,
            process_step_id,
            workcenter_id,
            operator_id,
            disposition,
            reason_id,
            reason_code,
            qty,
            notes,
            ts: eventTs,
        })
        .select()
        .single();

    if (qualityError) {
        console.error("Failed to create quality record:", qualityError);
    }

    // Update step execution scrap/reuse counts
    const { data: stepExec } = await supabase
        .from("op_step_executions")
        .select("scrap_qty, reuse_qty")
        .eq("production_order_id", production_order_id)
        .eq("process_step_id", process_step_id)
        .single();

    if (stepExec) {
        const updates = disposition === "SCRAP_NO_REUSE"
            ? { scrap_qty: (stepExec.scrap_qty ?? 0) + qty }
            : { reuse_qty: (stepExec.reuse_qty ?? 0) + qty };

        await supabase
            .from("op_step_executions")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("production_order_id", production_order_id)
            .eq("process_step_id", process_step_id);
    }

    // Check if replenishment is needed
    const { data: op } = await supabase
        .from("production_orders")
        .select("planned_qty, executed_good_qty, type")
        .eq("id", production_order_id)
        .single();

    let replenishmentTriggered = false;

    if (op && op.type === "PRODUCTION") {
        // Get total scrap for this OP
        const { data: scrapTotals } = await supabase
            .from("quality_records")
            .select("qty")
            .eq("production_order_id", production_order_id)
            .eq("disposition", "SCRAP_NO_REUSE");

        const totalScrap = scrapTotals?.reduce((sum, r) => sum + r.qty, 0) ?? 0;
        const expectedGood = op.planned_qty - totalScrap;
        const shortage = op.planned_qty - (op.executed_good_qty ?? 0) - expectedGood;

        // Trigger replenishment if shortage > 5% of planned
        if (shortage > 0 && shortage / op.planned_qty > 0.05) {
            replenishmentTriggered = true;
            // Note: Actual replenishment OP creation would be done here
            // For now, we just flag it
        }
    }

    return c.json({
        data: { event, quality: qualityRecord },
        replenishment_triggered: replenishmentTriggered
    }, 201);
});

// GET /quality/reasons - Get quality reason codes
app.get("/reasons", async (c) => {
    const supabase = getSupabaseClient();
    const { disposition } = c.req.query();

    let query = supabase
        .from("quality_reasons")
        .select("*")
        .eq("is_active", true)
        .order("code");

    if (disposition) {
        query = query.eq("disposition", disposition);
    }

    const { data, error } = await query;

    if (error) {
        return c.json({ error: error.message, code: "QUERY_ERROR" }, 500);
    }

    return c.json({ data });
});

// GET /quality/summary/:opId - Get quality summary for an OP
app.get("/summary/:opId", async (c) => {
    const supabase = getSupabaseClient();
    const opId = c.req.param("opId");

    const { data, error } = await supabase
        .from("quality_records")
        .select(`
      *,
      process_steps(code, name),
      quality_reasons(code, description)
    `)
        .eq("production_order_id", opId)
        .order("ts", { ascending: false });

    if (error) {
        return c.json({ error: error.message, code: "QUERY_ERROR" }, 500);
    }

    // Calculate summary
    const scrapTotal = data?.filter(r => r.disposition === "SCRAP_NO_REUSE")
        .reduce((sum, r) => sum + r.qty, 0) ?? 0;
    const reuseTotal = data?.filter(r => r.disposition === "REUSE")
        .reduce((sum, r) => sum + r.qty, 0) ?? 0;

    // Group by reason
    const byReason = data?.reduce((acc, r) => {
        const key = r.reason_code ?? "UNKNOWN";
        if (!acc[key]) acc[key] = { scrap: 0, reuse: 0 };
        if (r.disposition === "SCRAP_NO_REUSE") acc[key].scrap += r.qty;
        else acc[key].reuse += r.qty;
        return acc;
    }, {} as Record<string, { scrap: number; reuse: number }>);

    return c.json({
        data,
        summary: {
            total_scrap: scrapTotal,
            total_reuse: reuseTotal,
            by_reason: byReason
        }
    });
});

Deno.serve(app.fetch);
