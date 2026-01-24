import { Hono } from "jsr:@hono/hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "../types/database.types.ts";

const app = new Hono().basePath("/kpis");

function getSupabaseClient() {
    return createClient<Database>(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
}

// GET /kpis/oee - OEE with Availability/Performance/Quality breakdown
app.get("/oee", async (c) => {
    const supabase = getSupabaseClient();
    const { workcenter_id, date, days = "1" } = c.req.query();

    const endDate = date ? new Date(date) : new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - parseInt(days) + 1);
    startDate.setHours(0, 0, 0, 0);

    const startTs = startDate.toISOString();
    const endTs = new Date(endDate.setHours(23, 59, 59, 999)).toISOString();

    // Get shift calendar for planned time
    let shiftQuery = supabase
        .from("shift_calendars")
        .select("*, workcenters(code, name)")
        .eq("is_active", true);

    if (workcenter_id) {
        shiftQuery = shiftQuery.eq("workcenter_id", workcenter_id);
    }

    const { data: shifts } = await shiftQuery;

    // Calculate planned time (in seconds)
    let plannedSeconds = 0;
    const daysInRange = parseInt(days);
    shifts?.forEach(shift => {
        const start = shift.start_time.split(":").map(Number);
        const end = shift.end_time.split(":").map(Number);
        const shiftMinutes = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
        // Count how many times this day of week appears in the range
        plannedSeconds += shiftMinutes * 60 * daysInRange;
    });

    // Get downtime for availability
    let downtimeQuery = supabase
        .from("downtime_events")
        .select("duration_seconds, downtime_type")
        .gte("start_ts", startTs)
        .lte("start_ts", endTs);

    if (workcenter_id) {
        downtimeQuery = downtimeQuery.eq("workcenter_id", workcenter_id);
    }

    const { data: downtimes } = await downtimeQuery;

    const plannedDowntime = downtimes?.filter(d => d.downtime_type === "PLANNED")
        .reduce((sum, d) => sum + (d.duration_seconds ?? 0), 0) ?? 0;
    const unplannedDowntime = downtimes?.filter(d => d.downtime_type !== "PLANNED")
        .reduce((sum, d) => sum + (d.duration_seconds ?? 0), 0) ?? 0;

    const runningTime = plannedSeconds - plannedDowntime - unplannedDowntime;
    const availability = plannedSeconds > 0 ? runningTime / (plannedSeconds - plannedDowntime) : 0;

    // Get production counts for performance
    let countQuery = supabase
        .from("piece_counts")
        .select("count_qty, pieces_per_cycle, ts")
        .gte("ts", startTs)
        .lte("ts", endTs);

    if (workcenter_id) {
        countQuery = countQuery.eq("workcenter_id", workcenter_id);
    }

    const { data: counts } = await countQuery;

    const totalProduced = counts?.reduce((sum, c) => sum + c.count_qty, 0) ?? 0;

    // Get standard cycle time (average across process steps)
    const { data: steps } = await supabase
        .from("process_steps")
        .select("standard_cycle_time_seconds")
        .not("standard_cycle_time_seconds", "is", null);

    const avgCycleTime = steps?.length
        ? steps.reduce((sum, s) => sum + (s.standard_cycle_time_seconds ?? 0), 0) / steps.length
        : 60; // Default 60s

    const idealProduction = runningTime > 0 ? runningTime / avgCycleTime : 0;
    const performance = idealProduction > 0 ? totalProduced / idealProduction : 0;

    // Get quality for quality factor
    let qualityQuery = supabase
        .from("quality_records")
        .select("qty, disposition")
        .gte("ts", startTs)
        .lte("ts", endTs);

    const { data: qualityRecords } = await qualityQuery;

    const scrap = qualityRecords?.filter(r => r.disposition === "SCRAP_NO_REUSE")
        .reduce((sum, r) => sum + r.qty, 0) ?? 0;

    const qualityFactor = totalProduced > 0 ? (totalProduced - scrap) / totalProduced : 1;

    // Calculate OEE
    const oee = availability * performance * qualityFactor;

    return c.json({
        period: { start: startTs, end: endTs, days: parseInt(days) },
        workcenter_id: workcenter_id ?? "all",
        oee: {
            value: (oee * 100).toFixed(1) + "%",
            numeric: oee,
        },
        factors: {
            availability: {
                value: (availability * 100).toFixed(1) + "%",
                numeric: availability,
                planned_time_seconds: plannedSeconds,
                planned_downtime_seconds: plannedDowntime,
                unplanned_downtime_seconds: unplannedDowntime,
                running_time_seconds: runningTime,
            },
            performance: {
                value: (performance * 100).toFixed(1) + "%",
                numeric: performance,
                total_produced: totalProduced,
                ideal_production: Math.round(idealProduction),
                avg_cycle_time_seconds: avgCycleTime,
            },
            quality: {
                value: (qualityFactor * 100).toFixed(1) + "%",
                numeric: qualityFactor,
                good_count: totalProduced - scrap,
                scrap_count: scrap,
            },
        },
        losses: {
            availability_loss: ((1 - availability) * 100).toFixed(1) + "%",
            performance_loss: ((1 - performance) * 100).toFixed(1) + "%",
            quality_loss: ((1 - qualityFactor) * 100).toFixed(1) + "%",
        },
    });
});

