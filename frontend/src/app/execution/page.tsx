"use client";

import { Card, CardBody, Button, Progress, Chip, Input, CircularProgress } from "@heroui/react";
import { Scan, RefreshCcw, Box, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_OP = {
    id: "OP-2026-001",
    item: "Painel A-120",
    lot: "L-9382",
    planned: 100,
    actual: 65,
    standardTime: 30, // seconds
    avgCycleTime: 32.5, // seconds
    lastCycleTime: 29.8,
    status: "IN_PROGRESS"
};

export default function ExecutionPage() {
    const [scanValue, setScanValue] = useState("");
    const [lastScanStatus, setLastScanStatus] = useState<"idle" | "success" | "error">("idle");
    const [cycleTime, setCycleTime] = useState(0);
    const isTimerRunning = true;

    // Cycle timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setCycleTime((prev) => prev + 0.1);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const handleScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!scanValue) return;

        // Simulate scan processing
        if (scanValue === "ERROR") {
            setLastScanStatus("error");
        } else {
            setLastScanStatus("success");
            setCycleTime(0); // Reset cycle
        }

        setScanValue("");
        setTimeout(() => setLastScanStatus("idle"), 2000);
    };

    return (
        <div className="min-h-screen bg-background bg-industrial p-4 md:p-6 flex flex-col gap-6">
            {/* Header Info Bar */}
            <Card className="glass border-none">
                <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 px-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-mono tracking-tight">{MOCK_OP.id}</h1>
                            <Chip color="success" variant="dot" className="border-none bg-success/10 text-success">
                                EM EXECUÇÃO
                            </Chip>
                        </div>
                        <p className="text-default-500 font-medium flex items-center gap-2 mt-1">
                            <Box size={16} /> {MOCK_OP.item}
                            <span className="opacity-50 mx-1">|</span>
                            <span className="font-mono text-xs opacity-70">Lote: {MOCK_OP.lot}</span>
                        </p>
                    </div>

                    <div className="flex gap-8 items-center">
                        <div className="text-right">
                            <p className="text-xs uppercase font-bold text-default-500 mb-1">Progresso do Turno</p>
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-3xl font-bold text-primary">{MOCK_OP.actual}</span>
                                <span className="text-sm font-mono text-default-400">/ {MOCK_OP.planned}</span>
                            </div>
                        </div>
                        <CircularProgress
                            classNames={{
                                svg: "w-16 h-16 drop-shadow-md",
                                indicator: "stroke-primary",
                                track: "stroke-white/10",
                                value: "text-lg font-bold font-mono",
                            }}
                            value={(MOCK_OP.actual / MOCK_OP.planned) * 100}
                            strokeWidth={3}
                            showValueLabel={true}
                        />
                    </div>
                </CardBody>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Main Scanning Console */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card className="glass border-none flex-1 min-h-[400px] relative overflow-hidden">
                        <div className={`absolute inset-0 opacity-10 transition-colors duration-500 ${lastScanStatus === 'success' ? 'bg-success' : lastScanStatus === 'error' ? 'bg-danger' : 'bg-transparent'
                            }`} />

                        <CardBody className="flex flex-col items-center justify-center gap-8 py-12 relative z-10">
                            <AnimatePresence mode="wait">
                                {lastScanStatus === "idle" && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                        className="text-center space-y-4"
                                    >
                                        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                            <Scan size={48} className="text-primary" />
                                        </div>
                                        <h2 className="text-3xl font-bold">Pronto para Ler</h2>
                                        <p className="text-default-400">Leia o código de barras para registrar</p>
                                    </motion.div>
                                )}
                                {lastScanStatus === "success" && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                        className="flex flex-col items-center"
                                    >
                                        <CheckCircle2 size={96} className="text-success mb-4" />
                                        <h2 className="text-4xl font-bold text-success">Leitura Aceita</h2>
                                    </motion.div>
                                )}
                                {lastScanStatus === "error" && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                        className="flex flex-col items-center"
                                    >
                                        <AlertTriangle size={96} className="text-danger mb-4" />
                                        <h2 className="text-4xl font-bold text-danger">Código Inválido</h2>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleScan} className="w-full max-w-md mt-8">
                                <Input
                                    autoFocus
                                    value={scanValue}
                                    onValueChange={setScanValue}
                                    placeholder="Entrada do leitor..."
                                    variant="faded"
                                    size="lg"
                                    classNames={{
                                        input: "text-2xl font-mono text-center tracking-wider",
                                        inputWrapper: "h-16 border-white/20 bg-black/20"
                                    }}
                                    endContent={
                                        <div className="w-2 h-2 rounded-full bg-success animate-ping" />
                                    }
                                    onBlur={(e) => e.target.focus()} // Aggressive focus keeping
                                />
                            </form>
                        </CardBody>
                    </Card>
                </div>

                {/* Side Metrics Panel */}
                <div className="flex flex-col gap-6">
                    <Card className="glass border-none">
                        <CardBody className="p-6 space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-default-500 font-bold uppercase text-xs">Tempo de Ciclo</p>
                                    <span className={`font-mono text-xl font-bold ${cycleTime > MOCK_OP.standardTime ? 'text-warning' : 'text-foreground'}`}>
                                        {cycleTime.toFixed(1)}s
                                    </span>
                                </div>
                                <Progress
                                    value={(cycleTime / MOCK_OP.standardTime) * 100}
                                    color={cycleTime > MOCK_OP.standardTime ? "warning" : "primary"}
                                    className="h-3"
                                />
                                <div className="flex justify-between mt-2 text-xs text-default-400">
                                    <span>Meta: {MOCK_OP.standardTime}s</span>
                                    <span>Médio: {MOCK_OP.avgCycleTime}s</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-default-500 text-xs uppercase mb-1">Eficiência</p>
                                    <p className="text-2xl font-bold text-success">92%</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-default-500 text-xs uppercase mb-1">Taxa de Refugo</p>
                                    <p className="text-2xl font-bold text-default-300">0.5%</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="glass border-none flex-1 bg-white/5">
                        <CardBody className="p-6">
                            <h3 className="font-bold text-default-500 uppercase text-xs mb-4">Últimos Eventos</h3>
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <span className="text-xs font-mono text-default-400">10:4{5 - i}</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                        <span className="font-medium">Leitura OK</span>
                                        <span className="ml-auto text-xs opacity-50 font-mono">#IDX-99{i}</span>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    <div className="grid grid-cols-2 gap-3">
                        <Button color="danger" variant="flat" startContent={<AlertTriangle size={18} />}>
                            Parada / Ociosidade
                        </Button>
                        <Button color="secondary" variant="flat" startContent={<RefreshCcw size={18} />}>
                            Trocar OP
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
