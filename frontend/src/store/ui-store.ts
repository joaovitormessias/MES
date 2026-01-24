import { create } from "zustand";

interface UIStore {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    // Real-time status
    isConnected: boolean;
    setIsConnected: (connected: boolean) => void;

    // Scans in progress
    pendingScans: number;
    incrementPendingScans: () => void;
    decrementPendingScans: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    isConnected: false,
    setIsConnected: (connected) => set({ isConnected: connected }),

    pendingScans: 0,
    incrementPendingScans: () => set((state) => ({ pendingScans: state.pendingScans + 1 })),
    decrementPendingScans: () => set((state) => ({ pendingScans: Math.max(0, state.pendingScans - 1) })),
}));
