import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.service";

export const useDashboardMetrics = () => {
    return useQuery({
        queryKey: ["dashboard-metrics"],
        queryFn: DashboardService.getDailyMetrics,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });
};

export const useWorkcenterStatus = () => {
    return useQuery({
        queryKey: ["workcenter-status"],
        queryFn: DashboardService.getWorkcenterStatus,
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: true,
    });
};
