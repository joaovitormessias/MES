"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as motion from "motion/react-client";
import {
    LayoutDashboard,
    FileText,
    Scan,
    MessageSquare,
    Package,
    FileSearch,
    BarChart3,
    Gauge,
    Settings,
    ChevronLeft,
    Factory,
    Users,
    Box,
    Wifi,
    AlertTriangle,
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string | number;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const navigation: NavSection[] = [
    {
        title: "GERAL",
        items: [
            { label: "Painel de Controle", href: "/dashboards", icon: <LayoutDashboard size={20} /> },
            { label: "Ordens de Produção", href: "/ops", icon: <FileText size={20} /> },
            { label: "Execução", href: "/execution", icon: <Scan size={20} /> },
            { label: "Alertas", href: "/alerts", icon: <MessageSquare size={20} />, badge: 3 },
        ],
    },
    {
        title: "FERRAMENTAS",
        items: [
            { label: "Itens e BOM", href: "/items", icon: <Package size={20} /> },
            { label: "Rastreabilidade", href: "/traceability", icon: <FileSearch size={20} /> },
            { label: "Qualidade", href: "/quality", icon: <BarChart3 size={20} /> },
            { label: "Análise de OEE", href: "/oee", icon: <Gauge size={20} /> },
        ],
    },
    {
        title: "DIGITAL TWIN",
        items: [
            { label: "Visão Geral", href: "/digital-twin", icon: <Box size={20} /> },
            { label: "Dispositivos IoT", href: "/digital-twin/devices", icon: <Wifi size={20} /> },
            { label: "Alertas IoT", href: "/digital-twin/alerts", icon: <AlertTriangle size={20} /> },
        ],
    },
    {
        title: "SUPORTE",
        items: [
            { label: "Configurações", href: "/settings", icon: <Settings size={20} /> },
        ],
    },
];

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={`app-sidebar ${collapsed ? "collapsed" : ""}`}>
            {/* Cabeçalho */}
            <div className="sidebar-header">
                <motion.div
                    className="sidebar-logo"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Factory size={28} className="text-primary" />
                </motion.div>
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="sidebar-brand"
                    >
                        RENAR MES
                    </motion.span>
                )}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className="ml-auto p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                    >
                        <ChevronLeft
                            size={18}
                            className={`text-gray-400 transition-transform ${collapsed ? "rotate-180" : ""}`}
                        />
                    </button>
                )}
            </div>

            {/* Seções de Navegação */}
            <nav className="flex-1 overflow-y-auto py-4">
                {navigation.map((section, sectionIndex) => (
                    <div key={section.title} className="sidebar-section">
                        {!collapsed && (
                            <p className="sidebar-section-title">{section.title}</p>
                        )}
                        <div className="sidebar-nav">
                            {section.items.map((item, itemIndex) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                return (
                                    <motion.div
                                        key={item.href}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.2,
                                            delay: sectionIndex * 0.1 + itemIndex * 0.03
                                        }}
                                    >
                                        <Link
                                            href={item.href}
                                            className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                                            title={collapsed ? item.label : undefined}
                                        >
                                            <span className="sidebar-nav-icon">{item.icon}</span>
                                            {!collapsed && (
                                                <>
                                                    <span>{item.label}</span>
                                                    {item.badge && (
                                                        <span className="sidebar-nav-badge">{item.badge}</span>
                                                    )}
                                                </>
                                            )}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Rodapé - Seletor de Turno */}
            <div className="sidebar-footer">
                <motion.div
                    className="sidebar-team"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="sidebar-team-avatar">
                        <Users size={18} />
                    </div>
                    {!collapsed && (
                        <div className="sidebar-team-info">
                            <p className="sidebar-team-label">Turno</p>
                            <p className="sidebar-team-name">Manhã - Equipe A</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </aside>
    );
}

export default Sidebar;
