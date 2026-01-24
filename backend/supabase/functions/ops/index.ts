import { Hono } from "jsr:@hono/hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "../types/database.types.ts";

const app = new Hono().basePath("/ops");

// Helper to create Supabase client
function getSupabaseClient(req: Request) {
    return createClient<Database>(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
}

// GET /ops - List/search production orders
app.get("/", async (c) => {
    const supabase = getSupabaseClient(c.req.raw);
    const { status, type, item_code, limit = "50", offset = "0" } = c.req.query();

    let query = supabase
        .from("production_orders")
        .select("*, op_routing_steps(*, process_steps(*))")
        .order("created_at", { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (status) query = query.eq("status", status);
    if (type) query = query.eq("type", type);
    if (item_code) query = query.ilike("item_code", `%${item_code}%`);

    const { data, error } = await query;

    if (error) {
        return c.json({ error: error.message, code: "QUERY_ERROR" }, 500);
    }

    return c.json({ data, count: data?.length ?? 0 });
});

// GET /ops/:id - Get single production order with routing
app.get("/:id", async (c) => {
    const supabase = getSupabaseClient(c.req.raw);
    const id = c.req.param("id");

    const { data, error } = await supabase
        .from("production_orders")
        .select(`
      *,
      op_routing_steps(*, process_steps(*)),
      op_step_executions(*, workcenters(*), operators(*))
    `)
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return c.json({ error: "Production order not found", code: "NOT_FOUND" }, 404);
        }
        return c.json({ error: error.message, code: "QUERY_ERROR" }, 500);
    }

    return c.json({ data });
});

// POST /ops/:id/steps/:stepId/start - Start a process step
app.post("/:id/steps/:stepId/start", async (c) => {
    const supabase = getSupabaseClient(c.req.raw);
    const opId = c.req.param("id");
    const stepId = c.req.param("stepId");
    const body = await c.req.json();
    const { operator_id, workcenter_id, idempotency_key } = body;

    if (!operator_id || !workcenter_id || !idempotency_key) {
        return c.json({
            error: "Missing required fields: operator_id, workcenter_id, idempotency_key",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    // Check if OP exists and is valid
    const { data: op, error: opError } = await supabase
        .from("production_orders")
        .select("*")
        .eq("id", opId)
        .single();

    if (opError || !op) {
        return c.json({ error: "Production order not found", code: "NOT_FOUND" }, 404);
    }

    if (op.status === "CLOSED") {
        return c.json({ error: "Cannot start step on closed order", code: "VALIDATION_ERROR" }, 400);
    }

    // Check workcenter is enabled
    const { data: wc, error: wcError } = await supabase
        .from("workcenters")
        .select("*")
        .eq("id", workcenter_id)
        .single();

    if (wcError || !wc) {
        return c.json({ error: "Workcenter not found", code: "NOT_FOUND" }, 404);
    }

    if (!wc.is_enabled) {
        return c.json({ error: "Workcenter is disabled", code: "VALIDATION_ERROR" }, 400);
    }

    const now = new Date().toISOString();

    // Try to insert execution event (idempotent)
    const { data: existingEvent } = await supabase
        .from("execution_events")
        .select("*")
        .eq("idempotency_key", idempotency_key)
        .single();

    if (existingEvent) {
        return c.json({ data: existingEvent, message: "Event already exists" }, 200);
    }

    // Create execution event
    const { data: event, error: eventError } = await supabase
        .from("execution_events")
        .insert({
            idempotency_key,
            event_type: "START",
            production_order_id: opId,
            process_step_id: stepId,
            workcenter_id,
            operator_id,
            ts: now,
        })
        .select()
        .single();

    if (eventError) {
        return c.json({ error: eventError.message, code: "INSERT_ERROR" }, 500);
    }

    // Update or create step execution
    const { error: execError } = await supabase
        .from("op_step_executions")
        .upsert({
            production_order_id: opId,
            process_step_id: stepId,
            workcenter_id,
            operator_id,
            status: "IN_PROGRESS",
            started_at: now,
        }, {
            onConflict: "production_order_id,process_step_id"
        });

    if (execError) {
        console.error("Failed to update step execution:", execError);
    }

    // Update OP status if first start
    if (op.status === "OPEN_NOT_STARTED") {
        await supabase
            .from("production_orders")
            .update({ status: "IN_PROGRESS", started_at: now, updated_at: now })
            .eq("id", opId);
    }

    return c.json({ data: event }, 201);
});

// POST /ops/:id/steps/:stepId/complete - Complete a process step
app.post("/:id/steps/:stepId/complete", async (c) => {
    const supabase = getSupabaseClient(c.req.raw);
    const opId = c.req.param("id");
    const stepId = c.req.param("stepId");
    const body = await c.req.json();
    const { operator_id, workcenter_id, idempotency_key, good_qty } = body;

    if (!operator_id || !idempotency_key) {
        return c.json({
            error: "Missing required fields: operator_id, idempotency_key",
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
        return c.json({ data: existingEvent, message: "Event already exists" }, 200);
    }

    const now = new Date().toISOString();

    // Create completion event
    const { data: event, error: eventError } = await supabase
        .from("execution_events")
        .insert({
            idempotency_key,
            event_type: "COMPLETE",
            production_order_id: opId,
            process_step_id: stepId,
            workcenter_id,
            operator_id,
            ts: now,
            payload: { good_qty },
        })
        .select()
        .single();

    if (eventError) {
        return c.json({ error: eventError.message, code: "INSERT_ERROR" }, 500);
    }

    // Update step execution
    await supabase
        .from("op_step_executions")
        .update({
            status: "CLOSED",
            completed_at: now,
            good_qty: good_qty ?? 0,
            updated_at: now,
        })
        .eq("production_order_id", opId)
        .eq("process_step_id", stepId);

    // Update OP executed quantities
    if (good_qty) {
        const { data: op } = await supabase
            .from("production_orders")
            .select("executed_good_qty, executed_total_qty")
            .eq("id", opId)
            .single();

        if (op) {
            await supabase
                .from("production_orders")
                .update({
                    executed_good_qty: (op.executed_good_qty ?? 0) + good_qty,
                    executed_total_qty: (op.executed_total_qty ?? 0) + good_qty,
                    updated_at: now,
                })
                .eq("id", opId);
        }
    }

    return c.json({ data: event }, 201);
});

Deno.serve(app.fetch);
