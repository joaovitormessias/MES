import prisma from '../../utils/prisma';
import { logInfo, logError } from '../../utils/logger';
// unused imports removed
import {
    oeeGauge,
    availabilityGauge,
    performanceGauge,
    qualityGauge,
} from '../../utils/metrics';

export interface OEECalculationInput {
    workcenterId: string;
    date: Date;
    shiftNumber: number;
}

export interface OEEResult {
    availability: number;
    performance: number;
    quality: number;
    oee: number;
    details: {
        plannedTime: number; // minutes
        downtime: number; // minutes
        operatingTime: number; // minutes
        idealCycleTime: number; // minutes
        totalPieces: number;
        goodPieces: number;
    };
}

export class OEEService {
    /**
     * Calculate OEE for a workcenter, date, and shift
     * OEE = Availability × Performance × Quality
     */
    async calculateOEE(input: OEECalculationInput): Promise<OEEResult> {
        try {
            const { workcenterId, date, shiftNumber } = input;

            // Get shift schedule
            const dayOfWeek = date.getDay();
            const shiftSchedule = await prisma.shiftSchedule.findUnique({
                where: {
                    workcenterId_dayOfWeek_shiftNumber: {
                        workcenterId,
                        dayOfWeek,
                        shiftNumber,
                    },
                },
            });

            if (!shiftSchedule || !shiftSchedule.isActive) {
                throw new Error('No active shift schedule found');
            }

            // Calculate planned time (in minutes)
            const [startHour, startMin] = shiftSchedule.startTime.split(':').map(Number);
            const [endHour, endMin] = shiftSchedule.endTime.split(':').map(Number);
            const plannedTime = (endHour * 60 + endMin) - (startHour * 60 + startMin);

            // Get downtime for this shift
            const shiftStart = new Date(date);
            shiftStart.setHours(startHour, startMin, 0, 0);
            const shiftEnd = new Date(date);
            shiftEnd.setHours(endHour, endMin, 0, 0);

            const downtimeEvents = await prisma.downtimeEvent.findMany({
                where: {
                    workcenterId,
                    startTs: {
                        gte: shiftStart,
                        lte: shiftEnd,
                    },
                },
            });

            const totalDowntime = downtimeEvents.reduce((sum: number, event: any) => {
                const start = event.startTs;
                const end = event.endTs || new Date();
                const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
                return sum + duration;
            }, 0);

            // AVAILABILITY = (Planned Time - Downtime) / Planned Time
            const operatingTime = plannedTime - totalDowntime;
            const availability = operatingTime / plannedTime;

            // Get production data for this shift
            const executions = await prisma.processExecution.findMany({
                where: {
                    workcenterId,
                    startedAt: {
                        gte: shiftStart,
                        lte: shiftEnd,
                    },
                },
                include: {
                    processStep: true,
                    productionOrder: {
                        include: {
                            item: true,
                        },
                    },
                },
            });

            const totalPieces = executions.reduce((sum: number, exec: any) => sum + exec.executedQty, 0);
            const goodPieces = executions.reduce((sum: number, exec: any) => sum + exec.goodQty, 0);

            // Get ideal cycle time (weighted average based on items produced)
            let idealCycleTime = 0;
            if (totalPieces > 0) {
                const totalIdealTime = executions.reduce((sum: number, exec: any) => {
                    const cycleTime = exec.productionOrder.item.standardCycleTime || 1;
                    return sum + (cycleTime * exec.executedQty);
                }, 0);
                idealCycleTime = totalIdealTime / totalPieces;
            }

            // PERFORMANCE = (Total Pieces × Ideal Cycle Time) / Operating Time
            const performance = operatingTime > 0
                ? (totalPieces * idealCycleTime) / operatingTime
                : 0;

            // QUALITY = Good Pieces / Total Pieces
            const quality = totalPieces > 0 ? goodPieces / totalPieces : 0;

            // OEE = A × P × Q
            const oee = availability * performance * quality;

            const result: OEEResult = {
                availability,
                performance,
                quality,
                oee,
                details: {
                    plannedTime,
                    downtime: totalDowntime,
                    operatingTime,
                    idealCycleTime,
                    totalPieces,
                    goodPieces,
                },
            };

            logInfo('OEE calculated', {
                workcenterId,
                date: date.toISOString(),
                shiftNumber,
                oee: (oee * 100).toFixed(2) + '%',
            });

            // Update metrics
            oeeGauge.set({ workcenter: workcenterId, shift: shiftNumber.toString() }, oee);
            availabilityGauge.set({ workcenter: workcenterId, shift: shiftNumber.toString() }, availability);
            performanceGauge.set({ workcenter: workcenterId, shift: shiftNumber.toString() }, performance);
            qualityGauge.set({ workcenter: workcenterId, shift: shiftNumber.toString() }, quality);

            return result;
        } catch (error) {
            logError('Failed to calculate OEE', error as Error);
            throw error;
        }
    }

    /**
     * Store OEE snapshot
     */
    async storeOEESnapshot(input: OEECalculationInput, result: OEEResult) {
        const snapshot = await prisma.oEESnapshot.upsert({
            where: {
                workcenterId_date_shiftNumber: {
                    workcenterId: input.workcenterId,
                    date: input.date,
                    shiftNumber: input.shiftNumber,
                },
            },
            create: {
                workcenterId: input.workcenterId,
                date: input.date,
                shiftNumber: input.shiftNumber,
                availability: result.availability,
                performance: result.performance,
                quality: result.quality,
                oee: result.oee,
                plannedTime: result.details.plannedTime,
                downtime: result.details.downtime,
                operatingTime: result.details.operatingTime,
                idealCycleTime: result.details.idealCycleTime,
                totalPieces: result.details.totalPieces,
                goodPieces: result.details.goodPieces,
            },
            update: {
                availability: result.availability,
                performance: result.performance,
                quality: result.quality,
                oee: result.oee,
                plannedTime: result.details.plannedTime,
                downtime: result.details.downtime,
                operatingTime: result.details.operatingTime,
                idealCycleTime: result.details.idealCycleTime,
                totalPieces: result.details.totalPieces,
                goodPieces: result.details.goodPieces,
            },
        });

        return snapshot;
    }

    /**
     * Get OEE history
     */
    async getOEEHistory(filters: {
        workcenterId?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }) {
        const where: any = {};

        if (filters.workcenterId) {
            where.workcenterId = filters.workcenterId;
        }

        if (filters.dateFrom || filters.dateTo) {
            where.date = {};
            if (filters.dateFrom) {
                where.date.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.date.lte = filters.dateTo;
            }
        }

        const snapshots = await prisma.oEESnapshot.findMany({
            where,
            include: {
                workcenter: true,
            },
            orderBy: [{ date: 'desc' }, { shiftNumber: 'desc' }],
        });

        return snapshots;
    }
}

export default new OEEService();
