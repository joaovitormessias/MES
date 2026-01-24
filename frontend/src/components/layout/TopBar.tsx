"use client";

import { useState } from "react";
import { Button, Avatar, Badge } from "@heroui/react";
import { Search, Bell, Calendar, Filter, ChevronDown, Download } from "lucide-react";

interface TopBarProps {
    title?: string;
    showDateFilter?: boolean;
    showExport?: boolean;
}

export function TopBar({ title = "Painel", showDateFilter = true, showExport = false }: TopBarProps) {
    const [searchValue, setSearchValue] = useState("");

    return (
        <header className="app-topbar w-full gap-4">
            {/* Busca */}
            <div className="flex-1 max-w-md">
                <div className="relative group">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder={`Buscar em ${title.toLowerCase()}...`}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        aria-label={`Buscar em ${title}`}
                        className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-primary/20 rounded-xl pl-10 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-400">
                            <span className="text-xs">⌘</span>F
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Controles do Lado Direito */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                {/* Controles apenas Desktop */}
                <div className="hidden lg:flex items-center gap-2">
                    {showDateFilter && (
                        <>
                            <Button
                                variant="bordered"
                                size="sm"
                                startContent={<Calendar size={16} />}
                                endContent={<ChevronDown size={14} />}
                                className="h-9 rounded-lg bg-white border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                            >
                                16 jan - 22 jan
                            </Button>
                            <Button
                                variant="bordered"
                                size="sm"
                                endContent={<ChevronDown size={14} />}
                                className="h-9 rounded-lg bg-white border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                            >
                                Diário
                            </Button>
                        </>
                    )}

                    <Button
                        variant="bordered"
                        size="sm"
                        startContent={<Filter size={16} />}
                        className="h-9 rounded-lg bg-white border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                    >
                        Filtrar
                    </Button>

                    {showExport && (
                        <Button
                            variant="flat"
                            size="sm"
                            startContent={<Download size={16} />}
                            className="h-9 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20"
                        >
                            Exportar
                        </Button>
                    )}
                </div>

                {/* Divisor */}
                <div className="hidden lg:block w-px h-6 bg-gray-200 mx-1" />

                {/* Notificações - Área Refinada */}
                <div className="relative flex items-center justify-center w-9 h-9">
                    <Badge
                        content="3"
                        color="danger"
                        size="sm"
                        shape="circle"
                        showOutline={false}
                        className="border-[1.5px] border-white shadow-sm font-bold text-[10px]"
                    >
                        <Button
                            isIconOnly
                            variant="light"
                            radius="full"
                            size="md"
                            aria-label="Notificações"
                            className="h-9 w-9 bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <Bell size={20} />
                        </Button>
                    </Badge>
                </div>

                {/* Avatar do Usuário */}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200 lg:border-none lg:pl-0">
                    <Avatar
                        name="João Silva"
                        size="sm"
                        isBordered
                        color="primary"
                        className="cursor-pointer transition-transform hover:scale-105"
                    />
                    <div className="hidden md:block leading-tight min-w-[110px]">
                        <p className="text-xs font-bold text-gray-900">João Silva</p>
                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Operador</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default TopBar;
