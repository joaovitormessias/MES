import { Hono } from "jsr:@hono/hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "../types/database.types.ts";

const app = new Hono().basePath("/counts");

function getSupabaseClient() {
    return createClient<Database>(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
}

// POST /counts - Record piece count
app.post("/", async (c) => {
    const supabase = getSupabaseClient();
    const body = await c.req.json();
    const {
        idempotency_key,
        production_order_id,
        process_step_id,
        workcenter_id,
        operator_id,
        count_qty,
        pieces_per_cycle = 1,
        source,
        ts,
    } = body;

    if (!idempotency_key || !production_order_id || !process_step_id || !count_qty) {
        return c.json({
            error: "Missing required fields: idempotency_key, production_order_id, process_step_id, count_qty",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    if (count_qty <= 0) {
        return c.json({
            error: "count_qty must be positive",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    // Idempotency check
    const { data: existingEvent } = await supabase
        .from("execution_events")
        .select("*, piece_counts(*)")
        .eq("idempotency_key", idempotency_key)
        .single();

    if (existingEvent) {
        return c.json({
            data: existingEvent,
            message: "Count already recorded (idempotent response)"
        }, 200);
    }

    const eventTs = ts ?? new Date().toISOString();

    // Create count event
    const { data: event, error: eventError } = await supabase
        .from("execution_events")
        .insert({
            idempotency_key,
            event_type: "COUNT",
            production_order_id,
            process_step_id,
            workcenter_id,
            operator_id,
            ts: eventTs,
            payload: { count_qty, pieces_per_cycle, source },
        })
        .select()
        .single();

    if (eventError) {
        if (eventError.code === "23505") {
            const { data: existing } = await supabase
                .from("execution_events")
                .select("*, piece_counts(*)")
                .eq("idempotency_key", idempotency_key)
                .single();
            return c.json({ data: existing, message: "Count already recorded" }, 200);
        }
        return c.json({ error: eventError.message, code: "INSERT_ERROR" }, 500);
    }

    // Create piece count record
    const { data: countRecord, error: countError } = await supabase
        .from("piece_counts")
        .insert({
            execution_event_id: event.id,
            production_order_id,
            process_step_id,
            workcenter_id,
            operator_id,
            count_qty,
            pieces_per_cycle,
            source,
            ts: eventTs,
        })
        .select()
        .single();

    if (countError) {
        console.error("Failed to create piece count record:", countError);
    }

    // Update step execution totals
    const { data: stepExec } = await supabase
        .from("op_step_executions")
        .select("good_qty")
        .eq("production_order_id", production_order_id)
        .eq("process_step_id", process_step_id)
        .single();

    if (stepExec) {
        await supabase
            .from("op_step_executions")
            .update({
                good_qty: (stepExec.good_qty ?? 0) + count_qty,
                updated_at: new Date().toISOString(),
            })
            .eq("production_order_id", production_order_id)
            .eq("process_step_id", process_step_id);
    }

    return c.json({ data: { event, count: countRecord } }, 201);
});

// GET /counts/:opId - Get count history for an OP
app.get("/:opId", async (c) => {
    const supabase = getSupabaseClient();
    const opId = c.req.param("opId");
    const { step_id } = c.req.query();

    let query = supabase
        .from("piece_counts")
        .select(`
      *,
      process_steps(code, name),
      workcenters(code, name),
      operators(code, name)
    `)
        .eq("production_order_id", opId)
        .order("ts", { ascending: false });

    if (step_id) {
        query = query.eq("process_step_id", step_id);
    }

    const { data, error } = await query;

    if (error) {
        return c.json({ error: error.message, code: "QUERY_ERROR" }, 500);
    }

    // Calculate totals
    const total = data?.reduce((sum, c) => sum + c.count_qty, 0) ?? 0;
    const byStep = data?.reduce((acc, c) => {
        const stepId = c.process_step_id;
        acc[stepId] = (acc[stepId] ?? 0) + c.count_qty;
        return acc;
    }, {} as Record<string, number>);

    return c.json({
        data,
        summary: { total, by_step: byStep }
    });
});

Deno.serve(app.fetch);
