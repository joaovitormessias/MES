export interface GrafanaDashboardSummary {
    uid: string;
    title: string;
    url?: string;
    folderTitle?: string;
    type?: string;
}

export interface GrafanaDataFrameField {
    name: string;
    type?: string;
}

export interface GrafanaDataFrame {
    name?: string;
    schema?: {
        fields?: GrafanaDataFrameField[];
    };
    fields?: GrafanaDataFrameField[];
    data?: {
        values?: unknown[][];
    };
    values?: unknown[][];
}

export interface GrafanaQueryResult {
    frames?: GrafanaDataFrame[];
}

export interface GrafanaQueryResponse {
    results?: Record<string, GrafanaQueryResult>;
}

export interface GrafanaPanelData {
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
    data: GrafanaQueryResponse | null;
    error?: string | null;
}

export interface GrafanaDashboardPanels {
    uid: string;
    title: string;
    timeRange?: {
        from: string;
        to: string;
    };
    panels: GrafanaPanelData[];
}
