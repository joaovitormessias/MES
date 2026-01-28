import { useQuery } from "@tanstack/react-query";
import { GrafanaService } from "@/services/grafana.service";

export const useGrafanaDashboards = () => {
    return useQuery({
        queryKey: ["grafana-dashboards"],
        queryFn: GrafanaService.listDashboards,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};
