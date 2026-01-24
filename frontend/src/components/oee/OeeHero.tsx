import type { CSSProperties } from "react";
import { Button } from "@heroui/react";
import { Download, RefreshCw } from "lucide-react";

type OeeStatusTone = "positive" | "warning" | "danger";

interface OeeHeroProps {
    oeePercent: number;
    periodLabel: string;
    workcenterLabel: string;
    statusLabel: string;
    deltaLabel: string;
    statusTone: OeeStatusTone;
    targetPercent: number;
    isRefreshing?: boolean;
    onRefresh?: () => void;
}

export function OeeHero({
    oeePercent,
    periodLabel,
    workcenterLabel,
    statusLabel,
    deltaLabel,
    statusTone,
    targetPercent,
    isRefreshing,
    onRefresh,
}: OeeHeroProps) {
    const gaugeStyle = { "--oee-value": `${oeePercent}%` } as CSSProperties;

    return (
        <section className="oee-card oee-hero">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 space-y-5">
                    <div className="space-y-3">
                        <span className="oee-eyebrow">Eficiência global</span>
                        <h1 className="oee-title">Análise de OEE</h1>
                        <p className="oee-subtitle">
                            Acompanhe disponibilidade, performance e qualidade com foco nas principais perdas do período.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="oee-chip">{periodLabel}</span>
                        <span className="oee-chip">{workcenterLabel}</span>
                        <span className={`oee-status ${statusTone}`}>
                            {statusLabel} · {deltaLabel}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            className="oee-primary-button"
                            startContent={<Download size={18} />}
                        >
                            Exportar relatório
                        </Button>
                        <Button
                            variant="bordered"
                            className="oee-secondary-button"
                            startContent={<RefreshCw size={16} />}
                            isLoading={isRefreshing}
                            onPress={onRefresh}
                        >
                            Atualizar
                        </Button>
                    </div>
                </div>

                <div className="oee-gauge" style={gaugeStyle}>
                    <div className="oee-gauge-core">
                        <span className="oee-gauge-label">OEE Atual</span>
                        <span className="oee-gauge-value">{oeePercent}%</span>
                        <span className="oee-gauge-meta">Meta {targetPercent}% · {deltaLabel} vs meta</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OeeHero;
