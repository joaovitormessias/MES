"use client";

import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    trend?: {
        value: number;
        label?: string;
        direction: "up" | "down";
    };
    variant?: "primary" | "success" | "warning" | "danger";
    className?: string;
}

export function KPICard({
    label,
    value,
    icon,
    trend,
    variant = "primary",
    className = "",
}: KPICardProps) {
    const variantClasses = {
        primary: "kpi-icon primary",
        success: "kpi-icon success",
        warning: "kpi-icon warning",
        danger: "kpi-icon danger",
    };

    return (
        <div className={`kpi-card ${className}`}>
            {icon && (
                <div className={variantClasses[variant]}>
                    {icon}
                </div>
            )}
            <div className="kpi-content">
                <p className="kpi-label">{label}</p>
                <p className="kpi-value">{value}</p>
                {trend && (
                    <div className={`kpi-trend ${trend.direction}`}>
                        {trend.direction === "up" ? (
                            <TrendingUp size={14} />
                        ) : (
                            <TrendingDown size={14} />
                        )}
                        <span>{trend.value.toLocaleString('pt-BR')}%</span>
                        {trend.label && (
                            <span className="text-gray-400 ml-1">{trend.label}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default KPICard;
