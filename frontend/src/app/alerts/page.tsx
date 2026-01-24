"use client";

import { useState } from "react";
import * as motion from "motion/react-client";
import {
    Card,
    CardBody,
    Button,
    Chip,
    Tabs,
    Tab,
} from "@heroui/react";
import {
    Bell,
    AlertTriangle,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronRight,
} from "lucide-react";

// Alertas mockados
const mockAlerts = [
    {
        id: "1",
        type: "warning",
        title: "OEE Abaixo do Limite",
        message: "CNC-01 OEE caiu para 72% (limite: 75%)",
        ts: "2026-01-22T10:30:00",
        isRead: false,
    },
    {
        id: "2",
        type: "error",
        title: "Parada de Equipamento",
        message: "Cabine de Pintura 1 parou inesperadamente",
        ts: "2026-01-22T09:45:00",
        isRead: false,
    },
    {
        id: "3",
        type: "info",
        title: "Aprovação Pendente",
        message: "Solicitação de hora extra de João Silva aguardando aprovação",
        ts: "2026-01-22T09:00:00",
        isRead: true,
    },
    {
        id: "4",
        type: "success",
        title: "Produção Concluída",
        message: "OP-2026-001 concluída com sucesso com 98% de qualidade",
        ts: "2026-01-22T08:30:00",
        isRead: true,
    },
    {
        id: "5",
        type: "warning",
        title: "Alerta de Qualidade",
        message: "Taxa de refugo acima de 3% na Linha de Montagem 1",
        ts: "2026-01-22T08:00:00",
        isRead: true,
    },
];

const getAlertIcon = (type: string) => {
    switch (type) {
        case "error":
            return <XCircle size={20} className="text-red-500" />;
        case "warning":
            return <AlertTriangle size={20} className="text-amber-500" />;
        case "success":
            return <CheckCircle2 size={20} className="text-green-500" />;
        default:
            return <Bell size={20} className="text-primary" />;
    }
};

const getAlertColor = (type: string): "danger" | "warning" | "success" | "primary" => {
    switch (type) {
        case "error":
            return "danger";
        case "warning":
            return "warning";
        case "success":
            return "success";
        default:
            return "primary";
    }
};

const getAlertTypeName = (type: string): string => {
    switch (type) {
        case "error":
            return "crítico";
        case "warning":
            return "aviso";
        case "success":
            return "sucesso";
        default:
            return "info";
    }
};

export default function AlertasPage() {
    const [selectedTab, setSelectedTab] = useState("all");

    const filteredAlerts = mockAlerts.filter((alert) => {
        if (selectedTab === "all") return true;
        if (selectedTab === "unread") return !alert.isRead;
        return alert.type === selectedTab;
    });

    const unreadCount = mockAlerts.filter((a) => !a.isRead).length;

    return (
        <div className="space-y-6">
            {/* Cabeçalho da Página */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="page-header"
            >
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title">Alertas e Notificações</h1>
                        <p className="page-subtitle">
                            {unreadCount > 0 ? `${unreadCount} notificações não lidas` : "Tudo em dia!"}
                        </p>
                    </div>
                    <div className="page-actions">
                        <Button color="primary" variant="flat">
                            Marcar Todas como Lidas
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Cards de Resumo */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-red-50 rounded-xl">
                            <XCircle size={24} className="text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Críticos</p>
                            <p className="text-2xl font-bold text-red-600">
                                {mockAlerts.filter((a) => a.type === "error").length}
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <AlertTriangle size={24} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Avisos</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {mockAlerts.filter((a) => a.type === "warning").length}
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Bell size={24} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Não Lidas</p>
                            <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <CheckCircle2 size={24} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Resolvidas</p>
                            <p className="text-2xl font-bold text-green-600">
                                {mockAlerts.filter((a) => a.type === "success").length}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Abas */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Tabs
                    aria-label="Filtros de alerta"
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => setSelectedTab(key as string)}
                    color="primary"
                    variant="underlined"
                >
                    <Tab key="all" title="Todos" />
                    <Tab
                        key="unread"
                        title={
                            <div className="flex items-center gap-2">
                                Não Lidas
                                {unreadCount > 0 && (
                                    <Chip size="sm" color="primary" variant="flat">
                                        {unreadCount}
                                    </Chip>
                                )}
                            </div>
                        }
                    />
                    <Tab key="error" title="Críticos" />
                    <Tab key="warning" title="Avisos" />
                </Tabs>
            </motion.div>

            {/* Lista de Alertas */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            >
                <Card className="card">
                    <CardBody className="p-0 divide-y divide-gray-100">
                        {filteredAlerts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Bell size={48} className="mx-auto mb-2 opacity-30" />
                                <p>Nenhum alerta para exibir</p>
                            </div>
                        ) : (
                            filteredAlerts.map((alert, index) => (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!alert.isRead ? "bg-primary/5" : ""
                                        }`}
                                >
                                    <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-gray-900">{alert.title}</p>
                                            {!alert.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">{alert.message}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Clock size={12} className="text-gray-400" />
                                            <span className="text-xs text-gray-400">
                                                {new Date(alert.ts).toLocaleString('pt-BR')}
                                            </span>
                                            <Chip size="sm" color={getAlertColor(alert.type)} variant="flat">
                                                {getAlertTypeName(alert.type)}
                                            </Chip>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-300 mt-2" />
                                </motion.div>
                            ))
                        )}
                    </CardBody>
                </Card>
            </motion.div>
        </div>
    );
}
