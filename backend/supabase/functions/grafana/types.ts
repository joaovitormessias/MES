export interface GrafanaSearchResult {
    uid: string;
    title: string;
    url?: string;
    folderTitle?: string;
    type?: string;
}

export interface GrafanaDashboardResponse {
    dashboard: GrafanaDashboard;
}

export interface GrafanaDashboard {
    uid: string;
    title: string;
    panels?: GrafanaPanel[];
}

export interface GrafanaPanel {
    id: number;
    title: string;
    type: string;
    description?: string;
    gridPos?: {
        h?: number;
        w?: number;
        x?: number;
        y?: number;
    };
    datasource?: GrafanaDatasourceRef | string | null;
    targets?: GrafanaTarget[];
    panels?: GrafanaPanel[];
}

export interface GrafanaTarget {
    refId?: string;
    datasource?: GrafanaDatasourceRef | string | null;
    hide?: boolean;
    [key: string]: unknown;
}

export interface GrafanaDatasourceRef {
    uid?: string;
    name?: string;
    type?: string;
}

export interface GrafanaDatasourceSummary {
    uid: string;
    name: string;
    type: string;
}
