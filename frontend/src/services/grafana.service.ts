import axios from "axios";
import type { GrafanaDashboardPanels, GrafanaDashboardSummary } from "@/types/grafana";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3050/api/v1";

export const GrafanaService = {
    async listDashboards(): Promise<GrafanaDashboardSummary[]> {
        const response = await axios.get(`${API_BASE_URL}/grafana/dashboards`);
        return response.data?.data ?? [];
    },

    async getDashboardPanels(
        uid: string,
        range?: { from: string; to: string },
    ): Promise<GrafanaDashboardPanels> {
        const params: Record<string, string> = {};
        if (range?.from) params.from = range.from;
        if (range?.to) params.to = range.to;

        const response = await axios.get(`${API_BASE_URL}/grafana/dashboards/${uid}`, {
            params,
        });

        return response.data?.data ?? null;
    },
};
