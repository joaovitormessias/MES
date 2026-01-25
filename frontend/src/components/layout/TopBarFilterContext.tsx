"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type TopBarFilterOption = {
    label: string;
    value: string;
};

export type TopBarFilterField = {
    key: string;
    label: string;
    type: "search" | "select";
    placeholder?: string;
    options?: TopBarFilterOption[];
    defaultValue?: string;
};

export type TopBarFilterConfig = {
    title?: string;
    fields: TopBarFilterField[];
};

type TopBarFilterContextValue = {
    config: TopBarFilterConfig | null;
    values: Record<string, string>;
    setFilterValue: (key: string, value: string) => void;
    resetFilters: () => void;
    registerFilters: (config: TopBarFilterConfig) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
};

const TopBarFilterContext = createContext<TopBarFilterContextValue | null>(null);

const buildDefaults = (config: TopBarFilterConfig | null) => {
    if (!config) {
        return {} as Record<string, string>;
    }

    return config.fields.reduce<Record<string, string>>((acc, field) => {
        acc[field.key] = field.defaultValue ?? "";
        return acc;
    }, {});
};

export function TopBarFilterProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<TopBarFilterConfig | null>(null);
    const [values, setValues] = useState<Record<string, string>>({});

    const registerFilters = useCallback((nextConfig: TopBarFilterConfig) => {
        setConfig(nextConfig);
        setValues((prev) => {
            const defaults = buildDefaults(nextConfig);
            return nextConfig.fields.reduce<Record<string, string>>((acc, field) => {
                if (prev[field.key] !== undefined) {
                    acc[field.key] = prev[field.key];
                } else {
                    acc[field.key] = defaults[field.key] ?? "";
                }
                return acc;
            }, {});
        });
    }, []);

    const clearFilters = useCallback(() => {
        setConfig(null);
        setValues({});
    }, []);

    const setFilterValue = useCallback((key: string, value: string) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setValues(buildDefaults(config));
    }, [config]);

    const hasActiveFilters = useMemo(() => {
        if (!config) {
            return false;
        }

        const defaults = buildDefaults(config);
        return config.fields.some((field) => {
            const currentValue = values[field.key] ?? "";
            const defaultValue = defaults[field.key] ?? "";
            return currentValue !== "" && currentValue !== defaultValue;
        });
    }, [config, values]);

    const contextValue = useMemo(
        () => ({
            config,
            values,
            setFilterValue,
            resetFilters,
            registerFilters,
            clearFilters,
            hasActiveFilters,
        }),
        [
            config,
            values,
            setFilterValue,
            resetFilters,
            registerFilters,
            clearFilters,
            hasActiveFilters,
        ]
    );

    return (
        <TopBarFilterContext.Provider value={contextValue}>
            {children}
        </TopBarFilterContext.Provider>
    );
}

export function useTopBarFilters() {
    const context = useContext(TopBarFilterContext);
    if (!context) {
        throw new Error("useTopBarFilters must be used within TopBarFilterProvider");
    }

    return context;
}
