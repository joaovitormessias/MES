import { callEdgeFunction } from "@/lib/supabase";
import type { GrafanaDashboardPanels, GrafanaDashboardSummary } from "@/types/grafana";

export const GrafanaService = {
    async listDashboards(): Promise<GrafanaDashboardSummary[]> {
        const { data, error } = await callEdgeFunction<{ data: GrafanaDashboardSummary[] }>(
            "grafana/dashboards",
        );

        if (error) throw error;
        return data?.data ?? [];
    },

    async getDashboardPanels(
        uid: string,
        range?: { from: string; to: string },
    ): Promise<GrafanaDashboardPanels> {
        const params: Record<string, string> = {};
        if (range?.from) params.from = range.from;
        if (range?.to) params.to = range.to;

        const { data, error } = await callEdgeFunction<GrafanaDashboardPanels>(
            `grafana/dashboards/${uid}`,
            { params },
        );

        if (error) throw error;
        return data!;
    },
};
