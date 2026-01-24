import type { ReactNode } from "react";

export interface OeeInsight {
    title: string;
    value: string;
    description: string;
    accent: string;
    accentSoft: string;
    icon: ReactNode;
}

interface OeeInsightsProps {
    insights: OeeInsight[];
}

export function OeeInsights({ insights }: OeeInsightsProps) {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {insights.map((insight) => (
                <div key={insight.title} className="oee-card p-5 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <div
                            className="oee-insight-icon"
                            style={{ backgroundColor: insight.accentSoft, color: insight.accent }}
                        >
                            {insight.icon}
                        </div>
                        <div>
                            <p className="oee-insight-title">{insight.title}</p>
                            <p className="oee-insight-value">{insight.value}</p>
                        </div>
                    </div>
                    <p className="oee-insight-description">{insight.description}</p>
                </div>
            ))}
        </section>
    );
}

export default OeeInsights;
