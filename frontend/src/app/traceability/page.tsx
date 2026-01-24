"use client";

import { useState } from "react";
import * as motion from "motion/react-client";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Chip,
    Tabs,
    Tab,
} from "@heroui/react";
import {
    Search,
    GitBranch,
    Clock,
    Package,
    ArrowRight,
    User,
    CheckCircle2,
    Scan,
    Play,
    AlertTriangle,
} from "lucide-react";

// Dados mockados de timeline
const mockTimeline = [
    {
        id: "1",
        type: "event",
        eventType: "SCAN",
        ts: "2026-01-22T06:00:00",
        step: "Otimizadora",
        workcenter: "OPT-01",
        operator: "João Silva",
    },
    {
        id: "2",
        type: "event",
        eventType: "START",
        ts: "2026-01-22T06:05:00",
        step: "Otimizadora",
        workcenter: "OPT-01",
        operator: "João Silva",
    },
    {
        id: "3",
        type: "event",
        eventType: "COMPLETE",
        ts: "2026-01-22T08:30:00",
        step: "Otimizadora",
        workcenter: "OPT-01",
        operator: "João Silva",
        details: { good_qty: 100 },
    },
    {
        id: "4",
        type: "event",
        eventType: "START",
        ts: "2026-01-22T09:00:00",
        step: "CNC",
        workcenter: "CNC-01",
        operator: "Maria Santos",
    },
    {
        id: "5",
        type: "quality",
        disposition: "SCRAP_NO_REUSE",
        ts: "2026-01-22T09:45:00",
        step: "CNC",
        qty: 3,
        reason: "ARRANHADO",
    },
    {
        id: "6",
        type: "event",
        eventType: "COMPLETE",
        ts: "2026-01-22T11:00:00",
        step: "CNC",
        workcenter: "CNC-01",
        operator: "Maria Santos",
        details: { good_qty: 97 },
    },
];

const getEventIcon = (eventType: string) => {
    switch (eventType) {
        case "SCAN":
            return <Scan size={16} className="text-blue-500" />;
        case "START":
            return <Play size={16} className="text-green-500" />;
        case "COMPLETE":
            return <CheckCircle2 size={16} className="text-emerald-600" />;
        default:
            return <Clock size={16} className="text-gray-400" />;
    }
};

const getEventTypeName = (eventType: string) => {
    switch (eventType) {
        case "SCAN":
            return "LEITURA";
        case "START":
            return "INÍCIO";
        case "COMPLETE":
            return "CONCLUÍDO";
        default:
            return eventType;
    }
};

