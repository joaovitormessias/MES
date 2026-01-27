"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader, Button, Chip, Progress, Divider } from "@heroui/react";
import {
    Activity,
    Cpu,
    Thermometer,
    Gauge,
    Wifi,
    WifiOff,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Zap,
    Factory
} from "lucide-react";

interface Device {
    id: string;
    name: string;
    type: string;
    isOnline: boolean;
    lastSeenAt: string;
    metrics: {
        temperature?: number;
        speed?: number;
        pressure?: number;
        vibration?: number;
    };
}

interface Alert {
    id: string;
    deviceName: string;
    type: string;
    severity: "info" | "warning" | "critical";
    message: string;
    timestamp: string;
}

// Mock data for demonstration
const mockDevices: Device[] = [
    {
        id: "1",
        name: "Serra Principal",
        type: "SIMULATOR",
        isOnline: true,
        lastSeenAt: new Date().toISOString(),
        metrics: { temperature: 82, speed: 1200, pressure: 4.5, vibration: 0.8 },
    },
    {
        id: "2",
        name: "CNC-01",
        type: "PLC",
        isOnline: true,
        lastSeenAt: new Date().toISOString(),
        metrics: { temperature: 45, speed: 3500, pressure: 6.2, vibration: 0.3 },
    },
    {
        id: "3",
        name: "Prensa Hidráulica",
        type: "SENSOR",
        isOnline: false,
        lastSeenAt: new Date(Date.now() - 3600000).toISOString(),
        metrics: { temperature: 0, speed: 0, pressure: 0, vibration: 0 },
    },
    {
        id: "4",
        name: "Calibrador",
        type: "GATEWAY",
        isOnline: true,
        lastSeenAt: new Date().toISOString(),
        metrics: { temperature: 38, speed: 800, pressure: 3.1, vibration: 0.5 },
    },
];

const mockAlerts: Alert[] = [
    {
        id: "1",
        deviceName: "Serra Principal",
        type: "TEMPERATURE_HIGH",
        severity: "warning",
        message: "Temperatura acima do normal: 82°C",
        timestamp: new Date().toISOString(),
    },
    {
        id: "2",
        deviceName: "Prensa Hidráulica",
        type: "DEVICE_OFFLINE",
        severity: "critical",
        message: "Dispositivo offline há 1 hora",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
];

export default function DigitalTwinPage() {
    const [devices, setDevices] = useState<Device[]>(mockDevices);
    const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected">("connected");

    const refreshData = async () => {
        setIsRefreshing(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsRefreshing(false);
    };

    const onlineCount = devices.filter((d) => d.isOnline).length;
    const offlineCount = devices.filter((d) => !d.isOnline).length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Factory className="w-7 h-7 text-lime-600" />
                        Digital Twin
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Visualização em tempo real dos dispositivos IoT
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Chip
                        color={connectionStatus === "connected" ? "success" : "danger"}
                        variant="dot"
                        className="gap-1"
                    >
                        ThingsBoard {connectionStatus === "connected" ? "Conectado" : "Desconectado"}
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-gradient-to-br from-lime-50 to-emerald-50 border-lime-200">
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-lime-500 rounded-xl">
                                <Wifi className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{onlineCount}</p>
                                <p className="text-sm text-gray-600">Dispositivos Online</p>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-red-500 rounded-xl">
                                <WifiOff className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{offlineCount}</p>
                                <p className="text-sm text-gray-600">Dispositivos Offline</p>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-amber-500 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                                <p className="text-sm text-gray-600">Alertas Ativos</p>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-blue-500 rounded-xl">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
                                <p className="text-sm text-gray-600">Total Dispositivos</p>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Devices Grid */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Dispositivos IoT</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {devices.map((device, index) => (
                            <motion.div
                                key={device.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className={`transition-all hover:shadow-lg ${device.isOnline
                                            ? "border-l-4 border-l-lime-500"
                                            : "border-l-4 border-l-red-500 opacity-75"
                                        }`}
                                >
                                    <CardHeader className="flex justify-between items-start pb-2">
                                        <div className="flex items-center gap-2">
                                            <Cpu className={`w-5 h-5 ${device.isOnline ? "text-lime-600" : "text-red-500"}`} />
                                            <span className="font-semibold text-gray-800">{device.name}</span>
                                        </div>
                                        <Chip
                                            size="sm"
                                            color={device.isOnline ? "success" : "danger"}
                                            variant="flat"
                                        >
                                            {device.isOnline ? "Online" : "Offline"}
                                        </Chip>
                                    </CardHeader>
                                    <Divider />
                                    <CardBody className="pt-3 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2">
                                                <Thermometer className="w-4 h-4 text-orange-500" />
                                                <span className="text-sm text-gray-600">
                                                    {device.metrics.temperature || 0}°C
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Gauge className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm text-gray-600">
                                                    {device.metrics.speed || 0} RPM
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-purple-500" />
                                                <span className="text-sm text-gray-600">
                                                    {device.metrics.pressure || 0} bar
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-emerald-500" />
                                                <span className="text-sm text-gray-600">
                                                    {device.metrics.vibration || 0} mm/s
                                                </span>
                                            </div>
                                        </div>
                                        {device.isOnline && device.metrics.temperature && (
                                            <div>
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>Temperatura</span>
                                                    <span>{device.metrics.temperature}°C / 100°C</span>
                                                </div>
                                                <Progress
                                                    value={device.metrics.temperature}
                                                    maxValue={100}
                                                    color={device.metrics.temperature > 80 ? "warning" : "success"}
                                                    size="sm"
                                                />
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Alerts Panel */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Alertas Recentes</h2>
                    <Card className="border-amber-200">
                        <CardBody className="space-y-3">
                            {alerts.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                                    <p>Nenhum alerta ativo</p>
                                </div>
                            ) : (
                                alerts.map((alert, index) => (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-3 rounded-lg border-l-4 ${alert.severity === "critical"
                                                ? "bg-red-50 border-l-red-500"
                                                : alert.severity === "warning"
                                                    ? "bg-amber-50 border-l-amber-500"
                                                    : "bg-blue-50 border-l-blue-500"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">
                                                    {alert.deviceName}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {alert.message}
                                                </p>
                                            </div>
                                            <Chip
                                                size="sm"
                                                color={
                                                    alert.severity === "critical"
                                                        ? "danger"
                                                        : alert.severity === "warning"
                                                            ? "warning"
                                                            : "primary"
                                                }
                                                variant="flat"
                                            >
                                                {alert.severity}
                                            </Chip>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </CardBody>
                    </Card>

                    {/* Connection Info */}
                    <Card>
                        <CardHeader>
                            <span className="font-semibold text-gray-800">Conexão ThingsBoard</span>
                        </CardHeader>
                        <Divider />
                        <CardBody className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">URL</span>
                                <span className="font-mono text-gray-800">localhost:8080</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Device</span>
                                <span className="font-mono text-gray-800">serra_01</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Poll Interval</span>
                                <span className="font-mono text-gray-800">1.0s</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <Chip size="sm" color="success" variant="dot">
                                    Conectado
                                </Chip>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
