"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, RefreshCw, Clock } from "lucide-react";
import { Card, CardBody, Chip, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { getAlerts, acknowledgeAlert, IoTAlert } from "@/services/iot.service";
import { PageTransition } from "@/components/ui/PageTransition";

export default function IoTAlertsPage() {
    const [alerts, setAlerts] = useState<IoTAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>('active');
    const [acknowledging, setAcknowledging] = useState<string | null>(null);

    useEffect(() => {
        loadAlerts();
        const interval = setInterval(loadAlerts, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [filter]);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const filters = filter === 'all' ? {} : { acknowledged: filter === 'acknowledged' };
            const data = await getAlerts(filters);
            setAlerts(data.alerts);
        } catch (error) {
            console.error('Failed to load alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (alertId: string) => {
        try {
            setAcknowledging(alertId);
            await acknowledgeAlert(alertId, 'Operador via UI');
            await loadAlerts();
        } catch (error) {
            console.error('Failed to acknowledge alert:', error);
        } finally {
            setAcknowledging(null);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'danger';
            case 'WARNING': return 'warning';
            default: return 'default';
        }
    };

    const activeCount = alerts.filter(a => !a.acknowledged).length;
    const criticalCount = alerts.filter(a => !a.acknowledged && a.severity === 'CRITICAL').length;

    return (
        <PageTransition>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Alertas IoT</h1>
                        <p className="text-sm text-gray-500 mt-1">Gerencie alertas e notificações de dispositivos</p>
                    </div>
                    <Button
                        startContent={<RefreshCw size={16} />}
                        onClick={loadAlerts}
                        isLoading={loading}
                        variant="flat"
                        color="primary"
                    >
                        Atualizar
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-red-400 to-rose-500">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white">Alertas Críticos</p>
                                    <p className="text-4xl font-bold text-white mt-2">{criticalCount}</p>
                                </div>
                                <AlertTriangle size={40} className="text-white opacity-60" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-400 to-orange-500">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Alertas Ativos</p>
                                    <p className="text-4xl font-bold text-gray-900 mt-2">{activeCount}</p>
                                </div>
                                <Clock size={40} className="text-gray-800 opacity-60" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-400 to-teal-500">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Total</p>
                                    <p className="text-4xl font-bold text-gray-900 mt-2">{alerts.length}</p>
                                </div>
                                <CheckCircle size={40} className="text-gray-800 opacity-60" />
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={filter === 'active' ? 'solid' : 'bordered'}
                        color={filter === 'active' ? 'primary' : 'default'}
                        onClick={() => setFilter('active')}
                    >
                        Ativos
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'acknowledged' ? 'solid' : 'bordered'}
                        color={filter === 'acknowledged' ? 'default' : 'default'}
                        onClick={() => setFilter('acknowledged')}
                    >
                        Reconhecidos
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'all' ? 'solid' : 'bordered'}
                        color={filter === 'all' ? 'default' : 'default'}
                        onClick={() => setFilter('all')}
                    >
                        Todos
                    </Button>
                </div>

                {/* Alerts Table */}
                <Card>
                    <CardBody className="p-0">
                        <Table
                            aria-label="IoT Alerts Table"
                            className="min-h-[400px]"
                            removeWrapper
                        >
                            <TableHeader>
                                <TableColumn>DISPOSITIVO</TableColumn>
                                <TableColumn>SEVERIDADE</TableColumn>
                                <TableColumn>MENSAGEM</TableColumn>
                                <TableColumn>DATA/HORA</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>AÇÕES</TableColumn>
                            </TableHeader>
                            <TableBody
                                isLoading={loading}
                                emptyContent="Nenhum alerta encontrado"
                            >
                                {alerts.map((alert) => (
                                    <TableRow key={alert.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {alert.device?.name || 'Desconhecido'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {alert.device?.deviceCode || '-'}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                color={getSeverityColor(alert.severity)}
                                                variant="flat"
                                                size="sm"
                                            >
                                                {alert.severity}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-md">
                                                <p className="text-sm text-gray-700 line-clamp-2">
                                                    {alert.message}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-gray-600">
                                                {new Date(alert.createdAt).toLocaleString('pt-BR')}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            {alert.acknowledged ? (
                                                <div>
                                                    <Chip color="success" variant="flat" size="sm">
                                                        Reconhecido
                                                    </Chip>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        por {alert.acknowledgedBy}
                                                    </p>
                                                </div>
                                            ) : (
                                                <Chip color="warning" variant="flat" size="sm">
                                                    Ativo
                                                </Chip>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {!alert.acknowledged && (
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    variant="flat"
                                                    onClick={() => handleAcknowledge(alert.id)}
                                                    isLoading={acknowledging === alert.id}
                                                >
                                                    Reconhecer
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>
        </PageTransition>
    );
}
