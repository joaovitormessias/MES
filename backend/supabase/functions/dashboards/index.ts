import { Hono } from "jsr:@hono/hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "../types/database.types.ts";

const app = new Hono().basePath("/dashboards");

function getSupabaseClient() {
    return createClient<Database>(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
}

// GET /dashboards/shift - Shift plan vs actual
app.get("/shift", async (c) => {
    const supabase = getSupabaseClient();
    const { workcenter_id, date } = c.req.query();

    const targetDate = date ?? new Date().toISOString().split("T")[0];
    const startOfDay = `${targetDate}T00:00:00Z`;
    const endOfDay = `${targetDate}T23:59:59Z`;

    // Get OPs scheduled for today
    let opQuery = supabase
        .from("production_orders")
        .select("id, erp_order_code, item_code, planned_qty, executed_good_qty, status")
        .gte("due_date", startOfDay)
        .lte("due_date", endOfDay);

    const { data: ops } = await opQuery;

    // Get piece counts for today
    let countQuery = supabase
        .from("piece_counts")
        .select("count_qty, process_step_id, workcenter_id, ts")
        .gte("ts", startOfDay)
        .lte("ts", endOfDay);

    if (workcenter_id) {
        countQuery = countQuery.eq("workcenter_id", workcenter_id);
    }

    const { data: counts } = await countQuery;

    // Calculate totals
    const totalPlanned = ops?.reduce((sum, op) => sum + op.planned_qty, 0) ?? 0;
    const totalExecuted = ops?.reduce((sum, op) => sum + (op.executed_good_qty ?? 0), 0) ?? 0;
    const todayCounts = counts?.reduce((sum, c) => sum + c.count_qty, 0) ?? 0;

    // Group counts by hour
    const byHour = counts?.reduce((acc, c) => {
        const hour = new Date(c.ts).getHours();
        acc[hour] = (acc[hour] ?? 0) + c.count_qty;
        return acc;
    }, {} as Record<number, number>) ?? {};

    return c.json({
        date: targetDate,
        summary: {
            total_planned: totalPlanned,
            total_executed: totalExecuted,
            today_counts: todayCounts,
            completion_rate: totalPlanned > 0 ? (totalExecuted / totalPlanned * 100).toFixed(1) + "%" : "N/A",
        },
        orders: ops?.map(op => ({
            ...op,
            completion: op.planned_qty > 0
                ? ((op.executed_good_qty ?? 0) / op.planned_qty * 100).toFixed(1) + "%"
                : "N/A"
        })),
        hourly_production: byHour,
    });
});

// GET /dashboards/micro-stops - Micro-stop analysis
app.get("/micro-stops", async (c) => {
    const supabase = getSupabaseClient();
    const { workcenter_id, days = "7" } = c.req.query();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let query = supabase
        .from("downtime_events")
        .select(`
      *,
      workcenters(code, name)
    `)
        .eq("downtime_type", "MICRO_STOP")
        .gte("start_ts", startDate.toISOString())
        .order("start_ts", { ascending: false });

    if (workcenter_id) {
        query = query.eq("workcenter_id", workcenter_id);
    }

    const { data, error } = await query;

    if (error) {
        return c.json({ error: error.message, code: "QUERY_ERROR" }, 500);
    }

    // Calculate statistics
    const totalEvents = data?.length ?? 0;
    const totalDuration = data?.reduce((sum, d) => sum + (d.duration_seconds ?? 0), 0) ?? 0;
    const avgDuration = totalEvents > 0 ? totalDuration / totalEvents : 0;

    // Group by reason
    const byReason = data?.reduce((acc, d) => {
        const reason = d.reason_code ?? "UNKNOWN";
        if (!acc[reason]) acc[reason] = { count: 0, duration: 0 };
        acc[reason].count++;
        acc[reason].duration += d.duration_seconds ?? 0;
        return acc;
    }, {} as Record<string, { count: number; duration: number }>);

    // Group by workcenter
    const byWorkcenter = data?.reduce((acc, d) => {
        const wc = d.workcenters?.code ?? "UNKNOWN";
        if (!acc[wc]) acc[wc] = { count: 0, duration: 0 };
        acc[wc].count++;
        acc[wc].duration += d.duration_seconds ?? 0;
        return acc;
    }, {} as Record<string, { count: number; duration: number }>);

    return c.json({
        period_days: parseInt(days),
        summary: {
            total_events: totalEvents,
            total_duration_seconds: totalDuration,
            total_duration_minutes: Math.round(totalDuration / 60),
            avg_duration_seconds: Math.round(avgDuration),
        },
        by_reason: byReason,
        by_workcenter: byWorkcenter,
        recent_events: data?.slice(0, 20),
    });
});

// GET /dashboards/quality - Quality summary
app.get("/quality", async (c) => {
    const supabase = getSupabaseClient();
    const { days = "7" } = c.req.query();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const { data, error } = await supabase
        .from("quality_records")
        .select(`
      disposition,
      qty,
      reason_code,
      ts,
      process_steps(code, name)
    `)
        .gte("ts", startDate.toISOString());

    if (error) {
        return c.json({ error: error.message, code: "QUERY_ERROR" }, 500);
    }

    const totalScrap = data?.filter(r => r.disposition === "SCRAP_NO_REUSE")
        .reduce((sum, r) => sum + r.qty, 0) ?? 0;
    const totalReuse = data?.filter(r => r.disposition === "REUSE")
        .reduce((sum, r) => sum + r.qty, 0) ?? 0;

    // By step
    const byStep = data?.reduce((acc, r) => {
        const step = r.process_steps?.code ?? "UNKNOWN";
        if (!acc[step]) acc[step] = { scrap: 0, reuse: 0 };
        if (r.disposition === "SCRAP_NO_REUSE") acc[step].scrap += r.qty;
        else acc[step].reuse += r.qty;
        return acc;
    }, {} as Record<string, { scrap: number; reuse: number }>);

    // Top reasons
    const byReason = data?.reduce((acc, r) => {
        const reason = r.reason_code ?? "UNKNOWN";
        acc[reason] = (acc[reason] ?? 0) + r.qty;
        return acc;
    }, {} as Record<string, number>);

    const topReasons = Object.entries(byReason ?? {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    return c.json({
        period_days: parseInt(days),
        summary: {
            total_scrap: totalScrap,
            total_reuse: totalReuse,
            scrap_rate: totalScrap + totalReuse > 0
                ? (totalScrap / (totalScrap + totalReuse) * 100).toFixed(1) + "%"
                : "N/A",
        },
        by_step: byStep,
        top_reasons: topReasons,
    });
});

// GET /dashboards/utilization - Resource utilization
app.get("/utilization", async (c) => {
    const supabase = getSupabaseClient();
    const { date } = c.req.query();

    const targetDate = date ?? new Date().toISOString().split("T")[0];
    const startOfDay = `${targetDate}T00:00:00Z`;
    const endOfDay = `${targetDate}T23:59:59Z`;
    const dayOfWeek = new Date(targetDate).getDay();

    // Get workcenters with shift calendars
    const { data: workcenters } = await supabase
        .from("workcenters")
        .select(`
      id,
      code,
      name,
      is_enabled,
      shift_calendars!inner(shift_name, start_time, end_time)
    `)
        .eq("shift_calendars.day_of_week", dayOfWeek)
        .eq("shift_calendars.is_active", true);

    // Get execution events per workcenter for today
    const { data: events } = await supabase
        .from("execution_events")
        .select("workcenter_id, ts, event_type")
        .gte("ts", startOfDay)
        .lte("ts", endOfDay)
        .in("event_type", ["START", "STOP", "COMPLETE"]);

    // Get downtime per workcenter
    const { data: downtimes } = await supabase
        .from("downtime_events")
        .select("workcenter_id, duration_seconds")
        .gte("start_ts", startOfDay)
        .lte("start_ts", endOfDay);

    // Calculate utilization per workcenter
    const utilization = workcenters?.map(wc => {
        const wcEvents = events?.filter(e => e.workcenter_id === wc.id) ?? [];
        const wcDowntime = downtimes?.filter(d => d.workcenter_id === wc.id)
            .reduce((sum, d) => sum + (d.duration_seconds ?? 0), 0) ?? 0;

        // Calculate available time from shift
        const shifts = wc.shift_calendars as any[];
        let availableMinutes = 0;
        shifts?.forEach(s => {
            const start = s.start_time.split(":").map(Number);
            const end = s.end_time.split(":").map(Number);
            availableMinutes += (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
        });

        const availableSeconds = availableMinutes * 60;
        const downtimeRate = availableSeconds > 0
            ? (wcDowntime / availableSeconds * 100).toFixed(1)
            : "N/A";

        return {
            workcenter_id: wc.id,
            code: wc.code,
            name: wc.name,
            is_enabled: wc.is_enabled,
            available_minutes: availableMinutes,
            downtime_seconds: wcDowntime,
            downtime_rate: downtimeRate + "%",
            utilization_rate: availableSeconds > 0
                ? (100 - parseFloat(downtimeRate as string)).toFixed(1) + "%"
                : "N/A",
            event_count: wcEvents.length,
        };
    });

    return c.json({
        date: targetDate,
        workcenters: utilization,
    });
});

Deno.serve(app.fetch);
