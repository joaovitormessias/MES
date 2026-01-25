"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
import type { TopBarFilterField } from "@/components/layout/TopBarFilterContext";

interface TopBarFiltersProps {
    title?: string;
    fields: TopBarFilterField[];
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
    onReset: () => void;
}

export function TopBarFilters({ title, fields, values, onChange, onReset }: TopBarFiltersProps) {
    return (
        <div className="w-72 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-gray-900">Filtros</p>
                    {title && <p className="text-xs text-gray-500">{title}</p>}
                </div>
                <Button
                    size="sm"
                    variant="light"
                    className="text-gray-500 font-semibold"
                    onPress={onReset}
                >
                    Limpar
                </Button>
            </div>

            <div className="space-y-3">
                {fields.map((field) => {
                    const value = values[field.key] ?? field.defaultValue ?? "";

                    if (field.type === "select") {
                        return (
                            <Select
                                key={field.key}
                                label={field.label}
                                placeholder={field.placeholder}
                                size="sm"
                                variant="bordered"
                                selectedKeys={value ? [value] : []}
                                onChange={(event) => onChange(field.key, event.target.value)}
                                className="w-full"
                            >
                                {(field.options ?? []).map((option) => (
                                    <SelectItem key={option.value}>{option.label}</SelectItem>
                                ))}
                            </Select>
                        );
                    }

                    return (
                        <Input
                            key={field.key}
                            label={field.label}
                            placeholder={field.placeholder}
                            size="sm"
                            variant="bordered"
                            value={value}
                            onValueChange={(nextValue) => onChange(field.key, nextValue)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default TopBarFilters;
