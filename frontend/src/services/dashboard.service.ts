import { supabase } from "@/lib/supabase";
import { DashboardMetrics, Workcenter } from "@/types/database";
import { startOfDay, subDays, format } from "date-fns";

export const DashboardService = {
    async getDailyMetrics(): Promise<DashboardMetrics> {
        const today = startOfDay(new Date()).toISOString();

        // 1. Fetch OEE Snapshots for today to get average OEE
        const { data: oeeData, error: oeeError } = await supabase
            .from('oee_snapshots')
            .select('oee, goodPieces')
            .gte('date', today);

        if (oeeError) throw new Error(oeeError.message);

        // Calculate Avg OEE
        const avgOee = oeeData?.length
            ? oeeData.reduce((acc, curr) => acc + curr.oee, 0) / oeeData.length
            : 0;

        // Calculate Total Pieces (from snapshots is faster for aggregation if available)
        const totalPiecesToday = oeeData?.reduce((acc, curr) => acc + curr.goodPieces, 0) || 0;

        // 2. Fetch OEE Trend (Last 7 days)
        const sevenDaysAgo = subDays(new Date(), 7).toISOString();
        const { data: trendData } = await supabase
            .from('oee_snapshots')
            .select('date, oee')
            .gte('date', sevenDaysAgo)
            .order('date', { ascending: true });

        // Aggregate by day
        interface TrendItem {
            day: string;
            value: number;
        }

        const oeeTrend = (trendData || []).reduce((acc: TrendItem[], curr) => {
            const day = format(new Date(curr.date), 'EEE');
            const existing = acc.find(item => item.day === day);
            if (existing) {
                existing.value = (existing.value + curr.oee) / 2; // Simple avg for multiple shifts
            } else {
                acc.push({ day, value: curr.oee });
            }
            return acc;
        }, []);

        // 3. Process Distribution (Mocked for now as it requires complex join/group by not easily done in simple client query without views)
        // In a real scenario, this would be a View or Edge Function
        const processDistribution = [
            { type: "CNC", value: 374.82 },
            { type: "Montagem", value: 241.60 },
            { type: "Pintura", value: 213.42 },
        ];

        // 4. Region/Production Data (Mocked for now)
        const productionByRegion = [
            { month: "Out", value: 2988.20, region: "CNC" },
            { month: "Out", value: 1200, region: "Montagem" },
            { month: "Out", value: 800, region: "Pintura" },
            { month: "Nov", value: 1765.09, region: "CNC" },
            { month: "Nov", value: 1400, region: "Montagem" },
            { month: "Nov", value: 600, region: "Pintura" },
            { month: "Dez", value: 4005.65, region: "CNC" },
            { month: "Dez", value: 2000, region: "Montagem" },
            { month: "Dez", value: 1200, region: "Pintura" },
        ];

        return {
            totalPiecesToday,
            totalValueToday: 9257.51, // Placeholder as we don't have pricing in schema
            avgOee: avgOee || 86.5, // Fallback to avoid empty UI
            oeeTrend: oeeTrend.length ? oeeTrend : [
                { day: "Dom", value: 72 },
                { day: "Seg", value: 78 },
                { day: "Ter", value: 85 },
                { day: "Qua", value: 82 },
                { day: "Qui", value: 79 },
                { day: "Sex", value: 88 },
                { day: "Sáb", value: 75 },
            ],
            productionByRegion,
            processDistribution
        };
    },

    async getWorkcenterStatus(): Promise<Workcenter[]> {
        const { data, error } = await supabase
            .from('workcenters')
            .select('*')
            .order('code');

        if (error) throw new Error(error.message);
        return data as Workcenter[];
    }
};
