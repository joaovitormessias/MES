"use client";

import { useState } from "react";
import * as motion from "motion/react-client";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Switch,
    Divider,
    Tabs,
    Tab,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
} from "@heroui/react";
import {
    Settings as SettingsIcon,
    Clock,
    Users,
    Factory,
    Bell,
    Shield,
    Save,
    RefreshCw,
} from "lucide-react";

// Dados mockados de turnos
const mockShifts = [
    { id: "1", name: "Manhã", startTime: "06:00", endTime: "14:00", isActive: true },
    { id: "2", name: "Tarde", startTime: "14:00", endTime: "22:00", isActive: true },
    { id: "3", name: "Noturno", startTime: "22:00", endTime: "06:00", isActive: false },
];

// Centros de trabalho mockados
const mockWorkcenters = [
    { id: "1", code: "OPT-01", name: "Otimizadora 1", type: "OTIMIZADORA", isEnabled: true },
    { id: "2", code: "CNC-01", name: "CNC Máquina 1", type: "CNC", isEnabled: true },
    { id: "3", code: "CNC-02", name: "CNC Máquina 2", type: "CNC", isEnabled: false },
    { id: "4", code: "MONT-01", name: "Linha de Montagem 1", type: "MONTAGEM", isEnabled: true },
    { id: "5", code: "PINT-01", name: "Cabine de Pintura 1", type: "PINTURA", isEnabled: true },
];

