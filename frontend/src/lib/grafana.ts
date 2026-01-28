import type { GrafanaDataFrame, GrafanaQueryResponse } from "@/types/grafana";

export interface GrafanaSeriesPoint {
    time: string | number;
    value: number;
    series: string;
}

export interface GrafanaCategoryPoint {
    name: string;
    value: number;
}

const NUMBER_FIELD_TYPES = new Set(["number", "float", "double", "int", "long"]);

function extractFrames(result?: GrafanaQueryResponse | null): GrafanaDataFrame[] {
    if (!result?.results) return [];

    return Object.values(result.results).flatMap((entry) => entry.frames ?? []);
}

function normalizeFrameFields(frame: GrafanaDataFrame) {
    return frame.schema?.fields ?? frame.fields ?? [];
}

function normalizeFrameValues(frame: GrafanaDataFrame) {
    return frame.data?.values ?? frame.values ?? [];
}

export function extractTimeSeries(result?: GrafanaQueryResponse | null): GrafanaSeriesPoint[] {
    const frames = extractFrames(result);
    const points: GrafanaSeriesPoint[] = [];

    frames.forEach((frame, frameIndex) => {
        const fields = normalizeFrameFields(frame);
        const values = normalizeFrameValues(frame);
        if (!fields.length || !values.length) return;

        const timeIndex = fields.findIndex((field) =>
            field.type === "time" || field.name?.toLowerCase().includes("time"),
        );
        if (timeIndex === -1) return;

        const timeValues = values[timeIndex] ?? [];

        fields.forEach((field, fieldIndex) => {
            if (fieldIndex === timeIndex) return;
            if (field.type && !NUMBER_FIELD_TYPES.has(field.type)) return;

            const seriesName = field.name ?? frame.name ?? `Series ${frameIndex + 1}`;
            const seriesValues = values[fieldIndex] ?? [];
            const length = Math.min(timeValues.length, seriesValues.length);

            for (let i = 0; i < length; i += 1) {
                const rawValue = seriesValues[i];
                if (rawValue === null || rawValue === undefined) continue;
                const rawTime = timeValues[i];
                const time = typeof rawTime === "number"
                    ? new Date(rawTime).toISOString()
                    : String(rawTime);
                const numericValue = Number(rawValue);
                if (!Number.isFinite(numericValue)) continue;

                points.push({
                    time,
                    value: numericValue,
                    series: seriesName,
                });
            }
        });
    });

    return points;
}

export function extractCategorySeries(result?: GrafanaQueryResponse | null): GrafanaCategoryPoint[] {
    const frames = extractFrames(result);

    for (const frame of frames) {
        const fields = normalizeFrameFields(frame);
        const values = normalizeFrameValues(frame);
        if (!fields.length || !values.length) continue;

        const labelIndex = fields.findIndex((field) => field.type === "string");
        const valueIndex = fields.findIndex((field) => field.type && NUMBER_FIELD_TYPES.has(field.type));

        if (labelIndex === -1 || valueIndex === -1 || labelIndex === valueIndex) continue;

        const labels = values[labelIndex] ?? [];
        const metricValues = values[valueIndex] ?? [];
        const length = Math.min(labels.length, metricValues.length);

        return Array.from({ length }, (_, index) => {
            const numericValue = Number(metricValues[index] ?? 0);
            return {
                name: String(labels[index]),
                value: Number.isFinite(numericValue) ? numericValue : 0,
            };
        });
    }

    return [];
}

export function extractSeriesTotals(result?: GrafanaQueryResponse | null): GrafanaCategoryPoint[] {
    const series = extractTimeSeries(result);
    if (series.length === 0) {
        return extractCategorySeries(result);
    }

    const totals = new Map<string, number>();
    series.forEach((point) => {
        totals.set(point.series, (totals.get(point.series) ?? 0) + point.value);
    });

    return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
}

export function extractLatestValue(result?: GrafanaQueryResponse | null): number | null {
    const series = extractTimeSeries(result);
    if (series.length === 0) {
        const categories = extractCategorySeries(result);
        return categories.length ? categories[0].value : null;
    }

    const sorted = [...series].sort((a, b) => Number(new Date(a.time)) - Number(new Date(b.time)));
    return sorted.length ? sorted[sorted.length - 1].value : null;
}

export function extractTable(result?: GrafanaQueryResponse | null, maxRows = 10) {
    const frames = extractFrames(result);
    if (!frames.length) return null;

    const frame = frames[0];
    const fields = normalizeFrameFields(frame);
    const values = normalizeFrameValues(frame);

    if (!fields.length || !values.length) return null;

    const rowCount = Math.min(maxRows, values[0]?.length ?? 0);
    const columns = fields.map((field) => field.name);
    const rows = Array.from({ length: rowCount }, (_, rowIndex) =>
        values.map((columnValues) => columnValues?.[rowIndex] ?? null),
    );

    return { columns, rows };
}