// GET /kpis/mttr - Mean Time To Repair
app.get("/mttr", async (c) => {
    const supabase = getSupabaseClient();
    const { workcenter_id, days = "30" } = c.req.query();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let query = supabase
        .from("maintenance_events")
        .select(`
      start_ts,
      end_ts,
      is_failure,
      workcenters(code, name)
    `)
        .gte("start_ts", startDate.toISOString())
        .eq("is_failure", true)
        .not("end_ts", "is", null);

    if (workcenter_id) {
        query = query.eq("workcenter_id", workcenter_id);
    }

    const { data, error } = await query;

    if (error) {
        return c.json({ error: error.message, code: "QUERY_ERROR" }, 500);
    }

    // Calculate repair times
    const repairTimes = data?.map(m => {
        const start = new Date(m.start_ts).getTime();
        const end = new Date(m.end_ts!).getTime();
        return (end - start) / 1000; // seconds
    }) ?? [];

    const totalRepairTime = repairTimes.reduce((sum, t) => sum + t, 0);
    const mttr = repairTimes.length > 0 ? totalRepairTime / repairTimes.length : 0;

    // By workcenter
    const byWorkcenter = data?.reduce((acc, m) => {
        const wc = m.workcenters?.code ?? "UNKNOWN";
        if (!acc[wc]) acc[wc] = { count: 0, total_time: 0 };
        const repairTime = (new Date(m.end_ts!).getTime() - new Date(m.start_ts).getTime()) / 1000;
        acc[wc].count++;
        acc[wc].total_time += repairTime;
        return acc;
    }, {} as Record<string, { count: number; total_time: number }>);

    return c.json({
        period_days: parseInt(days),
        mttr: {
            seconds: Math.round(mttr),
            minutes: (mttr / 60).toFixed(1),
            hours: (mttr / 3600).toFixed(2),
        },
        total_repairs: repairTimes.length,
        total_repair_time_hours: (totalRepairTime / 3600).toFixed(1),
        by_workcenter: Object.entries(byWorkcenter ?? {}).map(([code, data]) => ({
            workcenter: code,
            repairs: data.count,
            mttr_minutes: (data.total_time / data.count / 60).toFixed(1),
        })),
    });
});

// GET /kpis/mtbf - Mean Time Between Failures
app.get("/mtbf", async (c) => {
    const supabase = getSupabaseClient();
    const { workcenter_id, days = "30" } = c.req.query();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const endDate = new Date();

    let query = supabase
        .from("maintenance_events")
        .select(`
      start_ts,
      workcenter_id,
      workcenters(code, name)
    `)
        .gte("start_ts", startDate.toISOString())
        .eq("is_failure", true)
        .order("start_ts", { ascending: true });

    if (workcenter_id) {
        query = query.eq("workcenter_id", workcenter_id);
    }

    const { data, error } = await query;

    if (error) {
        return c.json({ error: error.message, code: "QUERY_ERROR" }, 500);
    }

    const periodHours = parseInt(days) * 24;
    const failureCount = data?.length ?? 0;

    // MTBF = Operating Time / Number of Failures
    const mtbfHours = failureCount > 0 ? periodHours / failureCount : periodHours;

    // By workcenter
    const failuresByWc = data?.reduce((acc, m) => {
        const wc = m.workcenters?.code ?? "UNKNOWN";
        acc[wc] = (acc[wc] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return c.json({
        period_days: parseInt(days),
        mtbf: {
            hours: mtbfHours.toFixed(1),
            days: (mtbfHours / 24).toFixed(1),
        },
        total_failures: failureCount,
        operating_hours: periodHours,
        by_workcenter: Object.entries(failuresByWc ?? {}).map(([code, failures]) => ({
            workcenter: code,
            failures,
            mtbf_hours: (periodHours / failures).toFixed(1),
        })),
    });
});

Deno.serve(app.fetch);
