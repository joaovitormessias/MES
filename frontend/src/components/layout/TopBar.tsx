"use client";

import { useState } from "react";
import { Avatar, Badge, Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { Search, Bell, Calendar, Filter, ChevronDown, Download } from "lucide-react";
import * as motion from "motion/react-client";
import { TopBarFilters } from "@/components/layout/TopBarFilters";
import { useTopBarFilters } from "@/components/layout/TopBarFilterContext";

interface TopBarProps {
    title?: string;
    showDateFilter?: boolean;
    showExport?: boolean;
}

export function TopBar({ title = "Painel", showDateFilter = true, showExport = false }: TopBarProps) {
    const [fallbackSearchValue, setFallbackSearchValue] = useState("");
    const { config, values, setFilterValue, resetFilters, hasActiveFilters } = useTopBarFilters();
    const searchField = config?.fields.find((field) => field.type === "search");
    const filterFields = config?.fields.filter((field) => field.type !== "search") ?? [];
    const showFilterControls = filterFields.length > 0;
    const searchValue = searchField ? values[searchField.key] ?? "" : fallbackSearchValue;
    const searchTarget = config?.title ?? title;
    const searchPlaceholder =
        searchField?.placeholder ?? `Buscar em ${searchTarget.toLowerCase()}...`;
    const notificationCount = 3;
    const hasNotifications = notificationCount > 0;

    const handleSearchChange = (nextValue: string) => {
        if (searchField) {
            setFilterValue(searchField.key, nextValue);
            return;
        }

        setFallbackSearchValue(nextValue);
    };

    return (
        <header className="app-topbar w-full gap-4">
            {/* Busca */}
            <div className="flex-1 max-w-md">
                <div className="relative group">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        aria-label={`Buscar em ${searchTarget}`}
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

                    {showFilterControls && (
                        <Popover placement="bottom-end">
                            <PopoverTrigger>
                                <Badge
                                    isDot
                                    color="primary"
                                    placement="top-right"
                                    showOutline
                                    isInvisible={!hasActiveFilters}
                                    classNames={{ badge: "border-2 border-white" }}
                                >
                                    <Button
                                        variant="bordered"
                                        size="sm"
                                        startContent={<Filter size={16} />}
                                        className={`h-9 rounded-lg border-gray-200 font-medium hover:bg-gray-50 ${
                                            hasActiveFilters
                                                ? "bg-primary/10 text-primary border-primary/20"
                                                : "bg-white text-gray-600"
                                        }`}
                                    >
                                        Filtrar
                                    </Button>
                                </Badge>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 border border-gray-200 shadow-xl">
                                <TopBarFilters
                                    title={config?.title ? `Filtros de ${config.title}` : undefined}
                                    fields={filterFields}
                                    values={values}
                                    onChange={setFilterValue}
                                    onReset={resetFilters}
                                />
                            </PopoverContent>
                        </Popover>
                    )}

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
                <div className="relative flex items-center justify-center h-12 w-12">
                    <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.12 }}>
                        <Badge
                            isDot
                            color="danger"
                            size="sm"
                            placement="top-right"
                            showOutline
                            isInvisible={!hasNotifications}
                            classNames={{ badge: "border-2 border-white" }}
                        >
                            <Button
                                isIconOnly
                                variant="light"
                                radius="full"
                                size="md"
                                aria-label="Notifications"
                                className={[
                                    "relative h-12 w-12 min-w-12 p-0 grid place-items-center",
                                    "!bg-transparent hover:!bg-transparent data-[hovered=true]:!bg-transparent",
                                    "text-gray-500 hover:text-gray-900 transition-colors",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                    "before:content-[''] before:absolute before:inset-2 before:rounded-full",
                                    "before:shadow-lg before:opacity-0 before:scale-95 before:transition before:duration-150",
                                    "hover:before:opacity-100 hover:before:scale-100",
                                ].join(" ")}
                            >
                                <Bell className="relative z-10 h-5 w-5" />
                            </Button>
                        </Badge>
                    </motion.div>
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
