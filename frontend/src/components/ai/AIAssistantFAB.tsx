"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, Loader2 } from "lucide-react";
import { Button, Textarea } from "@heroui/react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface AIAssistantFABProps {
    className?: string;
}

export function AIAssistantFAB({ className }: AIAssistantFABProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Olá! Sou o assistente AI do sistema MES. Como posso ajudar você hoje?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
        }
        if (e.key === "Escape" && isOpen) {
            setIsOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Call the MES AI API
            const token = localStorage.getItem("mes_token") || "";
            const response = await fetch("http://localhost:3050/api/v1/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    device: "serra_01",
                }),
            });

            let answer = "Desculpe, não consegui processar sua solicitação.";

            if (response.ok) {
                const data = await response.json();
                answer = data.answer || answer;
            } else if (response.status === 401) {
                answer = "Sessão expirada. Por favor, faça login novamente.";
            }

            const aiResponse: Message = {
                id: `ai-${Date.now()}`,
                role: "assistant",
                content: answer,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
        } catch (error) {
            console.error("AI API Error:", error);
            const errorMessage: Message = {
                id: `ai-${Date.now()}`,
                role: "assistant",
                content: "Erro de conexão com o servidor. Verifique se o backend está rodando.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl 
                           bg-gradient-to-br from-lime-400 to-emerald-600
                           shadow-[0_0_30px_rgba(173,255,47,0.4)]
                           flex items-center justify-center
                           hover:shadow-[0_0_50px_rgba(173,255,47,0.6)]
                           transition-shadow duration-300 ${className}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: isOpen ? 0 : 1,
                    opacity: isOpen ? 0 : 1,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Abrir assistente AI (Cmd+K)"
            >
                <Sparkles className="w-6 h-6 text-gray-900" />

                {/* Pulse Effect */}
                <motion.span
                    className="absolute inset-0 rounded-2xl bg-lime-400/50"
                    animate={{
                        scale: [1, 1.5, 1.5],
                        opacity: [0.5, 0, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                    }}
                />
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed bottom-6 right-6 z-50 w-96 h-[500px] 
                                   bg-gray-900 rounded-2xl overflow-hidden
                                   border border-lime-500/30
                                   shadow-[0_0_40px_rgba(173,255,47,0.2)]
                                   flex flex-col"
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 
                                        bg-gradient-to-r from-lime-500/20 to-emerald-500/20
                                        border-b border-lime-500/20">
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-lime-400" />
                                <span className="font-semibold text-white">MES Assistant</span>
                                <span className="text-xs text-lime-400/70 bg-lime-400/10 px-2 py-0.5 rounded-full">
                                    AI
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="Fechar"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm
                                            ${message.role === "user"
                                                ? "bg-lime-500 text-gray-900 rounded-tr-sm"
                                                : "bg-gray-800 text-gray-200 rounded-tl-sm"
                                            }`}
                                    >
                                        {message.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    className="flex justify-start"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="bg-gray-800 px-4 py-2 rounded-2xl rounded-tl-sm">
                                        <Loader2 className="w-4 h-4 text-lime-400 animate-spin" />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-gray-800">
                            <div className="flex items-end gap-2">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Pergunte sobre OEE, produção, qualidade..."
                                    minRows={1}
                                    maxRows={3}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    classNames={{
                                        base: "flex-1",
                                        input: "bg-gray-800 text-white placeholder:text-gray-500",
                                        inputWrapper: "bg-gray-800 border-gray-700 hover:bg-gray-750 focus-within:bg-gray-800",
                                    }}
                                />
                                <Button
                                    isIconOnly
                                    onClick={sendMessage}
                                    isDisabled={!input.trim() || isLoading}
                                    className="bg-lime-500 text-gray-900 hover:bg-lime-400 
                                               disabled:bg-gray-700 disabled:text-gray-500"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-2 text-center">
                                ⌘K para abrir • Esc para fechar
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default AIAssistantFAB;
