"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Workcenter } from "@/types/database";

interface WorkcenterStatusTableProps {
    workcenters: Workcenter[];
}

export function WorkcenterStatusTable({ workcenters }: WorkcenterStatusTableProps) {
    const getTypeLabel = (type: string) => {
        switch (type) {
            case "OPTIMIZER":
                return "Otimizadora";
            case "PRE_CUT":
                return "Pré-Corte";
            case "CNC":
                return "CNC";
            case "FINISHING":
                return "Acabamento";
            case "ASSEMBLY":
                return "Montagem";
            case "PAINTING":
                return "Pintura";
            case "PACKAGING":
                return "Embalagem";
            case "PRESS":
                return "Prensa";
            case "CALIBRATOR":
                return "Calibradora";
            case "BRUSH":
                return "Escovação";
            default:
                return type.replace(/_/g, " ").toLowerCase();
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="data-table">
                <thead>
                    <tr>
                        <th className="text-left py-3 px-4">Centro de Trabalho</th>
                        <th className="text-left py-3 px-4">Tipo</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Capacidade</th>
                    </tr>
                </thead>
                <tbody>
                    {workcenters.map((wc) => (
                        <tr key={wc.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-4">
                                <span className="font-medium text-gray-900">{wc.name}</span>
                                <div className="text-xs text-gray-500 font-mono">{wc.code}</div>
                            </td>
                            <td className="py-3 px-4">
                                <span className="text-sm text-gray-500 capitalize">
                                    {getTypeLabel(wc.type)}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    {wc.isEnabled ? (
                                        <>
                                            <CheckCircle2 size={16} className="text-green-500" />
                                            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                                Ativo
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={16} className="text-gray-400" />
                                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                                Inativo
                                            </span>
                                        </>
                                    )}
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <span className="font-mono text-sm text-gray-600">
                                    {wc.capacity ? `${wc.capacity} un.` : '-'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default WorkcenterStatusTable;
