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
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Tabs,
    Tab,
    Accordion,
    AccordionItem,
} from "@heroui/react";
import {
    Search,
    Package,
    Layers,
    Plus,
    ChevronRight,
    Box,
    TreePine,
    Hammer,
    Paintbrush,
    Settings2,
    AlertCircle,
} from "lucide-react";

// Dados mockados de itens - Baseado no roteiro MES RENAR
const mockItems = [
    {
        id: "1",
        code: "MDF-18MM-BR",
        name: "Chapa MDF 18mm Branco",
        type: "MATERIA_PRIMA",
        unit: "UN",
        stock: 245,
        minStock: 100,
        category: "Madeira",
    },
    {
        id: "2",
        code: "MDF-15MM-CRU",
        name: "Chapa MDF 15mm Cru",
        type: "MATERIA_PRIMA",
        unit: "UN",
        stock: 180,
        minStock: 80,
        category: "Madeira",
    },
    {
        id: "3",
        code: "PAINEL-LAT-A",
        name: "Painel Lateral Modelo A",
        type: "SEMIACABADO",
        unit: "UN",
        stock: 45,
        minStock: 20,
        category: "Painéis",
    },
    {
        id: "4",
        code: "GAVETA-MED",
        name: "Gaveta Média Montada",
        type: "SEMIACABADO",
        unit: "UN",
        stock: 32,
        minStock: 15,
        category: "Subconjuntos",
    },
    {
        id: "5",
        code: "ARMARIO-3P",
        name: "Armário 3 Portas Completo",
        type: "PRODUTO_FINAL",
        unit: "UN",
        stock: 12,
        minStock: 5,
        category: "Móveis",
    },
    {
        id: "6",
        code: "COMODA-4G",
        name: "Cômoda 4 Gavetas",
        type: "PRODUTO_FINAL",
        unit: "UN",
        stock: 8,
        minStock: 5,
        category: "Móveis",
    },
];

// Estrutura BOM mockada - Reflete o roteiro de operações
const mockBOM = {
    item: mockItems[4], // Armário 3 Portas
    components: [
        {
            id: "c1",
            item: { code: "PAINEL-LAT-A", name: "Painel Lateral Modelo A" },
            qty: 2,
            unit: "UN",
            process: "Otimizadora",
        },
        {
            id: "c2",
            item: { code: "PAINEL-FUNDO", name: "Painel de Fundo" },
            qty: 1,
            unit: "UN",
            process: "Pré-Corte",
        },
        {
            id: "c3",
            item: { code: "PORTA-STD", name: "Porta Padrão" },
            qty: 3,
            unit: "UN",
            process: "CNC",
        },
        {
            id: "c4",
            item: { code: "PRATELEIRA-INT", name: "Prateleira Interna" },
            qty: 4,
            unit: "UN",
            process: "Lixamento",
        },
        {
            id: "c5",
            item: { code: "DOBRADICA-35MM", name: "Dobradiça 35mm" },
            qty: 9,
            unit: "UN",
            process: "Montagem",
        },
        {
            id: "c6",
            item: { code: "PUXADOR-METAL", name: "Puxador Metálico" },
            qty: 3,
            unit: "UN",
            process: "Montagem",
        },
    ],
};

// Processos do roteiro conforme MES RENAR
const processes = [
    { id: "OPT", name: "Otimizadora", icon: <TreePine size={18} />, color: "bg-emerald-500" },
    { id: "PRE", name: "Pré-Corte", icon: <Box size={18} />, color: "bg-blue-500" },
    { id: "CNC", name: "CNC/Usinagem", icon: <Settings2 size={18} />, color: "bg-primary" },
    { id: "LIX", name: "Lixamento/Escovação", icon: <Hammer size={18} />, color: "bg-amber-500" },
    { id: "MONT", name: "Montagem", icon: <Layers size={18} />, color: "bg-slate-600" },
    { id: "PINT", name: "Pintura", icon: <Paintbrush size={18} />, color: "bg-rose-500" },
    { id: "EMB", name: "Embalagem", icon: <Package size={18} />, color: "bg-teal-500" },
];

