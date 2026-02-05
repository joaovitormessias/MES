"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, Thermometer, Gauge, Activity } from "lucide-react";
import { Card, CardBody, Chip, Button } from "@heroui/react";
import { getDevices, connectThingsBoard, IoTDevice } from "@/services/iot.service";
import { PageTransition } from "@/components/ui/PageTransition";

export default function IoTDevicesPage() {
    const [devices, setDevices] = useState<IoTDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');

    useEffect(() => {
        loadDevices();
    }, [filter]);

    const loadDevices = async () => {
        try {
            setLoading(true);
            const filters = filter === 'all' ? {} : { isOnline: filter === 'online' };
            const data = await getDevices(filters);
            setDevices(data.devices);
        } catch (error) {
            console.error('Failed to load devices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            await connectThingsBoard();
            await loadDevices();
        } catch (error) {
            console.error('Failed to sync with ThingsBoard:', error);
        } finally {
            setSyncing(false);
        }
    };

    const onlineCount = devices.filter(d => d.isOnline).length;
    const offlineCount = devices.length - onlineCount;

    return (
        <PageTransition>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dispositivos IoT</h1>
                        <p className="text-sm text-gray-500 mt-1">Monitore e gerencie dispositivos conectados</p>
                    </div>
                    <Button
                        startContent={<RefreshCw size={16} />}
                        onClick={handleSync}
                        isLoading={syncing}
                        color="primary"
                        variant="flat"
                    >
                        Sincronizar ThingsBoard
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-lime-400 to-emerald-500">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Total de Dispositivos</p>
                                    <p className="text-4xl font-bold text-gray-900 mt-2">{devices.length}</p>
                                </div>
                                <Wifi size={40} className="text-gray-800 opacity-60" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-400 to-teal-500">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Online</p>
                                    <p className="text-4xl font-bold text-gray-900 mt-2">{onlineCount}</p>
                                </div>
                                <Activity size={40} className="text-gray-800 opacity-60" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-400 to-gray-500">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white">Offline</p>
                                    <p className="text-4xl font-bold text-white mt-2">{offlineCount}</p>
                                </div>
                                <WifiOff size={40} className="text-white opacity-60" />
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={filter === 'all' ? 'solid' : 'bordered'}
                        color={filter === 'all' ? 'primary' : 'default'}
                        onClick={() => setFilter('all')}
                    >
                        Todos
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'online' ? 'solid' : 'bordered'}
                        color={filter === 'online' ? 'success' : 'default'}
                        onClick={() => setFilter('online')}
                    >
                        Online
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'offline' ? 'solid' : 'bordered'}
                        color={filter === 'offline' ? 'default' : 'default'}
                        onClick={() => setFilter('offline')}
                    >
                        Offline
                    </Button>
                </div>

                {/* Devices Grid */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Carregando dispositivos...</div>
                ) : devices.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">Nenhum dispositivo encontrado</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {devices.map((device) => (
                            <Card key={device.id} className="border border-gray-200">
                                <CardBody className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{device.name}</h3>
                                            <p className="text-sm text-gray-500">{device.deviceCode}</p>
                                        </div>
                                        <Chip
                                            color={device.isOnline ? "success" : "default"}
                                            variant="flat"
                                            size="sm"
                                            startContent={device.isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                                        >
                                            {device.isOnline ? "Online" : "Offline"}
                                        </Chip>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Chip size="sm" variant="flat">{device.deviceType}</Chip>
                                            {device.workcenter && (
                                                <span className="text-gray-600">{device.workcenter.name}</span>
                                            )}
                                        </div>

                                        {device.metadata && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {(device.metadata as { temperature?: number }).temperature && (
                                                        <div className="flex items-center gap-1 text-gray-600">
                                                            <Thermometer size={14} />
                                                            <span>{(device.metadata as { temperature: number }).temperature}°C</span>
                                                        </div>
                                                    )}
                                                    {(device.metadata as { rpm?: number }).rpm && (
                                                        <div className="flex items-center gap-1 text-gray-600">
                                                            <Gauge size={14} />
                                                            <span>{(device.metadata as { rpm: number }).rpm} RPM</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {device._count && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
                                                <span>{device._count.telemetry} telemetria</span>
                                                <span>{device._count.alerts} alertas</span>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
