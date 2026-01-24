import { useQuery } from "@tanstack/react-query";
import { mesApi } from "@/lib/api";

interface UseOEEParams {
    workcenterId?: string;
    date?: string;
    days?: number;
}

export const useOEE = (params: UseOEEParams = {}) => {
    return useQuery({
        queryKey: ["oee", params],
        queryFn: () => mesApi.getOEE(params),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};

export default useOEE;
