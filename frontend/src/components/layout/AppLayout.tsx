"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { TopBarFilterProvider } from "@/components/layout/TopBarFilterContext";
import { AIAssistantFAB } from "@/components/ai/AIAssistantFAB";
import { usePathname } from "next/navigation";

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const pathname = usePathname();

    // Don't show layout on login page
    if (pathname === "/login") {
        return <>{children}</>;
    }

    return (
        <div className="app-layout">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <main className="app-main">
                <TopBarFilterProvider>
                    <TopBar showDateFilter={pathname.includes("dashboard")} showExport={pathname.includes("dashboard")} />
                    <div className="app-content">
                        {children}
                    </div>
                </TopBarFilterProvider>
            </main>

            {/* AI Assistant Floating Action Button */}
            <AIAssistantFAB />
        </div>
    );
}

export default AppLayout;

