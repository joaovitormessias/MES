export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface OEESnapshot {
    id: string
    workcenterId: string
    date: string // ISO Date string
    shiftNumber: number
    availability: number
    performance: number
    quality: number
    oee: number
    plannedTime: number
    downtime: number
    operatingTime: number
    idealCycleTime: number
    totalPieces: number
    goodPieces: number
    createdAt: string
}

export interface Workcenter {
    id: string
    code: string
    name: string
    type: WorkcenterType
    isEnabled: boolean
    capacity: number | null
    createdAt: string
    updatedAt: string
}

export enum WorkcenterType {
    OPTIMIZER = 'OPTIMIZER',
    PRE_CUT = 'PRE_CUT',
    CNC = 'CNC',
    FINISHING = 'FINISHING',
    ASSEMBLY = 'ASSEMBLY',
    PAINTING = 'PAINTING',
    PACKAGING = 'PACKAGING',
    PRESS = 'PRESS',
    CALIBRATOR = 'CALIBRATOR',
    BRUSH = 'BRUSH',
}

export interface ProductionOrder {
    id: string
    erpOrderCode: string
    type: OrderType
    status: OrderStatus
    itemId: string
    plannedQty: number
    executedGoodQty: number
    executedTotalQty: number
    dueDate: string
    priority: number
    createdAt: string
    updatedAt: string
}

export enum OrderType {
    PRODUCTION = 'PRODUCTION',
    REPLENISHMENT = 'REPLENISHMENT',
}

export enum OrderStatus {
    OPEN_NOT_STARTED = 'OPEN_NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    OPEN_PARTIAL = 'OPEN_PARTIAL',
    CLOSED = 'CLOSED',
}

export interface DashboardMetrics {
    totalPiecesToday: number
    totalValueToday: number // derived or fetched
    avgOee: number
    oeeTrend: { day: string; value: number }[]
    productionByRegion: { month: string; value: number; region: string }[]
    processDistribution: { type: string; value: number }[]
}