const getTypeColor = (type: string) => {
    switch (type) {
        case "MATERIA_PRIMA":
            return "warning";
        case "SEMIACABADO":
            return "secondary";
        case "PRODUTO_FINAL":
            return "success";
        default:
            return "default";
    }
};

const getTypeName = (type: string) => {
    switch (type) {
        case "MATERIA_PRIMA":
            return "Matéria-Prima";
        case "SEMIACABADO":
            return "Semiacabado";
        case "PRODUTO_FINAL":
            return "Produto Final";
        default:
            return type;
    }
};

export default function ItemsBOMPage() {
    const [searchValue, setSearchValue] = useState("");
    const [selectedTab, setSelectedTab] = useState("itens");
    const [selectedItem, setSelectedItem] = useState<typeof mockItems[0] | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const filteredItems = mockItems.filter(
        (item) =>
            item.code.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleViewBOM = (item: typeof mockItems[0]) => {
        setSelectedItem(item);
        onOpen();
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
                        <h1 className="page-title">Itens e Lista de Materiais</h1>
                        <p className="page-subtitle">
                            Gerencie itens, estruturas de produto e roteiros de fabricação
                        </p>
                    </div>
                    <div className="page-actions">
                        <Button color="primary" startContent={<Plus size={18} />}>
                            Novo Item
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
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <TreePine size={24} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Matérias-Primas</p>
                            <p className="text-2xl font-bold text-amber-600">
                                {mockItems.filter((i) => i.type === "MATERIA_PRIMA").length}
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Layers size={24} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Semiacabados</p>
                            <p className="text-2xl font-bold text-primary">
                                {mockItems.filter((i) => i.type === "SEMIACABADO").length}
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <Package size={24} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Produtos Finais</p>
                            <p className="text-2xl font-bold text-green-600">
                                {mockItems.filter((i) => i.type === "PRODUTO_FINAL").length}
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="card">
                    <CardBody className="flex flex-row items-center gap-4 py-5">
                        <div className="p-3 bg-red-50 rounded-xl">
                            <AlertCircle size={24} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Estoque Baixo</p>
                            <p className="text-2xl font-bold text-red-600">
                                {mockItems.filter((i) => i.stock <= i.minStock).length}
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
                    aria-label="Visualizações de itens"
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => setSelectedTab(key as string)}
                    color="primary"
                    variant="underlined"
                >
                    <Tab key="itens" title="Cadastro de Itens" />
                    <Tab key="bom" title="Estruturas (BOM)" />
                    <Tab key="roteiro" title="Roteiro de Operações" />
                </Tabs>
            </motion.div>

            {/* Aba de Itens */}
            {selectedTab === "itens" && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="card">
                        <CardHeader className="card-header flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Input
                                    placeholder="Buscar por código ou nome..."
                                    startContent={<Search size={18} className="text-gray-400" />}
                                    value={searchValue}
                                    onValueChange={setSearchValue}
                                    className="w-80"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="flat" color="secondary">
                                    Matéria-Prima
                                </Button>
                                <Button size="sm" variant="flat" color="secondary">
                                    Semiacabado
                                </Button>
                                <Button size="sm" variant="flat" color="secondary">
                                    Produto Final
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody className="p-0">
                            <Table
                                aria-label="Tabela de itens"
                                classNames={{
                                    wrapper: "bg-transparent shadow-none",
                                    th: "bg-gray-50 text-gray-600 py-3",
                                    td: "py-4 border-b border-gray-100",
                                }}
                            >
                                <TableHeader>
                                    <TableColumn>CÓDIGO</TableColumn>
                                    <TableColumn>DESCRIÇÃO</TableColumn>
                                    <TableColumn>TIPO</TableColumn>
                                    <TableColumn>CATEGORIA</TableColumn>
                                    <TableColumn>ESTOQUE</TableColumn>
                                    <TableColumn>AÇÕES</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <TableCell className="font-mono font-medium text-primary">
                                                {item.code}
                                            </TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="sm"
                                                    color={getTypeColor(item.type)}
                                                    variant="flat"
                                                >
                                                    {getTypeName(item.type)}
                                                </Chip>
                                            </TableCell>
                                            <TableCell className="text-gray-500">{item.category}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`font-bold ${item.stock <= item.minStock
                                                                ? "text-red-600"
                                                                : "text-gray-900"
                                                            }`}
                                                    >
                                                        {item.stock}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        / mín. {item.minStock}
                                                    </span>
                                                    {item.stock <= item.minStock && (
                                                        <AlertCircle size={14} className="text-red-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    endContent={<ChevronRight size={14} />}
                                                    onPress={() => handleViewBOM(item)}
                                                >
                                                    Ver BOM
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                </motion.div>
            )}

            {/* Aba de Estruturas BOM */}
            {selectedTab === "bom" && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="card">
                        <CardHeader className="card-header">
                            <h2 className="card-title">Estrutura de Produto - {mockBOM.item.name}</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="flex gap-8">
                                {/* Árvore de Componentes */}
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-500 uppercase mb-4">
                                        Componentes Necessários
                                    </p>
                                    <div className="space-y-3">
                                        {mockBOM.components.map((comp, index) => (
                                            <motion.div
                                                key={comp.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
                                            >
                                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <Package size={20} className="text-gray-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{comp.item.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono">
                                                        {comp.item.code}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">{comp.qty}</p>
                                                    <p className="text-xs text-gray-400">{comp.unit}</p>
                                                </div>
                                                <Chip size="sm" variant="flat" color="secondary">
                                                    {comp.process}
                                                </Chip>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Resumo */}
                                <div className="w-80">
                                    <p className="text-sm font-bold text-gray-500 uppercase mb-4">
                                        Resumo
                                    </p>
                                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                                        <CardBody className="space-y-4">
                                            <div className="text-center py-4">
                                                <div className="w-16 h-16 bg-primary/10 rounded-xl mx-auto flex items-center justify-center mb-3">
                                                    <Package size={32} className="text-primary" />
                                                </div>
                                                <p className="font-bold text-lg">{mockBOM.item.name}</p>
                                                <p className="text-sm text-gray-500 font-mono">
                                                    {mockBOM.item.code}
                                                </p>
                                            </div>
                                            <div className="border-t border-primary/10 pt-4 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Total Componentes:</span>
                                                    <span className="font-bold">{mockBOM.components.length}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Total Peças:</span>
                                                    <span className="font-bold">
                                                        {mockBOM.components.reduce((sum, c) => sum + c.qty, 0)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Processos:</span>
                                                    <span className="font-bold">
                                                        {new Set(mockBOM.components.map((c) => c.process)).size}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            )}

            {/* Aba de Roteiro de Operações */}
            {selectedTab === "roteiro" && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="card">
                        <CardHeader className="card-header">
                            <h2 className="card-title">Roteiro de Operações</h2>
                        </CardHeader>
                        <CardBody>
                            <p className="text-gray-500 mb-6">
                                Sequência de processos conforme definido no MES RENAR
                            </p>
                            <div className="flex items-center gap-4 overflow-x-auto pb-4">
                                {processes.map((process, index) => (
                                    <motion.div
                                        key={process.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.08 }}
                                        className="flex items-center"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-16 h-16 ${process.color} rounded-xl flex items-center justify-center text-white shadow-lg`}
                                            >
                                                {process.icon}
                                            </div>
                                            <p className="text-sm font-medium mt-2 text-center max-w-[100px]">
                                                {process.name}
                                            </p>
                                            <Chip size="sm" variant="flat" className="mt-1">
                                                Etapa {index + 1}
                                            </Chip>
                                        </div>
                                        {index < processes.length - 1 && (
                                            <ChevronRight size={24} className="mx-2 text-gray-300" />
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Detalhes das Etapas */}
                            <div className="mt-8">
                                <Accordion variant="bordered">
                                    <AccordionItem
                                        key="opt"
                                        title="1. Otimizadora"
                                        subtitle="Leitura de lote/OP via código de barras"
                                    >
                                        <p className="text-gray-600">
                                            Realiza a leitura do lote/OP via código de barras, validando
                                            quantidade e disponibilidade de matéria-prima. Controla a liberação
                                            conforme material sai do processo de corte, recebendo informações
                                            diretamente do banco de dados da máquina.
                                        </p>
                                    </AccordionItem>
                                    <AccordionItem
                                        key="pre"
                                        title="2. Pré-Corte"
                                        subtitle="Validação da OP e disponibilidade de MP"
                                    >
                                        <p className="text-gray-600">
                                            Valida a OP e disponibilidade de MP do processo anterior.
                                            Gerencia ocupação de recursos (prensas e esteiras) e verificações
                                            cruzadas na célula de moldagem de gavetas. Análise de qualidade
                                            dividida entre refugo e retrabalho.
                                        </p>
                                    </AccordionItem>
                                    <AccordionItem
                                        key="cnc"
                                        title="3. CNC/Usinagem"
                                        subtitle="Contagem automática de peças por ciclo"
                                    >
                                        <p className="text-gray-600">
                                            Inclui contagem automática de peças por ciclo. Como no pré-corte,
                                            realiza validação da OP e análise de qualidade entre refugo e
                                            retrabalho.
                                        </p>
                                    </AccordionItem>
                                    <AccordionItem
                                        key="lix"
                                        title="4. Lixamento/Escovação"
                                        subtitle="Ocupação de esteira e contagem de peças"
                                    >
                                        <p className="text-gray-600">
                                            Valida a OP e gerencia a ocupação de recursos da esteira de
                                            escovação, além de contagem de peças e análise de qualidade.
                                        </p>
                                    </AccordionItem>
                                    <AccordionItem
                                        key="mont"
                                        title="5. Montagem"
                                        subtitle="Validação de disponibilidade de todos os componentes"
                                    >
                                        <p className="text-gray-600">
                                            Como envolve subconjuntos, a montagem só é liberada se todos os
                                            itens componentes estiverem disponíveis. Se faltarem itens, o
                                            sistema libera apenas a quantidade possível e gera reposição ou
                                            discrepâncias para análise. Contagem de esteira é automática.
                                        </p>
                                    </AccordionItem>
                                    <AccordionItem
                                        key="pint"
                                        title="6. Pintura"
                                        subtitle="Lógica de composição de conjuntos"
                                    >
                                        <p className="text-gray-600">
                                            Segue lógica de composição; liberação depende da disponibilidade
                                            de todos os itens do conjunto, considerando subconjuntos ou peças
                                            de processos anteriores. Contagem automática de itens passando
                                            pela esteira.
                                        </p>
                                    </AccordionItem>
                                    <AccordionItem
                                        key="emb"
                                        title="7. Embalagem"
                                        subtitle="Geração de etiquetas de produto final"
                                    >
                                        <p className="text-gray-600">
                                            Valida a OP e a disponibilidade de todos os itens do produto
                                            final. Realiza contagem automática de caixas e gera etiquetas
                                            de produto final conforme a OP bipada.
                                        </p>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            )}

            {/* Modal de BOM */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    <ModalHeader>
                        <div>
                            <span className="text-lg">Lista de Materiais (BOM)</span>
                            <p className="text-sm font-normal text-gray-500">
                                {selectedItem?.name}
                            </p>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        {selectedItem?.type === "PRODUTO_FINAL" ? (
                            <div className="space-y-3">
                                {mockBOM.components.map((comp) => (
                                    <div
                                        key={comp.id}
                                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                                    >
                                        <Package size={20} className="text-gray-400" />
                                        <div className="flex-1">
                                            <p className="font-medium">{comp.item.name}</p>
                                            <p className="text-xs text-gray-400">{comp.item.code}</p>
                                        </div>
                                        <p className="font-bold">
                                            {comp.qty} {comp.unit}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Package size={48} className="mx-auto mb-2 opacity-30" />
                                <p>Este item não possui estrutura de produto (BOM)</p>
                                <p className="text-sm">
                                    Apenas produtos finais e semiacabados possuem lista de materiais
                                </p>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>
                            Fechar
                        </Button>
                        <Button color="primary">Imprimir BOM</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
