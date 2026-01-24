"use client";

import { useState } from "react";
import * as motion from "motion/react-client";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Select,
    SelectItem,
    Textarea,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@heroui/react";
import {
    AlertTriangle,
    RefreshCw,
    Plus,
    Trash2,
    CheckCircle2,
    XCircle,
} from "lucide-react";

// Dados mockados
const mockQualityRecords = [
    {
        id: "1",
        ts: "2026-01-22T10:30:00",
        opCode: "OP-2026-001",
        step: "CNC",
        disposition: "SCRAP_NO_REUSE",
        reasonCode: "ARRANHADO",
        qty: 5,
        operator: "OP-123",
    },
    {
        id: "2",
        ts: "2026-01-22T09:15:00",
        opCode: "OP-2026-001",
        step: "Pintura",
        disposition: "REUSE",
        reasonCode: "COR_INCORRETA",
        qty: 3,
        operator: "OP-456",
    },
    {
        id: "3",
        ts: "2026-01-22T08:45:00",
        opCode: "OP-2026-002",
        step: "Montagem",
        disposition: "SCRAP_NO_REUSE",
        reasonCode: "DIMENSAO",
        qty: 2,
        operator: "OP-123",
    },
];

const reasonCodes = [
    { key: "ARRANHADO", label: "Arranhão / Dano Superficial" },
    { key: "DIMENSAO", label: "Dimensão Fora de Tolerância" },
    { key: "COR_INCORRETA", label: "Cor Incorreta" },
    { key: "AMASSADO", label: "Amassado / Deformação" },
    { key: "TRINCA", label: "Trinca / Fratura" },
    { key: "FALTA_COMPONENTE", label: "Falta de Componente" },
    { key: "OUTRO", label: "Outro" },
];

export default function QualidadePage() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedDisposition, setSelectedDisposition] = useState<string>("");
    const [selectedReason, setSelectedReason] = useState<string>("");
    const [qty, setQty] = useState<string>("1");
    const [notes, setNotes] = useState<string>("");

    const handleSubmit = () => {
        console.log({ selectedDisposition, selectedReason, qty, notes });
        onClose();
    };

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
                        <h1 className="page-title">Gestão de Qualidade</h1>
                        <p className="page-subtitle">Registre e analise eventos de qualidade</p>
                    </div>
                    <div className="page-actions">
                        <Button color="primary" startContent={<Plus size={18} />} onPress={onOpen}>
                            Registrar Evento de Qualidade
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
                            <p className="text-xs text-gray-500 uppercase font-bold">Total Refugo</p>
                            <p className="text-2xl font-bold text-red-600">24</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-yellow-50 rounded-xl">
                            <RefreshCw size={24} className="text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Para Retrabalho</p>
                            <p className="text-2xl font-bold text-yellow-600">12</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <CheckCircle2 size={24} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Taxa de Qualidade</p>
                            <p className="text-2xl font-bold text-green-600">97,2%</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <AlertTriangle size={24} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Principal Problema</p>
                            <p className="text-lg font-bold text-gray-900">Arranhão</p>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Tabela de Registros de Qualidade */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <Card className="card">
                    <CardHeader className="card-header">
                        <h2 className="card-title">Eventos de Qualidade Recentes</h2>
                    </CardHeader>
                    <CardBody className="p-0">
                        <Table
                            aria-label="Tabela de registros de qualidade"
                            classNames={{
                                wrapper: "bg-transparent shadow-none",
                                th: "bg-gray-50 text-gray-600 py-3",
                                td: "py-4 border-b border-gray-100",
                            }}
                        >
                            <TableHeader>
                                <TableColumn>HORÁRIO</TableColumn>
                                <TableColumn>CÓDIGO OP</TableColumn>
                                <TableColumn>PROCESSO</TableColumn>
                                <TableColumn>DISPOSIÇÃO</TableColumn>
                                <TableColumn>MOTIVO</TableColumn>
                                <TableColumn>QTD</TableColumn>
                                <TableColumn>OPERADOR</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {mockQualityRecords.map((record) => (
                                    <TableRow key={record.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="text-sm font-mono text-gray-500">
                                            {new Date(record.ts).toLocaleTimeString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="font-mono font-medium">{record.opCode}</TableCell>
                                        <TableCell>{record.step}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                color={record.disposition === "SCRAP_NO_REUSE" ? "danger" : "warning"}
                                                variant="flat"
                                            >
                                                {record.disposition === "SCRAP_NO_REUSE" ? "Refugo" : "Retrabalho"}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>{record.reasonCode}</TableCell>
                                        <TableCell className="font-bold">{record.qty}</TableCell>
                                        <TableCell className="text-gray-500">{record.operator}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Modal de Registro de Qualidade */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <span>Registrar Evento de Qualidade</span>
                        <span className="text-sm font-normal text-gray-500">
                            Reporte refugo ou retrabalho para a produção atual
                        </span>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Select
                                label="Disposição"
                                placeholder="Selecione o tipo de disposição"
                                selectedKeys={selectedDisposition ? [selectedDisposition] : []}
                                onChange={(e) => setSelectedDisposition(e.target.value)}
                            >
                                <SelectItem key="SCRAP_NO_REUSE" startContent={<Trash2 size={16} className="text-red-500" />}>
                                    Refugo (Sem Retrabalho)
                                </SelectItem>
                                <SelectItem key="REUSE" startContent={<RefreshCw size={16} className="text-yellow-500" />}>
                                    Retrabalho / Reuso
                                </SelectItem>
                            </Select>

                            <Select
                                label="Código do Motivo"
                                placeholder="Selecione o motivo"
                                selectedKeys={selectedReason ? [selectedReason] : []}
                                onChange={(e) => setSelectedReason(e.target.value)}
                            >
                                {reasonCodes.map((reason) => (
                                    <SelectItem key={reason.key}>{reason.label}</SelectItem>
                                ))}
                            </Select>

                            <Input
                                type="number"
                                label="Quantidade"
                                placeholder="Informe a quantidade"
                                value={qty}
                                onValueChange={setQty}
                                min={1}
                            />

                            <Textarea
                                label="Observações (Opcional)"
                                placeholder="Adicione detalhes adicionais..."
                                value={notes}
                                onValueChange={setNotes}
                                rows={3}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            color={selectedDisposition === "SCRAP_NO_REUSE" ? "danger" : "warning"}
                            onPress={handleSubmit}
                            isDisabled={!selectedDisposition || !selectedReason || !qty}
                        >
                            Registrar Evento
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
