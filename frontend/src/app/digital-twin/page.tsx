"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardBody, CardHeader, Button, Chip, Divider, Tabs, Tab } from "@heroui/react";
import {
    Activity,
    Thermometer,
    Gauge,
    Wifi,
    WifiOff,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Factory,
    TrendingUp,
    ServerCrash
} from "lucide-react";
import { GrafanaSection } from "@/components/dashboard/GrafanaSection";
import { Serra01StatusCard } from "@/components/digital-twin/Serra01StatusCard";
import {
    getStatus,
    getHistory,
    getAlerts,
    checkHealth,
    celsiusToKelvin,
    Serra01FullStatus,
    HistoryEntry,
    HealthInfo
} from "@/services/digital-twin.service";

// Animation variants for tab transitions
const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
};

export default function DigitalTwinPage() {
    const [status, setStatus] = useState<Serra01FullStatus | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [alerts, setAlerts] = useState<HealthInfo | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState("visao");
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            // First check if API is reachable
            const health = await checkHealth();
            setIsConnected(health);

            if (!health) {
                setError("API não está acessível. Verifique se o servidor Digital Twin está rodando.");
                return;
            }

            // Fetch all data with individual error handling
            const results = await Promise.allSettled([
                getStatus('serra_01'),
                getHistory('serra_01', 30),
                getAlerts('serra_01')
            ]);

            // Process status
            if (results[0].status === 'fulfilled') {
                setStatus(results[0].value);
            }

            // Process history
            if (results[1].status === 'fulfilled') {
                setHistory(results[1].value);
            }

            // Process alerts
            if (results[2].status === 'fulfilled') {
                setAlerts(results[2].value);
            }

            setLastUpdate(new Date());
            setError(null);
        } catch (err) {
            console.error('Failed to load Digital Twin data:', err);
            setIsConnected(false);
            setError("Falha ao carregar dados. Verifique a conexão com o servidor.");
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [loadData]);

    const refreshData = async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    };

    const temperatureK = status ? celsiusToKelvin(status.temperature) : 0;

    const renderStatsCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="bg-gradient-to-br from-orange-100 to-amber-50 border-0 shadow-lg">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-orange-500 rounded-lg">
                            <Thermometer className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">
                                {temperatureK.toFixed(1)}<span className="text-lg font-normal ml-1">K</span>
                            </p>
                            <p className="text-sm text-gray-600">Temperatura</p>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="bg-gradient-to-br from-teal-100 to-emerald-50 border-0 shadow-lg">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-teal-500 rounded-lg">
                            <Gauge className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">
                                {status?.sawRpm?.toFixed(0) || 0}<span className="text-lg font-normal ml-1">rpm</span>
                            </p>
                            <p className="text-sm text-gray-600">Saw RPM</p>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="bg-gradient-to-br from-sky-100 to-blue-50 border-0 shadow-lg">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-sky-500 rounded-lg">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">
                                {status?.vibration?.toFixed(2) || 0}<span className="text-lg font-normal ml-1">mm/s</span>
                            </p>
                            <p className="text-sm text-gray-600">Vibração</p>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className={`border-0 shadow-lg ${status?.status === 'RUNNING'
                        ? 'bg-gradient-to-br from-emerald-100 to-green-50'
                        : 'bg-gradient-to-br from-red-100 to-orange-50'
                    }`}>
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className={`p-3 rounded-lg ${status?.status === 'RUNNING' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}>
                            {status?.status === 'RUNNING' ? (
                                <Wifi className="w-6 h-6 text-white" />
                            ) : (
                                <WifiOff className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">
                                {status?.status || 'OFFLINE'}
                            </p>
                            <p className="text-sm text-gray-600">Status</p>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>
        </div>
    );

    const renderHealthAlerts = () => (
        <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-gray-800">Health Status</span>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-3">
                {alerts?.health === 'OK' ? (
                    <div className="text-center py-6 text-gray-500">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
                        <p className="font-medium">Sistema operando normalmente</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <Chip
                                color={alerts?.health === 'CRITICAL' ? 'danger' : 'warning'}
                                variant="flat"
                            >
                                {alerts?.health || 'UNKNOWN'}
                            </Chip>
                        </div>
                        {alerts?.issues?.map((issue, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`p-3 rounded-lg border-l-4 ${alerts.health === 'CRITICAL'
                                        ? 'bg-red-50 border-l-red-500'
                                        : 'bg-amber-50 border-l-amber-500'
                                    }`}
                            >
                                <p className="text-sm text-gray-700">{issue}</p>
                            </motion.div>
                        ))}
                    </>
                )}
            </CardBody>
        </Card>
    );

    const renderHistoryTrend = () => (
        <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-500" />
                    <span className="font-bold text-gray-800">Histórico Recente</span>
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                {history.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Sem dados de histórico</p>
                ) : (
                    <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 pb-2 border-b">
                            <span>Hora</span>
                            <span>Temp (K)</span>
                            <span>RPM</span>
                            <span>Status</span>
                        </div>
                        {history.slice(0, 10).map((entry, idx) => (
                            <div key={idx} className="grid grid-cols-4 gap-2 text-sm py-1">
                                <span className="text-gray-600">
                                    {new Date(entry.ts * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="font-mono text-orange-600">
                                    {celsiusToKelvin(entry.temperature).toFixed(1)}
                                </span>
                                <span className="font-mono text-teal-600">
                                    {entry.sawRpm?.toFixed(0) || '-'}
                                </span>
                                <Chip size="sm" color={entry.status === 'RUNNING' ? 'success' : 'default'} variant="flat">
                                    {entry.status}
                                </Chip>
                            </div>
                        ))}
                    </div>
                )}
            </CardBody>
        </Card>
    );

    const renderErrorState = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
        >
            <div className="p-6 bg-red-100 rounded-full mb-6">
                <ServerCrash className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Conexão Falhou</h2>
            <p className="text-gray-500 mb-6 text-center max-w-md">{error}</p>
            <div className="space-y-2 text-sm text-gray-600 bg-gray-100 p-4 rounded-lg mb-6">
                <p>Para iniciar o servidor Digital Twin:</p>
                <code className="block bg-gray-800 text-green-400 p-2 rounded font-mono text-xs">
                    cd digital-twin && uvicorn backend.api.main:app --reload
                </code>
            </div>
            <Button
                color="primary"
                onClick={refreshData}
                isLoading={isRefreshing}
                startContent={<RefreshCw className="w-4 h-4" />}
            >
                Tentar Novamente
            </Button>
        </motion.div>
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Factory className="w-8 h-8 text-teal-600" />
                        Digital Twin
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Monitoramento em tempo real • <span className="font-mono">serra_01</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ scale: isConnected ? [1, 1.1, 1] : 1 }}
                        transition={{ repeat: isConnected ? Infinity : 0, duration: 2 }}
                        className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}
                    />
                    <Chip
                        color={isConnected ? "success" : "danger"}
                        variant="flat"
                    >
                        {isConnected ? "API Conectada" : "Desconectado"}
                    </Chip>
                    <Button
                        variant="bordered"
                        startContent={<RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />}
                        onClick={refreshData}
                        isDisabled={isRefreshing}
                    >
                        Atualizar
                    </Button>
                </div>
            </motion.div>

            <Tabs
                aria-label="Seções do Digital Twin"
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key as string)}
                color="primary"
                variant="underlined"
                classNames={{
                    tabList: "gap-6",
                    tab: "px-0 h-12 transition-all duration-200",
                    cursor: "bg-teal-500"
                }}
            >
                <Tab key="visao" title="Visão Geral" />
                <Tab key="dispositivos" title="Dispositivos IoT" />
                <Tab key="alertas" title="Alertas IoT" />
                <Tab key="grafana" title="Grafana" />
            </Tabs>

            {/* Error State */}
            {error && !isConnected && renderErrorState()}

            {/* Tab Content with Smooth Transitions */}
            {(!error || isConnected) && (
                <AnimatePresence mode="wait">
                    {selectedTab === "visao" && (
                        <motion.div
                            key="visao"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-6"
                        >
                            {renderStatsCards()}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <Serra01StatusCard onDataUpdate={setStatus} />
                                </div>
                                <div className="space-y-6">
                                    {renderHealthAlerts()}
                                    {renderHistoryTrend()}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {selectedTab === "dispositivos" && (
                        <motion.div
                            key="dispositivos"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-center py-12"
                        >
                            <p className="text-gray-500">Veja a página dedicada de dispositivos IoT</p>
                            <Button
                                as="a"
                                href="/digital-twin/devices"
                                color="primary"
                                className="mt-4"
                            >
                                Ir para Dispositivos
                            </Button>
                        </motion.div>
                    )}

                    {selectedTab === "alertas" && (
                        <motion.div
                            key="alertas"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-center py-12"
                        >
                            <p className="text-gray-500">Veja a página dedicada de alertas IoT</p>
                            <Button
                                as="a"
                                href="/digital-twin/alerts"
                                color="primary"
                                className="mt-4"
                            >
                                Ir para Alertas
                            </Button>
                        </motion.div>
                    )}

                    {selectedTab === "grafana" && (
                        <motion.div
                            key="grafana"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <GrafanaSection />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Last Update Footer */}
            {lastUpdate && isConnected && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-xs text-gray-400"
                >
                    Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                </motion.div>
            )}
        </div>
    );
}
