import { Hono } from "jsr:@hono/hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "../types/database.types.ts";

const app = new Hono().basePath("/scans");

function getSupabaseClient() {
    return createClient<Database>(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
}

// POST /scans - Ingest barcode scan (idempotent)
app.post("/", async (c) => {
    const supabase = getSupabaseClient();
    const body = await c.req.json();
    const {
        idempotency_key,
        scan_raw,
        production_order_id,
        lot_id,
        process_step_id,
        workcenter_id,
        operator_id,
        ts,
    } = body;

    // Validate required fields
    if (!idempotency_key) {
        return c.json({
            error: "Missing required field: idempotency_key",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    if (!production_order_id || !process_step_id || !workcenter_id || !operator_id) {
        return c.json({
            error: "Missing required fields: production_order_id, process_step_id, workcenter_id, operator_id",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    // Idempotency check - return existing event if found
    const { data: existingEvent } = await supabase
        .from("execution_events")
        .select("*")
        .eq("idempotency_key", idempotency_key)
        .single();

    if (existingEvent) {
        return c.json({
            data: existingEvent,
            message: "Event already exists (idempotent response)"
        }, 200);
    }

    // Validate OP exists and is not closed
    const { data: op, error: opError } = await supabase
        .from("production_orders")
        .select("id, status, item_code, planned_qty, executed_good_qty")
        .eq("id", production_order_id)
        .single();

    if (opError || !op) {
        return c.json({
            error: "Production order not found",
            code: "NOT_FOUND"
        }, 404);
    }

    if (op.status === "CLOSED") {
        return c.json({
            error: "Production order is closed",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    // Validate workcenter exists and is enabled
    const { data: wc, error: wcError } = await supabase
        .from("workcenters")
        .select("id, is_enabled, process_step_id")
        .eq("id", workcenter_id)
        .single();

    if (wcError || !wc) {
        return c.json({
            error: "Workcenter not found",
            code: "NOT_FOUND"
        }, 404);
    }

    if (!wc.is_enabled) {
        return c.json({
            error: "Workcenter is disabled",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    // Validate workcenter can perform this process step
    if (wc.process_step_id && wc.process_step_id !== process_step_id) {
        return c.json({
            error: "Workcenter is not configured for this process step",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    // Check material availability from previous step (if not first step)
    const { data: step } = await supabase
        .from("process_steps")
        .select("sequence")
        .eq("id", process_step_id)
        .single();

    if (step && step.sequence > 1) {
        // Find previous step
        const { data: prevStep } = await supabase
            .from("process_steps")
            .select("id")
            .eq("sequence", step.sequence - 1)
            .single();

        if (prevStep) {
            // Check if previous step completed
            const { data: prevExec } = await supabase
                .from("op_step_executions")
                .select("status, good_qty")
                .eq("production_order_id", production_order_id)
                .eq("process_step_id", prevStep.id)
                .single();

            if (!prevExec || prevExec.status !== "CLOSED") {
                return c.json({
                    error: "Previous process step not completed",
                    code: "VALIDATION_ERROR",
                    details: { previous_step_id: prevStep.id }
                }, 400);
            }

            if ((prevExec.good_qty ?? 0) <= 0) {
                return c.json({
                    error: "No material available from previous step",
                    code: "VALIDATION_ERROR"
                }, 400);
            }
        }
    }

    const eventTs = ts ?? new Date().toISOString();

    // Insert scan event
    const { data: event, error: eventError } = await supabase
        .from("execution_events")
        .insert({
            idempotency_key,
            event_type: "SCAN",
            production_order_id,
            lot_id,
            process_step_id,
            workcenter_id,
            operator_id,
            scan_raw,
            ts: eventTs,
        })
        .select()
        .single();

    if (eventError) {
        // Handle unique constraint violation (concurrent insert)
        if (eventError.code === "23505") {
            const { data: existingEvent } = await supabase
                .from("execution_events")
                .select("*")
                .eq("idempotency_key", idempotency_key)
                .single();

            if (existingEvent) {
                return c.json({
                    data: existingEvent,
                    message: "Event already exists (concurrent insert)"
                }, 200);
            }
        }
        return c.json({
            error: eventError.message,
            code: "INSERT_ERROR"
        }, 500);
    }

    return c.json({
        data: event,
        validation: {
            op_status: op.status,
            workcenter_enabled: wc.is_enabled,
        }
    }, 201);
});

// GET /scans/:id - Get scan event by ID
app.get("/:id", async (c) => {
    const supabase = getSupabaseClient();
    const id = c.req.param("id");

    const { data, error } = await supabase
        .from("execution_events")
        .select(`
      *,
      production_orders(erp_order_code, item_code, status),
      process_steps(code, name),
      workcenters(code, name),
      operators(code, name)
    `)
        .eq("id", id)
        .eq("event_type", "SCAN")
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return c.json({ error: "Scan event not found", code: "NOT_FOUND" }, 404);
        }
        return c.json({ error: error.message, code: "QUERY_ERROR" }, 500);
    }

    return c.json({ data });
});

Deno.serve(app.fetch);
