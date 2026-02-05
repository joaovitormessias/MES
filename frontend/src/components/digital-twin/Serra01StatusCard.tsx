"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody, Chip, Progress } from "@heroui/react";
import {
    Thermometer,
    Gauge,
    Activity,
    Zap,
    Wind,
    Package,
    RefreshCw
} from "lucide-react";
import {
    getStatus,
    celsiusToKelvin,
    Serra01FullStatus
} from "@/services/digital-twin.service";

interface Serra01StatusCardProps {
    onDataUpdate?: (data: Serra01FullStatus) => void;
}

export function Serra01StatusCard({ onDataUpdate }: Serra01StatusCardProps) {
    const [data, setData] = useState<Serra01FullStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [isStale, setIsStale] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const status = await getStatus('serra_01');
                setData(status);
                setLastUpdate(new Date());
                setIsStale(false);
                setError(null);
                onDataUpdate?.(status);
            } catch (err) {
                setError('Falha ao conectar com serra_01');
                setIsStale(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // 5s refresh

        return () => clearInterval(interval);
    }, [onDataUpdate]);

    // Mark as stale after 10s without update
    useEffect(() => {
        if (!lastUpdate) return;
        const staleTimer = setTimeout(() => setIsStale(true), 10000);
        return () => clearTimeout(staleTimer);
    }, [lastUpdate]);

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'RUNNING': return 'success';
            case 'IDLE': return 'warning';
            case 'STOPPED': return 'danger';
            default: return 'default';
        }
    };

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'OK': return 'success';
            case 'WARNING': return 'warning';
            case 'CRITICAL': return 'danger';
            default: return 'default';
        }
    };

    const temperatureK = data ? celsiusToKelvin(data.temperature) : 0;
    const tempPercent = data ? Math.min((data.temperature / 100) * 100, 100) : 0;
    const rpmPercent = data ? Math.min((data.sawRpm / 3500) * 100, 100) : 0;

    if (loading) {
        return (
            <Card className="border-2 border-dashed border-gray-300 animate-pulse">
                <CardBody className="h-64 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                </CardBody>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className="border-2 border-red-300 bg-red-50">
                <CardBody className="h-64 flex items-center justify-center text-red-600">
                    <p>{error || 'Sem dados disponíveis'}</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
                <CardBody className="p-0">
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">SERRA_01</h2>
                            <p className="text-gray-400 text-sm mt-1">Digital Twin • Tempo Real</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Chip
                                color={getStatusColor(data.status)}
                                variant="solid"
                                className="font-bold"
                            >
                                {data.status || 'UNKNOWN'}
                            </Chip>
                            {data.health && (
                                <Chip
                                    color={getHealthColor(data.health)}
                                    variant="flat"
                                    size="sm"
                                >
                                    {data.health}
                                </Chip>
                            )}
                        </div>
                    </div>

                    {/* Main Metrics - Temperature & RPM */}
                    <div className="grid grid-cols-2 gap-0 border-t border-gray-700">
                        {/* Temperature Kelvin */}
                        <div className="p-6 border-r border-gray-700">
                            <div className="flex items-center gap-2 mb-3">
                                <Thermometer className="w-5 h-5 text-orange-400" />
                                <span className="text-gray-400 text-sm font-medium">TEMPERATURA</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-orange-400">
                                    {temperatureK.toFixed(1)}
                                </span>
                                <span className="text-xl text-gray-400">K</span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                {data.temperature.toFixed(1)}°C
                            </div>
                            <Progress
                                value={tempPercent}
                                color={tempPercent > 80 ? "danger" : tempPercent > 60 ? "warning" : "success"}
                                className="mt-3"
                                size="sm"
                            />
                        </div>

                        {/* RPM */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Gauge className="w-5 h-5 text-teal-400" />
                                <span className="text-gray-400 text-sm font-medium">SAW RPM</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-teal-400">
                                    {data.sawRpm?.toFixed(0) || 0}
                                </span>
                                <span className="text-xl text-gray-400">rpm</span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Max: 3500 rpm
                            </div>
                            <Progress
                                value={rpmPercent}
                                color="primary"
                                className="mt-3"
                                size="sm"
                            />
                        </div>
                    </div>

                    {/* Secondary Metrics Grid */}
                    <div className="grid grid-cols-4 gap-0 border-t border-gray-700 bg-gray-800/50">
                        <MetricCell
                            icon={<Wind className="w-4 h-4" />}
                            label="Belt Speed"
                            value={data.beltSpeed?.toFixed(1) || '0'}
                            unit="m/s"
                            color="text-sky-400"
                        />
                        <MetricCell
                            icon={<Activity className="w-4 h-4" />}
                            label="Vibração"
                            value={data.vibration?.toFixed(2) || '0'}
                            unit="mm/s"
                            color="text-emerald-400"
                        />
                        <MetricCell
                            icon={<Zap className="w-4 h-4" />}
                            label="Motor"
                            value={data.motorCurrent?.toFixed(1) || '0'}
                            unit="A"
                            color="text-yellow-400"
                        />
                        <MetricCell
                            icon={<Package className="w-4 h-4" />}
                            label="Wood Count"
                            value={data.woodCount?.toString() || '0'}
                            unit="pcs"
                            color="text-amber-400"
                        />
                    </div>

                    {/* Footer - Last Update */}
                    <div className="px-6 py-3 border-t border-gray-700 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className={`w-2 h-2 rounded-full ${isStale ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                            />
                            <span className="text-gray-500">
                                {isStale ? 'Dados podem estar desatualizados' : 'Atualização automática (5s)'}
                            </span>
                        </div>
                        <span className="text-gray-600">
                            {lastUpdate?.toLocaleTimeString('pt-BR')}
                        </span>
                    </div>

                    {/* Health Issues */}
                    {data.issues && data.issues.length > 0 && (
                        <div className="px-6 py-3 bg-red-900/30 border-t border-red-700">
                            {data.issues.map((issue, idx) => (
                                <p key={idx} className="text-red-300 text-sm">⚠️ {issue}</p>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>
        </motion.div>
    );
}

function MetricCell({
    icon,
    label,
    value,
    unit,
    color
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    unit: string;
    color: string;
}) {
    return (
        <div className="p-4 border-r border-gray-700 last:border-r-0">
            <div className={`flex items-center gap-1 mb-1 ${color}`}>
                {icon}
                <span className="text-[10px] uppercase tracking-wide text-gray-500">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold ${color}`}>{value}</span>
                <span className="text-xs text-gray-500">{unit}</span>
            </div>
        </div>
    );
}

export default Serra01StatusCard;