export default function RastreabilidadePage() {
    const [searchValue, setSearchValue] = useState("");
    const [selectedTab, setSelectedTab] = useState("timeline");

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
                        <h1 className="page-title">Rastreabilidade</h1>
                        <p className="page-subtitle">Rastreie genealogia de lotes e histórico de execução</p>
                    </div>
                </div>
            </motion.div>

            {/* Barra de Busca */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <Card className="card">
                    <CardBody className="py-4">
                        <div className="flex gap-4">
                            <Input
                                placeholder="Buscar por código OP, número do lote ou código de barras..."
                                startContent={<Search size={18} className="text-gray-400" />}
                                value={searchValue}
                                onValueChange={setSearchValue}
                                className="flex-1"
                                size="lg"
                            />
                            <Button color="primary" size="lg">
                                Buscar
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Informações da Seleção Atual */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Package size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Ordem de Produção</p>
                            <p className="text-lg font-bold font-mono">OP-2026-001</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <GitBranch size={24} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Código do Lote</p>
                            <p className="text-lg font-bold font-mono">L-9382</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <CheckCircle2 size={24} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Etapas Concluídas</p>
                            <p className="text-lg font-bold">4 / 7</p>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Abas */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <Tabs
                    aria-label="Visualizações de rastreabilidade"
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => setSelectedTab(key as string)}
                    color="primary"
                    variant="underlined"
                >
                    <Tab key="timeline" title="Linha do Tempo" />
                    <Tab key="genealogy" title="Genealogia" />
                    <Tab key="quality" title="Histórico de Qualidade" />
                </Tabs>
            </motion.div>

            {/* Visualização Timeline */}
            {selectedTab === "timeline" && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="card">
                        <CardHeader className="card-header">
                            <h2 className="card-title">Linha do Tempo de Execução</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="relative">
                                {/* Linha da timeline */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

                                {/* Eventos da timeline */}
                                <div className="space-y-6">
                                    {mockTimeline.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                            className="relative flex gap-4"
                                        >
                                            {/* Ícone */}
                                            <div className="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                                                {item.type === "quality" ? (
                                                    <AlertTriangle size={18} className="text-red-500" />
                                                ) : (
                                                    getEventIcon(item.eventType ?? "")
                                                )}
                                            </div>

                                            {/* Conteúdo */}
                                            <div className="flex-1 bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            color={item.type === "quality" ? "danger" : "primary"}
                                                        >
                                                            {item.type === "quality"
                                                                ? (item.disposition === "SCRAP_NO_REUSE" ? "REFUGO" : "RETRABALHO")
                                                                : getEventTypeName(item.eventType ?? "")}
                                                        </Chip>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {item.step}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-mono">
                                                        {new Date(item.ts).toLocaleString('pt-BR')}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    {item.type === "event" && (
                                                        <>
                                                            <span className="flex items-center gap-1">
                                                                <User size={14} />
                                                                {item.operator}
                                                            </span>
                                                            <span>Centro de Trabalho: {item.workcenter}</span>
                                                            {item.details?.good_qty && (
                                                                <span className="text-green-600 font-medium">
                                                                    ✓ {item.details.good_qty} peças
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                    {item.type === "quality" && (
                                                        <>
                                                            <span className="text-red-600 font-medium">
                                                                {item.qty} peças - {item.reason}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            )}

            {/* Visualização Genealogia */}
            {selectedTab === "genealogy" && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="card">
                        <CardHeader className="card-header">
                            <h2 className="card-title">Genealogia do Lote</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="flex items-center justify-center py-12">
                                {/* Visualização simples de genealogia */}
                                <div className="flex items-center gap-8">
                                    {/* Matéria-Prima */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0 }}
                                        className="text-center"
                                    >
                                        <div className="w-24 h-24 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                                            <Package size={32} className="text-amber-600" />
                                        </div>
                                        <p className="text-sm font-medium">Matéria-Prima</p>
                                        <p className="text-xs text-gray-500 font-mono">RM-MDF-18</p>
                                    </motion.div>

                                    <ArrowRight size={24} className="text-gray-300" />

                                    {/* WIP */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                        className="text-center"
                                    >
                                        <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                                            <GitBranch size={32} className="text-blue-600" />
                                        </div>
                                        <p className="text-sm font-medium">Lote WIP</p>
                                        <p className="text-xs text-gray-500 font-mono">L-9382</p>
                                    </motion.div>

                                    <ArrowRight size={24} className="text-gray-300" />

                                    {/* Montagem */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                        className="text-center"
                                    >
                                        <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                                            <Package size={32} className="text-primary" />
                                        </div>
                                        <p className="text-sm font-medium">Montado</p>
                                        <p className="text-xs text-gray-500 font-mono">ASM-001</p>
                                    </motion.div>

                                    <ArrowRight size={24} className="text-gray-300" />

                                    {/* Produto Final */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.3 }}
                                        className="text-center"
                                    >
                                        <div className="w-24 h-24 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                                            <CheckCircle2 size={32} className="text-green-600" />
                                        </div>
                                        <p className="text-sm font-medium">Produto Final</p>
                                        <p className="text-xs text-gray-500 font-mono">FG-PAINEL-A120</p>
                                    </motion.div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            )}

            {/* Visualização Histórico de Qualidade */}
            {selectedTab === "quality" && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="card">
                        <CardHeader className="card-header">
                            <h2 className="card-title">Histórico de Qualidade deste Lote</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                {mockTimeline
                                    .filter((item) => item.type === "quality")
                                    .map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.1 }}
                                            className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100"
                                        >
                                            <div className="flex items-center gap-4">
                                                <AlertTriangle size={20} className="text-red-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {item.reason} - {item.disposition === "SCRAP_NO_REUSE" ? "Refugo" : "Retrabalho"}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Etapa: {item.step} • {new Date(item.ts).toLocaleString('pt-BR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-red-600">{item.qty}</p>
                                                <p className="text-xs text-gray-500">peças</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                {mockTimeline.filter((item) => item.type === "quality").length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <CheckCircle2 size={48} className="mx-auto mb-2 text-green-500" />
                                        <p>Nenhum problema de qualidade registrado para este lote</p>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
