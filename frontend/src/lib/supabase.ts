import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        "Supabase environment variables not set. Using placeholder values for development."
    );
}

export const supabase = createClient(
    supabaseUrl ?? "https://placeholder.supabase.co",
    supabaseAnonKey ?? "placeholder-key",
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    }
);

/**
 * Helper function to call Edge Functions
 */
export async function callEdgeFunction<T = unknown>(
    functionName: string,
    options?: {
        method?: "GET" | "POST" | "PUT" | "DELETE";
        body?: Record<string, unknown>;
        params?: Record<string, string>;
    }
): Promise<{ data: T | null; error: Error | null }> {
    try {
        const { method = "GET", body, params } = options ?? {};

        let url = `${supabaseUrl}/functions/v1/${functionName}`;
        if (params) {
            const searchParams = new URLSearchParams(params);
            url += `?${searchParams.toString()}`;
        }

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseAnonKey}`,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error ?? `HTTP ${response.status}`);
        }

        const data = await response.json();
        return { data: data as T, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Subscribe to real-time changes on a table
 */
export function subscribeToTable(
    table: string,
    callback: (payload: unknown) => void,
    filter?: { column: string; value: string }
) {
    const channel = supabase.channel(`public:${table}`);

    const subscription = channel.on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table,
            ...(filter && { filter: `${filter.column}=eq.${filter.value}` }),
        },
        callback
    );

    subscription.subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
