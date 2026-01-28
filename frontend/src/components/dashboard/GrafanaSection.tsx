"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardBody, Chip, Skeleton } from "@heroui/react";
import { RefreshCw } from "lucide-react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useGrafanaDashboards } from "@/hooks/useGrafanaDashboards";
import { GrafanaService } from "@/services/grafana.service";
import type { GrafanaDashboardPanels } from "@/types/grafana";
import { GrafanaPanelCard } from "@/components/dashboard/GrafanaPanelCard";

const RANGE_OPTIONS = [
    { key: "1h", label: "1h", from: "now-1h", to: "now" },
    { key: "24h", label: "24h", from: "now-24h", to: "now" },
    { key: "7d", label: "7d", from: "now-7d", to: "now" },
    { key: "30d", label: "30d", from: "now-30d", to: "now" },
];

export function GrafanaSection() {
    const [rangeKey, setRangeKey] = useState("24h");
    const queryClient = useQueryClient();
    const dashboardsQuery = useGrafanaDashboards();

    const range = useMemo(() => {
        return RANGE_OPTIONS.find((option) => option.key === rangeKey) ?? RANGE_OPTIONS[1];
    }, [rangeKey]);

    const dashboards = dashboardsQuery.data ?? [];

    const panelQueries = useQueries({
        queries: dashboards.map((dashboard) => ({
            queryKey: ["grafana-dashboard", dashboard.uid, range.from, range.to],
            queryFn: () => GrafanaService.getDashboardPanels(dashboard.uid, {
                from: range.from,
                to: range.to,
            }),
            enabled: dashboardsQuery.isSuccess,
        })),
    });

    const dashboardResults = dashboards.map((dashboard, index) => ({
        dashboard,
        query: panelQueries[index],
    }));

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["grafana-dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["grafana-dashboards"] });
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Dashboards Grafana</h2>
                    <p className="text-sm text-gray-500">Paineis sincronizados do Grafana</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {RANGE_OPTIONS.map((option) => (
                        <Button
                            key={option.key}
                            size="sm"
                            variant={option.key === rangeKey ? "solid" : "bordered"}
                            className={
                                option.key === rangeKey
                                    ? "bg-primary text-white"
                                    : "border-gray-200 text-gray-600"
                            }
                            onPress={() => setRangeKey(option.key)}
                        >
                            {option.label}
                        </Button>
                    ))}
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        aria-label="Atualizar Grafana"
                        onPress={handleRefresh}
                    >
                        <RefreshCw size={18} />
                    </Button>
                </div>
            </div>

            {dashboardsQuery.isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-[280px] rounded-xl" />
                    ))}
                </div>
            )}

            {dashboardsQuery.isError && (
                <Card className="card">
                    <CardBody className="text-sm text-red-600">
                        Nao foi possivel carregar os dashboards do Grafana.
                    </CardBody>
                </Card>
            )}

            {!dashboardsQuery.isLoading && dashboards.length === 0 && (
                <Card className="card">
                    <CardBody className="text-sm text-gray-500">
                        Nenhum dashboard do Grafana disponivel para este usuario.
                    </CardBody>
                </Card>
            )}

            {dashboardResults.map(({ dashboard, query }) => {
                const data = query.data as GrafanaDashboardPanels | undefined;

                return (
                    <div key={dashboard.uid} className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">{dashboard.title}</h3>
                                {dashboard.folderTitle && (
                                    <p className="text-xs text-gray-500">{dashboard.folderTitle}</p>
                                )}
                            </div>
                            {query.isFetching && (
                                <Chip size="sm" variant="flat" className="text-xs">
                                    Atualizando
                                </Chip>
                            )}
                        </div>

                        {query.isLoading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} className="h-[280px] rounded-xl" />
                                ))}
                            </div>
                        )}

                        {query.isError && (
                            <Card className="card">
                                <CardBody className="text-sm text-red-600">
                                    Falha ao carregar os paineis deste dashboard.
                                </CardBody>
                            </Card>
                        )}

                        {data?.panels?.length ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {data.panels.map((panel) => (
                                    <GrafanaPanelCard key={panel.id} panel={panel} />
                                ))}
                            </div>
                        ) : (
                            !query.isLoading && !query.isError && (
                                <Card className="card">
                                    <CardBody className="text-sm text-gray-500">
                                        Sem paineis disponiveis para este dashboard.
                                    </CardBody>
                                </Card>
                            )
                        )}
                    </div>
                );
            })}
        </section>
    );
}
