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
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Select,
    SelectItem,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import {
    Search,
    FileText,
    Play,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Filter,
} from "lucide-react";

// Dados mockados de OPs
const mockOPs = [
    {
        id: "1",
        code: "OP-2026-001",
        itemCode: "ARMARIO-3P",
        itemName: "Armário 3 Portas",
        plannedQty: 100,
        executedQty: 85,
        status: "IN_PROGRESS",
        dueDate: "2026-01-25",
        priority: 1,
    },
    {
        id: "2",
        code: "OP-2026-002",
        itemCode: "COMODA-4G",
        itemName: "Cômoda 4 Gavetas",
        plannedQty: 50,
        executedQty: 50,
        status: "CLOSED",
        dueDate: "2026-01-22",
        priority: 2,
    },
    {
        id: "3",
        code: "OP-2026-003",
        itemCode: "MESA-JANTAR",
        itemName: "Mesa de Jantar",
        plannedQty: 30,
        executedQty: 0,
        status: "OPEN_NOT_STARTED",
        dueDate: "2026-01-28",
        priority: 3,
    },
    {
        id: "4",
        code: "OP-2026-004",
        itemCode: "GUARDA-ROUPA",
        itemName: "Guarda-Roupa 6 Portas",
        plannedQty: 20,
        executedQty: 12,
        status: "IN_PROGRESS",
        dueDate: "2026-01-24",
        priority: 1,
    },
    {
        id: "5",
        code: "OP-2026-005",
        itemCode: "ESTANTE-LIV",
        itemName: "Estante para Livros",
        plannedQty: 40,
        executedQty: 30,
        status: "OPEN_PARTIAL",
        dueDate: "2026-01-26",
        priority: 2,
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "CLOSED":
            return "success";
        case "IN_PROGRESS":
            return "primary";
        case "OPEN_PARTIAL":
            return "warning";
        case "OPEN_NOT_STARTED":
            return "default";
        default:
            return "default";
    }
};

const getStatusName = (status: string) => {
    switch (status) {
        case "CLOSED":
            return "Fechada";
        case "IN_PROGRESS":
            return "Em Progresso";
        case "OPEN_PARTIAL":
            return "Parcialmente Aberta";
        case "OPEN_NOT_STARTED":
            return "Não Iniciada";
        default:
            return status;
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "CLOSED":
            return <CheckCircle2 size={14} />;
        case "IN_PROGRESS":
            return <Play size={14} />;
        case "OPEN_PARTIAL":
            return <Clock size={14} />;
        default:
            return <AlertCircle size={14} />;
    }
};

export default function OrdensProducaoPage() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredOPs = mockOPs.filter((op) => {
        const matchesSearch =
            op.code.toLowerCase().includes(searchValue.toLowerCase()) ||
            op.itemName.toLowerCase().includes(searchValue.toLowerCase()) ||
            op.itemCode.toLowerCase().includes(searchValue.toLowerCase());
        const matchesStatus = !statusFilter || op.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                        <h1 className="page-title">Ordens de Produção</h1>
                        <p className="page-subtitle">Gerencie e acompanhe as ordens de produção</p>
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
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <FileText size={24} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Total de OPs</p>
                            <p className="text-2xl font-bold text-primary">{mockOPs.length}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <Play size={24} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Em Progresso</p>
                            <p className="text-2xl font-bold text-green-600">
                                {mockOPs.filter((op) => op.status === "IN_PROGRESS").length}
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <CheckCircle2 size={24} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Concluídas</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {mockOPs.filter((op) => op.status === "CLOSED").length}
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <Clock size={24} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Aguardando</p>
                            <p className="text-2xl font-bold text-amber-600">
                                {mockOPs.filter((op) => op.status === "OPEN_NOT_STARTED").length}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Tabela de OPs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <Card className="card">
                    <CardHeader className="card-header flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Input
                                placeholder="Buscar por código, item..."
                                startContent={<Search size={18} className="text-gray-400" />}
                                value={searchValue}
                                onValueChange={setSearchValue}
                                className="w-80"
                            />
                            <Select
                                placeholder="Filtrar por status"
                                selectedKeys={statusFilter ? [statusFilter] : []}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-48"
                                startContent={<Filter size={16} className="text-gray-400" />}
                            >
                                <SelectItem key="">Todos</SelectItem>
                                <SelectItem key="OPEN_NOT_STARTED">Não Iniciada</SelectItem>
                                <SelectItem key="IN_PROGRESS">Em Progresso</SelectItem>
                                <SelectItem key="OPEN_PARTIAL">Parcialmente Aberta</SelectItem>
                                <SelectItem key="CLOSED">Fechada</SelectItem>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardBody className="p-0">
                        <Table
                            aria-label="Tabela de ordens de produção"
                            classNames={{
                                wrapper: "bg-transparent shadow-none",
                                th: "bg-gray-50 text-gray-600 py-3",
                                td: "py-4 border-b border-gray-100",
                            }}
                        >
                            <TableHeader>
                                <TableColumn>CÓDIGO OP</TableColumn>
                                <TableColumn>ITEM</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>PROGRESSO</TableColumn>
                                <TableColumn>DATA ENTREGA</TableColumn>
                                <TableColumn>PRIORIDADE</TableColumn>
                                <TableColumn>AÇÕES</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {filteredOPs.map((op) => (
                                    <TableRow
                                        key={op.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <TableCell className="font-mono font-medium text-primary">
                                            {op.code}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{op.itemName}</p>
                                                <p className="text-xs text-gray-400">{op.itemCode}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                color={getStatusColor(op.status)}
                                                variant="flat"
                                                startContent={getStatusIcon(op.status)}
                                            >
                                                {getStatusName(op.status)}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                                    <div
                                                        className={`h-2 rounded-full ${op.executedQty >= op.plannedQty
                                                                ? "bg-emerald-500"
                                                                : "bg-primary"
                                                            }`}
                                                        style={{
                                                            width: `${Math.min(
                                                                (op.executedQty / op.plannedQty) * 100,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {op.executedQty}/{op.plannedQty}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-500">
                                            {new Date(op.dueDate).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={op.priority === 1 ? "danger" : op.priority === 2 ? "warning" : "default"}
                                            >
                                                P{op.priority}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                endContent={<ChevronRight size={14} />}
                                                onPress={() => router.push(`/execution?op=${op.id}`)}
                                            >
                                                Executar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                    <div className="flex justify-center py-4 border-t border-gray-100">
                        <Pagination
                            total={3}
                            page={currentPage}
                            onChange={setCurrentPage}
                            color="primary"
                        />
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