export default function ConfiguracoesPage() {
    const [selectedTab, setSelectedTab] = useState("geral");
    const [notifications, setNotifications] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState("30");

    return (
        <div className="space-y-8">
            {/* Cabeçalho da Página */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="page-header"
            >
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title">Configurações</h1>
                        <p className="page-subtitle">Configure preferências do sistema e centros de trabalho</p>
                    </div>
                    <div className="page-actions">
                        <Button color="primary" startContent={<Save size={18} />}>
                            Salvar Alterações
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Abas */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <div className="rounded-2xl border border-gray-100 bg-white/90 p-2 shadow-sm">
                    <Tabs
                        aria-label="Abas de configurações"
                        selectedKey={selectedTab}
                        onSelectionChange={(key) => setSelectedTab(key as string)}
                        color="primary"
                        variant="underlined"
                    >
                        <Tab key="geral" title="Geral" />
                        <Tab key="turnos" title="Turnos" />
                        <Tab key="centros" title="Centros de Trabalho" />
                        <Tab key="notificacoes" title="Notificações" />
                    </Tabs>
                </div>
            </motion.div>

            {/* Configurações Gerais */}
            {selectedTab === "geral" && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                >
                    <Card className="card">
                        <CardHeader className="card-header">
                            <div className="flex items-center gap-2">
                                <SettingsIcon size={20} className="text-gray-500" />
                                <div>
                                    <h2 className="card-title">Preferências de Exibição</h2>
                                    <p className="text-sm text-gray-500">Idioma e padrões de visualização</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="space-y-4 p-6">
                            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                                <div>
                                    <p className="font-medium">Modo de Visualização Compacto</p>
                                    <p className="text-sm text-gray-500">Reduz o espaçamento em tabelas e listas</p>
                                </div>
                                <Switch size="sm" defaultSelected color="primary" />
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3">
                                <div>
                                    <p className="font-medium">Mostrar Métricas Avançadas</p>
                                    <p className="text-sm text-gray-500">Exibe indicadores de eficiência e refugo</p>
                                </div>
                                <Switch size="sm" defaultSelected color="primary" />
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3">
                                <div>
                                    <p className="font-medium">Destacar Alertas Críticos</p>
                                    <p className="text-sm text-gray-500">Aplica realce visual em ocorrências urgentes</p>
                                </div>
                                <Switch size="sm" defaultSelected color="primary" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="card">
                        <CardHeader className="card-header">
                            <div className="flex items-center gap-2">
                                <RefreshCw size={20} className="text-gray-500" />
                                <div>
                                    <h2 className="card-title">Atualização de Dados</h2>
                                    <p className="text-sm text-gray-500">Cadência e frequência do painel</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="space-y-5 p-6">
                            <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-medium">Atualização Automática do Painel</p>
                                    <p className="text-sm text-gray-500">Atualizar dados do painel automaticamente</p>
                                </div>
                                <Switch
                                    isSelected={autoRefresh}
                                    onValueChange={setAutoRefresh}
                                    color="primary"
                                />
                            </div>

                            {autoRefresh && (
                                <Select
                                    label="Intervalo de Atualização"
                                    labelPlacement="outside"
                                    selectedKeys={[refreshInterval]}
                                    onChange={(e) => setRefreshInterval(e.target.value)}
                                    className="w-full"
                                    variant="bordered"
                                >
                                    <SelectItem key="10">A cada 10 segundos</SelectItem>
                                    <SelectItem key="30">A cada 30 segundos</SelectItem>
                                    <SelectItem key="60">A cada minuto</SelectItem>
                                    <SelectItem key="300">A cada 5 minutos</SelectItem>
                                </Select>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>
            )}

            {/* Turnos */}
            {selectedTab === "turnos" && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                        <Card className="card flex-1">
                            <CardHeader className="card-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock size={20} className="text-gray-500" />
                                    <div>
                                        <h2 className="card-title">Calendário de Turnos</h2>
                                        <p className="text-sm text-gray-500">Organize turnos e horários da operação</p>
                                    </div>
                                </div>
                                <Button size="sm" color="primary" variant="flat">
                                    Adicionar Turno
                                </Button>
                            </CardHeader>
                            <CardBody className="p-0">
                                <Table
                                    aria-label="Calendário de turnos"
                                    classNames={{
                                        wrapper: "bg-transparent shadow-none",
                                        th: "bg-gray-50 text-gray-600 py-3",
                                        td: "py-4 border-b border-gray-100",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>NOME DO TURNO</TableColumn>
                                        <TableColumn>HORA INÍCIO</TableColumn>
                                        <TableColumn>HORA FIM</TableColumn>
                                        <TableColumn>STATUS</TableColumn>
                                        <TableColumn>AÇÕES</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {mockShifts.map((shift) => (
                                            <TableRow key={shift.id}>
                                                <TableCell className="font-medium">{shift.name}</TableCell>
                                                <TableCell className="font-mono">{shift.startTime}</TableCell>
                                                <TableCell className="font-mono">{shift.endTime}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="sm"
                                                        color={shift.isActive ? "success" : "default"}
                                                        variant="flat"
                                                    >
                                                        {shift.isActive ? "Ativo" : "Inativo"}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="light">
                                                        Editar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardBody>
                        </Card>

                        <Card className="card w-full lg:w-[320px] lg:mt-10">
                            <CardHeader className="card-header">
                                <div className="flex items-center gap-2">
                                    <Users size={20} className="text-gray-500" />
                                    <div>
                                        <h2 className="card-title">Resumo de Turnos</h2>
                                        <p className="text-sm text-gray-500">Visão geral rápida do time</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody className="space-y-4 p-6">
                                <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500">Turnos ativos</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {mockShifts.filter((shift) => shift.isActive).length}
                                        </p>
                                    </div>
                                    <Chip size="sm" variant="flat" color="success">
                                        Em operação
                                    </Chip>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Próxima troca</p>
                                    <p className="mt-1 text-sm text-gray-700">14:00 - Turno da Tarde</p>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Equipe responsável</p>
                                    <p className="mt-1 text-sm text-gray-700">Equipe A · 32 operadores</p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </motion.div>
            )}

            {/* Centros de Trabalho */}
            {selectedTab === "centros" && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)]">
                            <Card className="card">
                                <CardBody className="space-y-2 p-6">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Centros ativos</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {mockWorkcenters.filter((wc) => wc.isEnabled).length}
                                    </p>
                                    <p className="text-sm text-gray-500">Em operação agora</p>
                                </CardBody>
                            </Card>
                            <Card className="card">
                                <CardBody className="space-y-2 p-6">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Centros parados</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {mockWorkcenters.filter((wc) => !wc.isEnabled).length}
                                    </p>
                                    <p className="text-sm text-gray-500">Paradas programadas</p>
                                </CardBody>
                            </Card>
                            <Card className="card">
                                <CardBody className="space-y-2 p-6">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Capacidade média</p>
                                    <p className="text-2xl font-semibold text-gray-900">82%</p>
                                    <p className="text-sm text-gray-500">Uso semanal do parque</p>
                                </CardBody>
                            </Card>
                        </div>

                        <Card className="card">
                            <CardHeader className="card-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <Factory size={20} className="text-gray-500" />
                                    <div>
                                        <h2 className="card-title">Centros de Trabalho</h2>
                                        <p className="text-sm text-gray-500">Controle disponibilidade e configuração</p>
                                    </div>
                                </div>
                                <Button size="sm" color="primary" variant="flat">
                                    Adicionar Centro de Trabalho
                                </Button>
                            </CardHeader>
                            <CardBody className="p-0">
                                <Table
                                    aria-label="Centros de trabalho"
                                    classNames={{
                                        wrapper: "bg-transparent shadow-none",
                                        th: "bg-gray-50 text-gray-600 py-3",
                                        td: "py-4 border-b border-gray-100",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>CÓDIGO</TableColumn>
                                        <TableColumn>NOME</TableColumn>
                                        <TableColumn>TIPO</TableColumn>
                                        <TableColumn>STATUS</TableColumn>
                                        <TableColumn>AÇÕES</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {mockWorkcenters.map((wc) => (
                                            <TableRow key={wc.id}>
                                                <TableCell className="font-mono font-medium">{wc.code}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{wc.name}</p>
                                                        <p className="text-xs text-gray-500">{wc.type}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip size="sm" variant="flat" color="secondary">
                                                        {wc.type}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            size="sm"
                                                            isSelected={wc.isEnabled}
                                                            color={wc.isEnabled ? "success" : "default"}
                                                        />
                                                        <span className="text-xs text-gray-500">
                                                            {wc.isEnabled ? "Ativo" : "Inativo"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="light">
                                                        Configurar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardBody>
                        </Card>
                    </div>
                </motion.div>
            )}

            {/* Notificações */}
            {selectedTab === "notificacoes" && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                        <Card className="card flex-1">
                            <CardHeader className="card-header">
                                <div className="flex items-center gap-2">
                                    <Bell size={20} className="text-gray-500" />
                                    <div>
                                        <h2 className="card-title">Preferências de Notificação</h2>
                                        <p className="text-sm text-gray-500">Controle alertas por tipo de evento</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody className="space-y-6 p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-medium">Notificações Push</p>
                                        <p className="text-sm text-gray-500">Receber alertas para eventos críticos</p>
                                    </div>
                                    <Switch
                                        isSelected={notifications}
                                        onValueChange={setNotifications}
                                        color="primary"
                                    />
                                </div>

                                <Divider />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                                        <span className="text-sm">Ordem de produção iniciada</span>
                                        <Switch size="sm" defaultSelected color="primary" />
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                                        <span className="text-sm">Ordem de produção concluída</span>
                                        <Switch size="sm" defaultSelected color="primary" />
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                                        <span className="text-sm">Evento de qualidade registrado</span>
                                        <Switch size="sm" defaultSelected color="primary" />
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                                        <span className="text-sm">OEE abaixo do limite</span>
                                        <Switch size="sm" defaultSelected color="primary" />
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                                        <span className="text-sm">Parada de equipamento detectada</span>
                                        <Switch size="sm" defaultSelected color="primary" />
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                                        <span className="text-sm">Solicitação de aprovação pendente</span>
                                        <Switch size="sm" defaultSelected color="primary" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="card w-full lg:w-[320px] lg:mt-10">
                            <CardHeader className="card-header">
                                <div className="flex items-center gap-2">
                                    <Shield size={20} className="text-gray-500" />
                                    <div>
                                        <h2 className="card-title">Canal Prioritário</h2>
                                        <p className="text-sm text-gray-500">Eventos críticos com destaque</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody className="space-y-4 p-6">
                                <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Canal principal</p>
                                    <p className="mt-1 text-sm text-gray-700">Push + Email corporativo</p>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Escalonamento</p>
                                    <p className="mt-1 text-sm text-gray-700">Supervisor de turno após 5 min</p>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Urgência</p>
                                    <p className="mt-1 text-sm text-gray-700">OEE abaixo de 75% · Paradas acima de 10 min</p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
