import prisma from '../../utils/prisma';
import { publishEvent, DomainEvent } from '../../events/event-bus';
import { logInfo, logError } from '../../utils/logger';
import { AppError } from '../../api/middleware/error.middleware';
import { qualityEventsTotal } from '../../utils/metrics';

export interface RecordQualityInput {
    productionOrderId: string;
    lotId: string;
    processStepId: string;
    disposition: 'SCRAP_NO_REUSE' | 'REUSE';
    reasonCode: string;
    qty: number;
    notes?: string;
}

export class QualityService {
    /**
     * Record quality event (scrap or reuse)
     */
    async recordQuality(input: RecordQualityInput) {
        try {
            // Validate production order exists
            const productionOrder = await prisma.productionOrder.findUnique({
                where: { id: input.productionOrderId },
            });

            if (!productionOrder) {
                throw new AppError(404, 'NOT_FOUND', 'Production order not found');
            }

            // Create quality record
            const qualityRecord = await prisma.qualityRecord.create({
                data: {
                    productionOrderId: input.productionOrderId,
                    lotId: input.lotId,
                    processStepId: input.processStepId,
                    disposition: input.disposition,
                    reasonCode: input.reasonCode,
                    qty: input.qty,
                    notes: input.notes,
                },
            });

            // Update process execution scrap qty
            const execution = await prisma.processExecution.findUnique({
                where: {
                    productionOrderId_processStepId_workcenterId: {
                        productionOrderId: input.productionOrderId,
                        processStepId: input.processStepId,
                        workcenterId: '', // TODO: Get from input or context
                    },
                },
            });

            if (execution) {
                await prisma.processExecution.update({
                    where: { id: execution.id },
                    data: {
                        scrapQty: { increment: input.qty },
                        goodQty: { decrement: input.qty },
                    },
                });
            }

            // Create execution event
            await prisma.executionEvent.create({
                data: {
                    eventType: 'QUALITY',
                    productionOrderId: input.productionOrderId,
                    lotId: input.lotId,
                    processStepId: input.processStepId,
                    workcenterId: execution?.workcenterId || '',
                    operatorId: execution?.operatorId || '',
                    payload: {
                        disposition: input.disposition,
                        reasonCode: input.reasonCode,
                        qty: input.qty,
                    },
                },
            });

            logInfo('Quality event recorded', {
                qualityRecordId: qualityRecord.id,
                disposition: input.disposition,
                qty: input.qty,
            });

            // Publish event
            await publishEvent(DomainEvent.QUALITY_RECORDED, {
                quality_record_id: qualityRecord.id,
                disposition: input.disposition,
                reason_code: input.reasonCode,
                qty: input.qty,
                ts: qualityRecord.ts.toISOString(),
            });

            // Record metric
            qualityEventsTotal.inc({
                disposition: input.disposition,
                process_step: input.processStepId,
            });

            return qualityRecord;
        } catch (error) {
            logError('Failed to record quality event', error as Error);
            throw error;
        }
    }

    /**
     * Get quality records for a production order
     */
    async getQualityRecordsByProductionOrder(productionOrderId: string) {
        const records = await prisma.qualityRecord.findMany({
            where: { productionOrderId },
            include: {
                lot: true,
                processStep: true,
            },
            orderBy: { ts: 'desc' },
        });

        return records;
    }

    /**
     * Get quality summary by disposition
     */
    async getQualitySummary(filters: {
        dateFrom?: Date;
        dateTo?: Date;
        processStepId?: string;
    }) {
        const where: any = {};

        if (filters.dateFrom || filters.dateTo) {
            where.ts = {};
            if (filters.dateFrom) {
                where.ts.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.ts.lte = filters.dateTo;
            }
        }

        if (filters.processStepId) {
            where.processStepId = filters.processStepId;
        }

        const summary = await prisma.qualityRecord.groupBy({
            by: ['disposition', 'reasonCode'],
            where,
            _sum: {
                qty: true,
            },
            _count: {
                id: true,
            },
        });

        return summary;
    }
}

export default new QualityService();
