import { Hono } from "jsr:@hono/hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "../types/database.types.ts";

const app = new Hono().basePath("/approvals");

function getSupabaseClient() {
    return createClient<Database>(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
}

// POST /approvals - Request approval
app.post("/", async (c) => {
    const supabase = getSupabaseClient();
    const body = await c.req.json();
    const {
        type,
        reference_id,
        reference_type,
        requested_by,
        justification,
    } = body;

    if (!type || !requested_by) {
        return c.json({
            error: "Missing required fields: type, requested_by",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    if (!["OVERTIME", "ENABLE_EQUIPMENT", "DISABLE_EQUIPMENT", "SPECIAL_OPERATION"].includes(type)) {
        return c.json({
            error: "Invalid type",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    const { data, error } = await supabase
        .from("approvals")
        .insert({
            type,
            reference_id,
            reference_type,
            requested_by,
            justification,
            status: "PENDING",
        })
        .select(`
      *,
      requester:requested_by(code, name)
    `)
        .single();

    if (error) {
        return c.json({ error: error.message, code: "INSERT_ERROR" }, 500);
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
        action: "APPROVAL_REQUESTED",
        entity_type: "approval",
        entity_id: data.id,
        operator_id: requested_by,
        new_values: { type, reference_id, justification },
    });

    return c.json({ data }, 201);
});

// GET /approvals - List approvals
app.get("/", async (c) => {
    const supabase = getSupabaseClient();
    const { status, type, limit = "50" } = c.req.query();

    let query = supabase
        .from("approvals")
        .select(`
      *,
      requester:requested_by(code, name),
      approver:approved_by(code, name)
    `)
        .order("requested_at", { ascending: false })
        .limit(parseInt(limit));

    if (status) query = query.eq("status", status);
    if (type) query = query.eq("type", type);

    const { data, error } = await query;

    if (error) {
        return c.json({ error: error.message, code: "QUERY_ERROR" }, 500);
    }

    return c.json({ data });
});

// GET /approvals/pending - Get pending approvals count
app.get("/pending", async (c) => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from("approvals")
        .select("type")
        .eq("status", "PENDING");

    if (error) {
        return c.json({ error: error.message, code: "QUERY_ERROR" }, 500);
    }

    const byType = data?.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return c.json({
        total: data?.length ?? 0,
        by_type: byType,
    });
});

// POST /approvals/:id/approve - Approve request
app.post("/:id/approve", async (c) => {
    const supabase = getSupabaseClient();
    const id = c.req.param("id");
    const body = await c.req.json();
    const { approved_by, response_notes } = body;

    if (!approved_by) {
        return c.json({
            error: "Missing required field: approved_by",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    // Check approver has manager role
    const { data: approver } = await supabase
        .from("operators")
        .select("role")
        .eq("id", approved_by)
        .single();

    if (!approver || !["manager", "pcp", "admin"].includes(approver.role)) {
        return c.json({
            error: "Approver must have manager, pcp, or admin role",
            code: "FORBIDDEN"
        }, 403);
    }

    // Get current approval
    const { data: approval, error: getError } = await supabase
        .from("approvals")
        .select("*")
        .eq("id", id)
        .single();

    if (getError || !approval) {
        return c.json({ error: "Approval not found", code: "NOT_FOUND" }, 404);
    }

    if (approval.status !== "PENDING") {
        return c.json({
            error: "Approval is not pending",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    const now = new Date().toISOString();

    // Update approval
    const { data, error } = await supabase
        .from("approvals")
        .update({
            status: "APPROVED",
            approved_by,
            response_notes,
            responded_at: now,
        })
        .eq("id", id)
        .select(`
      *,
      requester:requested_by(code, name),
      approver:approved_by(code, name)
    `)
        .single();

    if (error) {
        return c.json({ error: error.message, code: "UPDATE_ERROR" }, 500);
    }

    // Apply side effects based on type
    if (approval.type === "ENABLE_EQUIPMENT" && approval.reference_id) {
        await supabase
            .from("workcenters")
            .update({
                is_enabled: true,
                disabled_reason: null,
                disabled_at: null,
                disabled_by: null,
                updated_at: now,
            })
            .eq("id", approval.reference_id);
    } else if (approval.type === "DISABLE_EQUIPMENT" && approval.reference_id) {
        await supabase
            .from("workcenters")
            .update({
                is_enabled: false,
                disabled_reason: approval.justification,
                disabled_at: now,
                disabled_by: approved_by,
                updated_at: now,
            })
            .eq("id", approval.reference_id);
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
        action: "APPROVAL_APPROVED",
        entity_type: "approval",
        entity_id: id,
        operator_id: approved_by,
        old_values: { status: "PENDING" },
        new_values: { status: "APPROVED", response_notes },
    });

    return c.json({ data });
});

// POST /approvals/:id/reject - Reject request
app.post("/:id/reject", async (c) => {
    const supabase = getSupabaseClient();
    const id = c.req.param("id");
    const body = await c.req.json();
    const { approved_by, response_notes } = body;

    if (!approved_by || !response_notes) {
        return c.json({
            error: "Missing required fields: approved_by, response_notes (justification required for reject)",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    // Check approver role
    const { data: approver } = await supabase
        .from("operators")
        .select("role")
        .eq("id", approved_by)
        .single();

    if (!approver || !["manager", "pcp", "admin"].includes(approver.role)) {
        return c.json({
            error: "Approver must have manager, pcp, or admin role",
            code: "FORBIDDEN"
        }, 403);
    }

    const { data: approval } = await supabase
        .from("approvals")
        .select("status")
        .eq("id", id)
        .single();

    if (!approval) {
        return c.json({ error: "Approval not found", code: "NOT_FOUND" }, 404);
    }

    if (approval.status !== "PENDING") {
        return c.json({
            error: "Approval is not pending",
            code: "VALIDATION_ERROR"
        }, 400);
    }

    const { data, error } = await supabase
        .from("approvals")
        .update({
            status: "REJECTED",
            approved_by,
            response_notes,
            responded_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
      *,
      requester:requested_by(code, name),
      approver:approved_by(code, name)
    `)
        .single();

    if (error) {
        return c.json({ error: error.message, code: "UPDATE_ERROR" }, 500);
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
        action: "APPROVAL_REJECTED",
        entity_type: "approval",
        entity_id: id,
        operator_id: approved_by,
        old_values: { status: "PENDING" },
        new_values: { status: "REJECTED", response_notes },
    });

    return c.json({ data });
});

Deno.serve(app.fetch);
