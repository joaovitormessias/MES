import { Gauge, Timer, Target, CheckCircle2 } from "lucide-react";
import type { OEEData } from "@/lib/api";

interface OeeKpiGridProps {
    factors: OEEData["factors"];
    oeeNumeric: number;
}

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export function OeeKpiGrid({ factors, oeeNumeric }: OeeKpiGridProps) {
    const lossTotal = Math.max(0, (1 - oeeNumeric) * 100);
    const cards = [
        {
            key: "availability",
            label: "Disponibilidade",
            value: factors.availability.value ?? formatPercent(factors.availability.numeric),
            description: "Tempo operando vs tempo planejado",
            progress: factors.availability.numeric * 100,
            accent: "var(--oee-accent-blue)",
            accentSoft: "rgba(60, 125, 217, 0.18)",
            icon: <Timer size={18} />,
            target: "Meta 90%",
        },
        {
            key: "performance",
            label: "Performance",
            value: factors.performance.value ?? formatPercent(factors.performance.numeric),
            description: "Ritmo real vs ciclo ideal",
            progress: factors.performance.numeric * 100,
            accent: "var(--oee-accent)",
            accentSoft: "rgba(240, 162, 58, 0.18)",
            icon: <Gauge size={18} />,
            target: "Meta 92%",
        },
        {
            key: "quality",
            label: "Qualidade",
            value: factors.quality.value ?? formatPercent(factors.quality.numeric),
            description: "Peças boas sobre total produzido",
            progress: factors.quality.numeric * 100,
            accent: "var(--oee-accent-green)",
            accentSoft: "rgba(15, 157, 136, 0.18)",
            icon: <CheckCircle2 size={18} />,
            target: "Meta 98%",
        },
        {
            key: "loss",
            label: "Perda total",
            value: `${lossTotal.toFixed(1)}%`,
            description: "Impacto combinado das perdas",
            progress: lossTotal,
            accent: "var(--oee-ink)",
            accentSoft: "rgba(24, 34, 44, 0.12)",
            icon: <Target size={18} />,
            target: "Meta < 15%",
        },
    ];

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {cards.map((card) => (
                <div key={card.key} className="oee-card oee-kpi-card">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="oee-kpi-label">{card.label}</p>
                            <p className="oee-kpi-value">{card.value}</p>
                        </div>
                        <div className="oee-kpi-icon" style={{ backgroundColor: card.accentSoft, color: card.accent }}>
                            {card.icon}
                        </div>
                    </div>
                    <p className="oee-kpi-description">{card.description}</p>
                    <div className="oee-progress">
                        <span style={{ width: `${Math.min(card.progress, 100)}%`, backgroundColor: card.accent }} />
                    </div>
                    <p className="oee-kpi-target">{card.target}</p>
                </div>
            ))}
        </section>
    );
}

export default OeeKpiGrid;
