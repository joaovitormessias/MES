"use client";

import dynamic from "next/dynamic";
import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import {
    extractCategorySeries,
    extractLatestValue,
    extractSeriesTotals,
    extractTable,
    extractTimeSeries,
} from "@/lib/grafana";
import type { GrafanaPanelData } from "@/types/grafana";

const Line = dynamic(() => import("@ant-design/plots").then((mod) => mod.Line), { ssr: false });
const Column = dynamic(() => import("@ant-design/plots").then((mod) => mod.Column), { ssr: false });
const Pie = dynamic(() => import("@ant-design/plots").then((mod) => mod.Pie), { ssr: false });

const SUPPORTED_PANEL_TYPES = new Set([
    "timeseries",
    "graph",
    "stat",
    "gauge",
    "bargauge",
    "piechart",
    "barchart",
    "table",
]);

export function GrafanaPanelCard({ panel }: { panel: GrafanaPanelData }) {
    const isUnsupported = !SUPPORTED_PANEL_TYPES.has(panel.type);

    const timeSeries = extractTimeSeries(panel.data);
    const seriesTotals = extractSeriesTotals(panel.data);
    const categorySeries = extractCategorySeries(panel.data);
    const latestValue = extractLatestValue(panel.data);
    const tableData = extractTable(panel.data);

    let content: JSX.Element;

    if (panel.error) {
        content = <div className="text-sm text-red-600">{panel.error}</div>;
    } else if (isUnsupported) {
        content = (
            <div className="text-sm text-gray-500">
                Tipo de painel nao suportado ({panel.type}).
            </div>
        );
    } else if (panel.type === "stat" || panel.type === "gauge" || panel.type === "bargauge") {
        content = (
            <div className="flex flex-col items-start gap-1">
                <div className="text-3xl font-semibold text-gray-900">
                    {latestValue ?? "--"}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-400">Atual</div>
            </div>
        );
    } else if (panel.type === "piechart") {
        content = seriesTotals.length ? (
            <Pie
                data={seriesTotals}
                angleField="value"
                colorField="name"
                radius={0.9}
                innerRadius={0.45}
                legend={{ position: "bottom" }}
                height={220}
            />
        ) : (
            <div className="text-sm text-gray-500">Sem dados</div>
        );
    } else if (panel.type === "barchart") {
        const data = categorySeries.length ? categorySeries : seriesTotals;
        content = data.length ? (
            <Column data={data} xField="name" yField="value" height={220} />
        ) : (
            <div className="text-sm text-gray-500">Sem dados</div>
        );
    } else if (panel.type === "table") {
        content = tableData ? (
            <div className="overflow-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500">
                            {tableData.columns.map((column) => (
                                <th key={column} className="pb-2 pr-4 font-medium">
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {tableData.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-t border-gray-100">
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="py-2 pr-4">
                                        {cell === null ? "-" : String(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-sm text-gray-500">Sem dados</div>
        );
    } else {
        content = timeSeries.length ? (
            <Line
                data={timeSeries}
                xField="time"
                yField="value"
                seriesField="series"
                smooth
                legend={{ position: "bottom" }}
                xAxis={{ label: { style: { fill: "#6B7280", fontSize: 11 } } }}
                yAxis={{ label: { style: { fill: "#6B7280", fontSize: 11 } } }}
                height={220}
            />
        ) : (
            <div className="text-sm text-gray-500">Sem dados</div>
        );
    }

    return (
        <Card className="card h-full min-h-[280px]">
            <CardHeader className="card-header flex flex-col items-start gap-1">
                <div className="flex w-full items-start justify-between gap-3">
                    <div>
                        <h3 className="card-title text-base">{panel.title}</h3>
                        {panel.description && (
                            <p className="text-xs text-gray-500">{panel.description}</p>
                        )}
                    </div>
                    <Chip size="sm" variant="flat" className="text-xs">
                        {panel.type}
                    </Chip>
                </div>
            </CardHeader>
            <CardBody>{content}</CardBody>
        </Card>
    );
}
