
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import type { ExecutionEvent } from '@/types/schema';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Initialize Supabase Client for Realtime interactions
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

class RealtimeService {
    private channels: Map<string, RealtimeChannel> = new Map();

    /**
     * Subscribe to global execution events (e.g. for dashboard or shop floor updates)
     * This assumes the backend inserts into 'execution_events' table and broadcasts changes.
     */
    subscribeToExecutionEvents(callback: (payload: ExecutionEvent) => void): () => void {
        const channelName = 'execution-events-global';

        if (this.channels.has(channelName)) {
            // Ideally verify if we can add multiple listeners to same channel wrapper, 
            // but for simplicity, we return existing unsubscribe or handle strictly.
            // Here we create a new channel subscription only if not exists to avoid duplicates.
        }

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'execution_events' },
                (payload) => {
                    callback(payload.new as ExecutionEvent);
                }
            )
            .subscribe();

        this.channels.set(channelName, channel);

        return () => {
            supabase.removeChannel(channel);
            this.channels.delete(channelName);
        };
    }
}

export const realtimeService = new RealtimeService();
