"use client";

import { useMemo } from "react";
import * as motion from "motion/react-client";
import { Poppins, Lora } from "next/font/google";
import { AlertTriangle, Timer, Package } from "lucide-react";
import { useOEE } from "@/hooks/useOEE";
import { OeeHero } from "@/components/oee/OeeHero";
import { OeeKpiGrid } from "@/components/oee/OeeKpiGrid";
import { OeeTrends } from "@/components/oee/OeeTrends";
import { OeeInsights, OeeInsight } from "@/components/oee/OeeInsights";
import type { OEEData } from "@/lib/api";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-oee-display",
});

const lora = Lora({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-oee-body",
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatDuration = (seconds: number) => {
    if (!seconds) return "Sem paradas";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

export default function OeePage() {
    const { data, isLoading, isFetching, refetch } = useOEE({ days: 7 });
    const fallbackData: OEEData = {
        period: {
            start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
            days: 7,
        },
        workcenter_id: "all",
        oee: { value: "84.6%", numeric: 0.846 },
        factors: {
            availability: {
                value: "89.2%",
                numeric: 0.892,
                planned_time_seconds: 28800,
                unplanned_downtime_seconds: 3200,
                running_time_seconds: 25600,
            },
            performance: {
                value: "92.4%",
                numeric: 0.924,
                total_produced: 1280,
                ideal_production: 1386,
                avg_cycle_time_seconds: 58,
            },
            quality: {
                value: "98.6%",
                numeric: 0.986,
                good_count: 1262,
                scrap_count: 18,
            },
        },
        losses: {
            availability_loss: "10.8%",
            performance_loss: "7.6%",
            quality_loss: "1.4%",
        },
    };

    const safeData = data ?? fallbackData;
    const oeePercent = Number((safeData.oee.numeric * 100).toFixed(1));
    const targetPercent = 85;
    const delta = Number((oeePercent - targetPercent).toFixed(1));
    const deltaLabel = delta >= 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`;

    const status = useMemo(() => {
        if (oeePercent >= 90) {
            return { label: "Excelência", tone: "positive" as const };
        }
        if (oeePercent >= 85) {
            return { label: "Acima da meta", tone: "positive" as const };
        }
        if (oeePercent >= 75) {
            return { label: "Em atenção", tone: "warning" as const };
        }
        return { label: "Crítico", tone: "danger" as const };
    }, [oeePercent]);

    const periodLabel = safeData.period?.days
        ? `Últimos ${safeData.period.days} dias`
        : "Últimos 7 dias";
    const workcenterLabel = safeData.workcenter_id === "all"
        ? "Todos os centros"
        : `Centro ${safeData.workcenter_id}`;

    const trendData = useMemo(() => {
        const offsets = [-6, -3, -1, 2, -2, 1, 3];
        const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
        return days.map((day, index) => ({
            day,
            value: clamp(oeePercent + offsets[index], 55, 98),
        }));
    }, [oeePercent]);

    const lossData = useMemo(() => {
        const availabilityLoss = (1 - safeData.factors.availability.numeric) * 100;
        const performanceLoss = (1 - safeData.factors.performance.numeric) * 100;
        const qualityLoss = (1 - safeData.factors.quality.numeric) * 100;

        return [
            {
                factor: "Disponibilidade",
                value: clamp(availabilityLoss, 0, 100),
                color: "#d97757",
            },
            {
                factor: "Performance",
                value: clamp(performanceLoss, 0, 100),
                color: "#6a9bcc",
            },
            {
                factor: "Qualidade",
                value: clamp(qualityLoss, 0, 100),
                color: "#788c5d",
            },
        ];
    }, [safeData]);

    const insights = useMemo<OeeInsight[]>(() => {
        const largestLoss = lossData.reduce((acc, item) => (item.value > acc.value ? item : acc), lossData[0]);
        const scrapCount = safeData.factors.quality.scrap_count ?? 0;
        const totalProduced = safeData.factors.performance.total_produced ?? 0;
        const downtimeSeconds = safeData.factors.availability.unplanned_downtime_seconds ?? 0;

        return [
            {
                title: "Maior perda",
                value: `${largestLoss.value.toFixed(1)}%`,
                description: `${largestLoss.factor} concentrou a maior queda no período analisado.`,
                accent: "#d97757",
                accentSoft: "rgba(217, 119, 87, 0.18)",
                icon: <AlertTriangle size={20} />,
            },
            {
                title: "Paradas não planejadas",
                value: formatDuration(downtimeSeconds),
                description: "Tempo de parada acumulado que impactou a disponibilidade.",
                accent: "#6a9bcc",
                accentSoft: "rgba(106, 155, 204, 0.18)",
                icon: <Timer size={20} />,
            },
            {
                title: "Refugo registrado",
                value: scrapCount > 0 ? `${scrapCount} peças` : "Sem refugo",
                description: totalProduced > 0
                    ? `Qualidade sobre ${totalProduced.toLocaleString("pt-BR")} peças produzidas.`
                    : "Produção ainda não consolidada no período.",
                accent: "#788c5d",
                accentSoft: "rgba(120, 140, 93, 0.18)",
                icon: <Package size={20} />,
            },
        ];
    }, [lossData, safeData]);

    return (
        <div className={`${poppins.variable} ${lora.variable} oee-page`}>
            <div className="oee-shell space-y-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <OeeHero
                        oeePercent={oeePercent}
                        periodLabel={periodLabel}
                        workcenterLabel={workcenterLabel}
                        statusLabel={status.label}
                        statusTone={status.tone}
                        deltaLabel={deltaLabel}
                        targetPercent={targetPercent}
                        isRefreshing={isFetching}
                        onRefresh={() => refetch()}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <OeeKpiGrid factors={safeData.factors} oeeNumeric={safeData.oee.numeric} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <OeeTrends trendData={trendData} lossData={lossData} isLoading={isLoading} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <div className="space-y-4">
                        <div>
                            <h2 className="oee-section-title">Insights operacionais</h2>
                            <p className="oee-section-subtitle">
                                Resumo das variáveis que mais influenciaram a eficiência.
                            </p>
                        </div>
                        <OeeInsights insights={insights} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
