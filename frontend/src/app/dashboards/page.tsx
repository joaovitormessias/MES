"use client";
"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Button, Card, CardBody, CardHeader, Chip, Skeleton } from "@heroui/react";
import * as motion from "motion/react-client";
import {
    Activity,
    ArrowUpRight,
    DollarSign,
    Eye,
    RefreshCw,
    TrendingUp,
} from "lucide-react";
import { GrafanaSection } from "@/components/dashboard/GrafanaSection";
import { KPICard } from "@/components/dashboard/KPICard";
import { WorkcenterStatusTable } from "@/components/dashboard/WorkcenterStatusTable";
import { useDashboardMetrics, useWorkcenterStatus } from "@/hooks/useDashboardMetrics";
import { WorkcenterType } from "@/types/database";

const Column = dynamic(() => import("@ant-design/plots").then((mod) => mod.Column), { ssr: false });
const Area = dynamic(() => import("@ant-design/plots").then((mod) => mod.Area), { ssr: false });
const Pie = dynamic(() => import("@ant-design/plots").then((mod) => mod.Pie), { ssr: false });

export default function DashboardPage() {
    const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useDashboardMetrics();
    const { data: workcenters, isLoading: loadingWorkcenters } = useWorkcenterStatus();

    const isLoading = loadingMetrics || loadingWorkcenters;

    const fallbackMetrics = {
        totalPiecesToday: 1240,
        totalValueToday: 18940.45,
        avgOee: 86.4,
        oeeTrend: [
            { day: "Dom", value: 72 },
            { day: "Seg", value: 78 },
            { day: "Ter", value: 85 },
            { day: "Qua", value: 82 },
            { day: "Qui", value: 79 },
            { day: "Sex", value: 88 },
            { day: "Sab", value: 75 },
        ],
        productionByRegion: [
            { month: "Out", value: 2988.2, region: "CNC" },
            { month: "Out", value: 1200, region: "Montagem" },
            { month: "Out", value: 800, region: "Pintura" },
            { month: "Nov", value: 1765.09, region: "CNC" },
            { month: "Nov", value: 1400, region: "Montagem" },
            { month: "Nov", value: 600, region: "Pintura" },
            { month: "Dez", value: 4005.65, region: "CNC" },
            { month: "Dez", value: 2000, region: "Montagem" },
            { month: "Dez", value: 1200, region: "Pintura" },
        ],
        processDistribution: [
            { type: "CNC", value: 374.82 },
            { type: "Montagem", value: 241.6 },
            { type: "Pintura", value: 213.42 },
        ],
    };

    const fallbackWorkcenters = [
        {
            id: "wc-1",
            name: "CNC 01",
            code: "CNC-01",
            type: WorkcenterType.CNC,
            capacity: 120,
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: "wc-2",
            name: "Montagem 01",
            code: "MONT-01",
            type: WorkcenterType.ASSEMBLY,
            capacity: 80,
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: "wc-3",
            name: "Pintura 01",
            code: "PINT-01",
            type: WorkcenterType.PAINTING,
            capacity: 60,
            isEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    const safeMetrics = metrics ?? fallbackMetrics;
    const safeWorkcenters = workcenters && workcenters.length > 0 ? workcenters : fallbackWorkcenters;

    return (
        <div className="space-y-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="page-header"
            >
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title">Painel de Controle</h1>
                        <p className="page-subtitle">Monitoramento em tempo real e indicadores de producao</p>
                    </div>
                    <div className="page-actions">
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={() => refetchMetrics()}
                            isLoading={isLoading}
                            aria-label="Atualizar indicadores"
                        >
                            <RefreshCw size={20} />
                        </Button>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {isLoading ? (
                    <>
                        <Skeleton className="rounded-xl h-[120px]" />
                        <Skeleton className="rounded-xl h-[120px]" />
                        <Skeleton className="rounded-xl h-[120px]" />
                    </>
                ) : (
                    <>
                        <KPICard
                            label="Pecas Hoje"
                            value={safeMetrics.totalPiecesToday.toLocaleString("pt-BR")}
                            icon={<Eye size={24} />}
                            variant="primary"
                            trend={{ value: 4.2, direction: "up", label: "vs ontem" }}
                        />
                        <KPICard
                            label="Valor Estimado"
                            value={`R$ ${safeMetrics.totalValueToday.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                            icon={<DollarSign size={24} />}
                            variant="success"
                        />
                        <KPICard
                            label="OEE Medio"
                            value={`${safeMetrics.avgOee.toFixed(1)}%`}
                            icon={<Activity size={24} />}
                            variant={safeMetrics.avgOee > 85 ? "success" : "warning"}
                        />
                    </>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                <div className="lg:col-span-2">
                    <Card className="card h-full min-h-[400px]">
                        <CardHeader className="card-header flex justify-between items-start">
                            <div>
                                <h2 className="card-title">Visao Geral da Producao</h2>
                                {!isLoading && (
                                    <>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            R$ {safeMetrics.totalValueToday.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Chip size="sm" color="success" variant="flat" startContent={<TrendingUp size={12} />}>
                                                +12.5%
                                            </Chip>
                                            <span className="text-sm text-gray-500">vs ultimo mes</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardHeader>
                        <CardBody className="h-[300px]">
                            {isLoading ? (
                                <Skeleton className="w-full h-full rounded-lg" />
                            ) : (
                                <Suspense fallback={<div className="h-full w-full animate-pulse bg-gray-100 rounded-lg" />}>
                                    <Column
                                        data={safeMetrics.productionByRegion}
                                        xField="month"
                                        yField="value"
                                        seriesField="region"
                                        isStack={true}
                                        color={["#1f4c6b", "#2f6b8c", "#4e7d97", "#7c9aad", "#b6c6d4"]}
                                        columnStyle={{ radius: [4, 4, 0, 0] }}
                                        label={false}
                                        legend={{ position: "bottom" }}
                                    />
                                </Suspense>
                            )}
                        </CardBody>
                    </Card>
                </div>

                <Card className="card">
                    <CardHeader className="card-header">
                        <div className="flex justify-between items-start w-full">
                            <div>
                                <h2 className="card-title">Tendencia OEE</h2>
                                {!isLoading && (
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {safeMetrics.avgOee.toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="h-[250px]">
                        {isLoading ? (
                            <Skeleton className="w-full h-full rounded-lg" />
                        ) : (
                            <Suspense fallback={<div className="h-full w-full animate-pulse bg-gray-100 rounded-lg" />}>
                                <Area
                                    data={safeMetrics.oeeTrend}
                                    xField="day"
                                    yField="value"
                                    shapeField="smooth"
                                    style={{ fill: "#2f6b8c", fillOpacity: 0.25 }}
                                    axis={{
                                        x: { label: { style: { fill: "#6B7280", fontSize: 11 } } },
                                        y: false,
                                    }}
                                />
                            </Suspense>
                        )}
                    </CardBody>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                <Card className="card">
                    <CardHeader className="card-header flex justify-between items-center">
                        <h2 className="card-title">Distribuicao por Processo</h2>
                    </CardHeader>
                    <CardBody>
                        {isLoading ? (
                            <Skeleton className="w-full h-[200px] rounded-lg" />
                        ) : (
                            <div className="flex items-center gap-8">
                                <div className="space-y-4 flex-1">
                                    {safeMetrics.processDistribution.map((item, idx) => (
                                        <div key={item.type} className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: ["#1f4c6b", "#2f6b8c", "#7c9aad"][idx % 3] }}
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">{item.type}</p>
                                                <p className="text-xl font-bold">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="w-40 h-40">
                                    <Pie
                                        data={safeMetrics.processDistribution}
                                        angleField="value"
                                        colorField="type"
                                        radius={1}
                                        innerRadius={0.6}
                                        color={["#1f4c6b", "#2f6b8c", "#7c9aad"]}
                                        label={false}
                                        legend={false}
                                        statistic={{ title: false, content: false }}
                                    />
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card className="card">
                    <CardHeader className="card-header flex justify-between items-center">
                        <h2 className="card-title">Status dos Centros de Trabalho</h2>
                        <Button size="sm" variant="light" className="text-primary">
                            Ver Todos <ArrowUpRight size={14} />
                        </Button>
                    </CardHeader>
                    <CardBody className="p-0">
                        {isLoading ? (
                            <div className="p-4 space-y-3">
                                <Skeleton className="w-full h-10 rounded-lg" />
                                <Skeleton className="w-full h-10 rounded-lg" />
                                <Skeleton className="w-full h-10 rounded-lg" />
                            </div>
                        ) : (
                            <WorkcenterStatusTable workcenters={safeWorkcenters} />
                        )}
                    </CardBody>
                </Card>
            </motion.div>

            <GrafanaSection />
        </div>
    );
}
