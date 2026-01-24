"use client";

import { Button, Input, Card, CardBody, CardHeader, Image } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [badge, setBadge] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            localStorage.setItem("mes_token", "dummy_token");
            router.push("/ops");
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background bg-industrial flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md glass border-none">
                    <CardHeader className="flex flex-col gap-2 items-center pt-8">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2">
                            <Image
                                src="/logo.png"
                                alt="RENAR Logo"
                                width={48}
                                height={48}
                                className="brightness-0 invert"
                            />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">RENAR MES</h1>
                        <p className="text-default-500 text-small">Sistema de Execução de Manufatura</p>
                    </CardHeader>
                    <CardBody className="pb-8">
                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <Input
                                label="Crachá do Operador"
                                placeholder="Digite o número do crachá"
                                variant="bordered"
                                startContent={<User className="text-default-400" size={18} />}
                                value={badge}
                                onValueChange={setBadge}
                                isRequired
                            />
                            <Input
                                label="Senha"
                                placeholder="Digite sua senha"
                                type="password"
                                variant="bordered"
                                startContent={<Lock className="text-default-400" size={18} />}
                                value={password}
                                onValueChange={setPassword}
                                isRequired
                            />
                            <div className="flex flex-col gap-2">
                                <Button
                                    color="primary"
                                    type="submit"
                                    size="lg"
                                    isLoading={isLoading}
                                    className="font-semibold"
                                >
                                    Autorizar Acesso
                                </Button>
                                <Button variant="light" size="sm" className="text-default-400">
                                    Esqueceu a senha?
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Footer Branding */}
            <div className="fixed bottom-8 text-center text-default-400 text-xs">
                <p>&copy; 2026 RENAR Industrial Group. Todos os direitos reservados.</p>
                <p className="mt-1 opacity-50 font-mono">v1.0.0-PROD</p>
            </div>
        </div>
    );
}
