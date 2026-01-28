import { Hono } from "jsr:@hono/hono";
import {
    GrafanaDashboardResponse,
    GrafanaDatasourceRef,
    GrafanaDatasourceSummary,
    GrafanaPanel,
    GrafanaSearchResult,
    GrafanaTarget,
} from "./types.ts";

const app = new Hono().basePath("/grafana");

const DEFAULT_FROM = "now-24h";
const DEFAULT_TO = "now";

function getGrafanaConfig() {
    const grafanaUrl = Deno.env.get("GRAFANA_URL")?.replace(/\/$/, "");
    const grafanaApiKey = Deno.env.get("GRAFANA_API_KEY");

    if (!grafanaUrl || !grafanaApiKey) {
        return null;
    }

    return { grafanaUrl, grafanaApiKey };
}

async function grafanaFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const config = getGrafanaConfig();
    if (!config) {
        throw new Error("Grafana environment variables not configured");
    }

    const response = await fetch(`${config.grafanaUrl}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.grafanaApiKey}`,
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Grafana request failed (${response.status}): ${errorText}`);
    }

    return response.json();
}

function flattenPanels(panels: GrafanaPanel[] = []): GrafanaPanel[] {
    const flattened: GrafanaPanel[] = [];

    panels.forEach((panel) => {
        if (panel.type === "row") {
            if (panel.panels?.length) {
                flattened.push(...flattenPanels(panel.panels));
            }
            return;
        }

        flattened.push(panel);
    });

    return flattened;
}

function buildDatasourceMaps(datasources: GrafanaDatasourceSummary[]) {
    const byUid = new Map<string, GrafanaDatasourceSummary>();
    const byName = new Map<string, GrafanaDatasourceSummary>();

    datasources.forEach((datasource) => {
        byUid.set(datasource.uid, datasource);
        byName.set(datasource.name, datasource);
    });

    return { byUid, byName };
}

function resolveDatasource(
    reference: GrafanaDatasourceRef | string | null | undefined,
    maps: { byUid: Map<string, GrafanaDatasourceSummary>; byName: Map<string, GrafanaDatasourceSummary> },
    fallback?: GrafanaDatasourceSummary | null,
): GrafanaDatasourceSummary | null {
    if (!reference) return fallback ?? null;

    if (typeof reference === "string") {
        return maps.byUid.get(reference) ?? maps.byName.get(reference) ?? fallback ?? null;
    }

    if (reference.uid) {
        return (
            maps.byUid.get(reference.uid) ??
            (reference.type
                ? { uid: reference.uid, name: reference.name ?? reference.uid, type: reference.type }
                : fallback ?? null)
        );
    }

    if (reference.name) {
        return maps.byName.get(reference.name) ?? fallback ?? null;
    }

    return fallback ?? null;
}

function buildQueries(panel: GrafanaPanel, datasources: ReturnType<typeof buildDatasourceMaps>) {
    const panelDatasource = resolveDatasource(panel.datasource, datasources);
    const targets = panel.targets ?? [];

    return targets
        .filter((target) => !target.hide)
        .map((target, index) => {
            const datasource = resolveDatasource(target.datasource ?? panel.datasource, datasources, panelDatasource);

            if (!datasource) {
                return null;
            }

            const refId = target.refId ?? String.fromCharCode(65 + index);
            const intervalMs = 1000;
            const maxDataPoints = 200;

            return {
                ...target,
                refId,
                datasource: { uid: datasource.uid, type: datasource.type },
                intervalMs,
                maxDataPoints,
            } as GrafanaTarget & {
                datasource: { uid: string; type: string };
                refId: string;
                intervalMs: number;
                maxDataPoints: number;
            };
        })
        .filter((target): target is GrafanaTarget & { datasource: { uid: string; type: string } } => Boolean(target));
}

app.get("/dashboards", async (c) => {
    try {
        const dashboards = await grafanaFetch<GrafanaSearchResult[]>("/api/search?type=dash-db");
        return c.json({ data: dashboards, count: dashboards.length });
    } catch (error) {
        return c.json({ error: (error as Error).message, code: "GRAFANA_ERROR" }, 500);
    }
});

app.get("/dashboards/:uid", async (c) => {
    const { uid } = c.req.param();
    const { from = DEFAULT_FROM, to = DEFAULT_TO } = c.req.query();

    try {
        const dashboardResponse = await grafanaFetch<GrafanaDashboardResponse>(
            `/api/dashboards/uid/${uid}`,
        );
        const dashboard = dashboardResponse.dashboard;

        const datasources = await grafanaFetch<GrafanaDatasourceSummary[]>("/api/datasources");
        const datasourceMaps = buildDatasourceMaps(datasources);

        const rawPanels = flattenPanels(dashboard.panels ?? []);

        const panels = await Promise.all(
            rawPanels.map(async (panel) => {
                const queries = buildQueries(panel, datasourceMaps);

                if (!queries.length) {
                    return {
                        id: panel.id,
                        title: panel.title,
                        type: panel.type,
                        description: panel.description,
                        gridPos: panel.gridPos,
                        data: null,
                        error: "Panel has no data queries",
                    };
                }

                try {
                    const data = await grafanaFetch<Record<string, unknown>>("/api/ds/query", {
                        method: "POST",
                        body: JSON.stringify({
                            queries,
                            from,
                            to,
                        }),
                    });

                    return {
                        id: panel.id,
                        title: panel.title,
                        type: panel.type,
                        description: panel.description,
                        gridPos: panel.gridPos,
                        data,
                        error: null,
                    };
                } catch (error) {
                    return {
                        id: panel.id,
                        title: panel.title,
                        type: panel.type,
                        description: panel.description,
                        gridPos: panel.gridPos,
                        data: null,
                        error: (error as Error).message,
                    };
                }
            }),
        );

        return c.json({
            uid: dashboard.uid,
            title: dashboard.title,
            timeRange: { from, to },
            panels,
        });
    } catch (error) {
        return c.json({ error: (error as Error).message, code: "GRAFANA_ERROR" }, 500);
    }
});

Deno.serve(app.fetch);
