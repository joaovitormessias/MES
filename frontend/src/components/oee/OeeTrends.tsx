import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@heroui/react";

const Area = dynamic(() => import("@ant-design/plots").then((mod) => mod.Area), { ssr: false });
const Column = dynamic(() => import("@ant-design/plots").then((mod) => mod.Column), { ssr: false });

interface OeeTrendsProps {
    trendData: Array<{ day: string; value: number }>;
    lossData: Array<{ factor: string; value: number; color: string }>;
    isLoading?: boolean;
}

export function OeeTrends({ trendData, lossData, isLoading }: OeeTrendsProps) {
    return (
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="oee-card xl:col-span-7 p-6">
                <div className="space-y-2">
                    <h2 className="oee-section-title">Tendência semanal</h2>
                    <p className="oee-section-subtitle">
                        Evolução do OEE nos últimos dias com foco no comportamento geral.
                    </p>
                </div>
                <div className="mt-6 h-[240px]">
                    {isLoading ? (
                        <Skeleton className="w-full h-full rounded-2xl" />
                    ) : (
                        <Suspense fallback={<div className="h-full w-full rounded-2xl animate-pulse bg-[var(--oee-border)]" />}>
                            <Area
                                data={trendData}
                                xField="day"
                                yField="value"
                                shapeField="smooth"
                                style={{ fill: "rgba(60, 125, 217, 0.22)", lineWidth: 2, stroke: "#3c7dd9" }}
                                axis={{
                                    x: { label: { style: { fill: "#4b5b6b", fontSize: 11 } } },
                                    y: { label: { style: { fill: "#4b5b6b", fontSize: 11 } } },
                                }}
                                tooltip={{ formatter: (datum) => ({ name: "OEE", value: `${datum.value.toFixed(1)}%` }) }}
                                padding="auto"
                            />
                        </Suspense>
                    )}
                </div>
            </div>

            <div className="oee-card xl:col-span-5 p-6">
                <div className="space-y-2">
                    <h2 className="oee-section-title">Perdas por fator</h2>
                    <p className="oee-section-subtitle">
                        Distribuição das perdas que mais impactaram o resultado.
                    </p>
                </div>
                <div className="mt-6 h-[240px]">
                    {isLoading ? (
                        <Skeleton className="w-full h-full rounded-2xl" />
                    ) : (
                        <Suspense fallback={<div className="h-full w-full rounded-2xl animate-pulse bg-[var(--oee-border)]" />}>
                            <Column
                                data={lossData}
                                xField="factor"
                                yField="value"
                                columnStyle={{ radius: [12, 12, 0, 0] }}
                                color={(datum) => datum.color}
                                axis={{
                                    x: { label: { style: { fill: "#4b5b6b", fontSize: 11 } } },
                                    y: { label: { style: { fill: "#4b5b6b", fontSize: 11 } } },
                                }}
                                tooltip={{ formatter: (datum) => ({ name: "Perda", value: `${datum.value.toFixed(1)}%` }) }}
                                padding="auto"
                            />
                        </Suspense>
                    )}
                </div>
            </div>
        </section>
    );
}

export default OeeTrends;
