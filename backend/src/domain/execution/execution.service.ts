import prisma from '../../utils/prisma';
import { publishEvent, DomainEvent } from '../../events/event-bus';
import { logInfo, logError } from '../../utils/logger';
import { AppError } from '../../api/middleware/error.middleware';
import { checkIdempotencyKey, storeIdempotencyResult, getIdempotencyResult } from '../../utils/idempotency';
import { executionEventsTotal, pieceCountTotal } from '../../utils/metrics';

export interface BarcodeScanInput {
    scanRaw: string;
    productionOrderId: string;
    lotId: string;
    processStepId: string;
    workcenterId: string;
    operatorId: string;
    idempotencyKey?: string;
}

export interface StartStepInput {
    productionOrderId: string;
    processStepId: string;
    workcenterId: string;
    operatorId: string;
}

export interface CountPiecesInput {
    productionOrderId: string;
    processStepId: string;
    workcenterId: string;
    piecesPerCycle?: number;
    source?: string;
}

export interface CompleteStepInput {
    productionOrderId: string;
    processStepId: string;
    workcenterId: string;
}

export class ExecutionService {
    /**
     * Process barcode scan (idempotent)
     */
    async processScan(input: BarcodeScanInput) {
        // Check idempotency
        if (input.idempotencyKey) {
            const isDuplicate = await checkIdempotencyKey(input.idempotencyKey);
            if (isDuplicate) {
                logInfo('Duplicate scan detected', { idempotencyKey: input.idempotencyKey });
                const result = await getIdempotencyResult(input.idempotencyKey);
                return result;
            }
        }

        try {
            // Validate production order exists
            const productionOrder = await prisma.productionOrder.findUnique({
                where: { id: input.productionOrderId },
            });

            if (!productionOrder) {
                throw new AppError(404, 'NOT_FOUND', 'Production order not found');
            }

            // Validate lot exists
            const lot = await prisma.lot.findUnique({
                where: { id: input.lotId },
            });

            if (!lot) {
                throw new AppError(404, 'NOT_FOUND', 'Lot not found');
            }

            // Create execution event
            const event = await prisma.executionEvent.create({
                data: {
                    eventType: 'SCAN',
                    productionOrderId: input.productionOrderId,
                    lotId: input.lotId,
                    processStepId: input.processStepId,
                    workcenterId: input.workcenterId,
                    operatorId: input.operatorId,
                    idempotencyKey: input.idempotencyKey,
                    payload: { scanRaw: input.scanRaw },
                },
            });

            logInfo('Barcode scanned', {
                eventId: event.id,
                productionOrderId: input.productionOrderId,
                lotId: input.lotId,
            });

            // Publish event
            await publishEvent(DomainEvent.BARCODE_SCANNED, {
                scan_raw: input.scanRaw,
                production_order_id: input.productionOrderId,
                lot_id: input.lotId,
                process_step_id: input.processStepId,
                workcenter_id: input.workcenterId,
                operator_id: input.operatorId,
                ts: event.ts.toISOString(),
            });

            // Record metric
            executionEventsTotal.inc({ event_type: 'SCAN', workcenter: input.workcenterId });

            // Store result for idempotency
            if (input.idempotencyKey) {
                await storeIdempotencyResult(input.idempotencyKey, event);
            }

            return event;
        } catch (error) {
            logError('Failed to process scan', error as Error);
            throw error;
        }
    }

    /**
     * Start process step
     */
    async startStep(input: StartStepInput) {
        try {
            // Check if execution already exists
            let execution = await prisma.processExecution.findUnique({
                where: {
                    productionOrderId_processStepId_workcenterId: {
                        productionOrderId: input.productionOrderId,
                        processStepId: input.processStepId,
                        workcenterId: input.workcenterId,
                    },
                },
            });

            if (execution && execution.status === 'IN_PROGRESS') {
                throw new AppError(409, 'CONFLICT_IDEMPOTENCY', 'Step already in progress');
            }

            // Get production order to set planned qty
            const productionOrder = await prisma.productionOrder.findUnique({
                where: { id: input.productionOrderId },
            });

            if (!productionOrder) {
                throw new AppError(404, 'NOT_FOUND', 'Production order not found');
            }

            // Create or update execution
            if (!execution) {
                execution = await prisma.processExecution.create({
                    data: {
                        productionOrderId: input.productionOrderId,
                        processStepId: input.processStepId,
                        workcenterId: input.workcenterId,
                        operatorId: input.operatorId,
                        status: 'IN_PROGRESS',
                        startedAt: new Date(),
                        plannedQty: productionOrder.plannedQty,
                    },
                });
            } else {
                execution = await prisma.processExecution.update({
                    where: { id: execution.id },
                    data: {
                        status: 'IN_PROGRESS',
                        startedAt: new Date(),
                        operatorId: input.operatorId,
                    },
                });
            }

            // Create execution event
            const event = await prisma.executionEvent.create({
                data: {
                    eventType: 'START',
                    productionOrderId: input.productionOrderId,
                    processStepId: input.processStepId,
                    workcenterId: input.workcenterId,
                    operatorId: input.operatorId,
                },
            });

            logInfo('Step started', {
                executionId: execution.id,
                productionOrderId: input.productionOrderId,
                processStepId: input.processStepId,
            });

            // Publish event
            await publishEvent(DomainEvent.STEP_STARTED, {
                production_order_id: input.productionOrderId,
                process_step_id: input.processStepId,
                workcenter_id: input.workcenterId,
                operator_id: input.operatorId,
                ts: event.ts.toISOString(),
            });

            executionEventsTotal.inc({ event_type: 'START', workcenter: input.workcenterId });

            return execution;
        } catch (error) {
            logError('Failed to start step', error as Error);
            throw error;
        }
    }

    /**
     * Count pieces
     */
    async countPieces(input: CountPiecesInput) {
        try {
            const piecesPerCycle = input.piecesPerCycle || 1;

            // Get or create execution
            let execution = await prisma.processExecution.findUnique({
                where: {
                    productionOrderId_processStepId_workcenterId: {
                        productionOrderId: input.productionOrderId,
                        processStepId: input.processStepId,
                        workcenterId: input.workcenterId,
                    },
                },
            });

            if (!execution) {
                throw new AppError(404, 'NOT_FOUND', 'Process execution not found. Start step first.');
            }

            // Update execution quantities
            execution = await prisma.processExecution.update({
                where: { id: execution.id },
                data: {
                    executedQty: { increment: piecesPerCycle },
                    goodQty: { increment: piecesPerCycle }, // Assume good until quality event says otherwise
                },
            });

            // Create execution event
            const event = await prisma.executionEvent.create({
                data: {
                    eventType: 'COUNT',
                    productionOrderId: input.productionOrderId,
                    processStepId: input.processStepId,
                    workcenterId: input.workcenterId,
                    operatorId: execution.operatorId || '',
                    payload: {
                        piecesPerCycle,
                        source: input.source,
                    },
                },
            });

            logInfo('Pieces counted', {
                executionId: execution.id,
                piecesPerCycle,
                totalExecuted: execution.executedQty,
            });

            // Publish event
            await publishEvent(DomainEvent.PIECE_COUNTED, {
                production_order_id: input.productionOrderId,
                process_step_id: input.processStepId,
                workcenter_id: input.workcenterId,
                ts: event.ts.toISOString(),
                pieces_per_cycle: piecesPerCycle,
                source: input.source,
            });

            pieceCountTotal.inc({ workcenter: input.workcenterId, process_step: input.processStepId }, piecesPerCycle);

            return execution;
        } catch (error) {
            logError('Failed to count pieces', error as Error);
            throw error;
        }
    }

    /**
     * Complete process step
     */
    async completeStep(input: CompleteStepInput) {
        try {
            const execution = await prisma.processExecution.findUnique({
                where: {
                    productionOrderId_processStepId_workcenterId: {
                        productionOrderId: input.productionOrderId,
                        processStepId: input.processStepId,
                        workcenterId: input.workcenterId,
                    },
                },
            });

            if (!execution) {
                throw new AppError(404, 'NOT_FOUND', 'Process execution not found');
            }

            if (execution.status === 'COMPLETED') {
                throw new AppError(409, 'CONFLICT_IDEMPOTENCY', 'Step already completed');
            }

            // Update execution
            const updatedExecution = await prisma.processExecution.update({
                where: { id: execution.id },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });

            // Create execution event
            const event = await prisma.executionEvent.create({
                data: {
                    eventType: 'COMPLETE',
                    productionOrderId: input.productionOrderId,
                    processStepId: input.processStepId,
                    workcenterId: input.workcenterId,
                    operatorId: execution.operatorId || '',
                },
            });

            logInfo('Step completed', {
                executionId: execution.id,
                productionOrderId: input.productionOrderId,
            });

            // Publish event
            await publishEvent(DomainEvent.STEP_COMPLETED, {
                production_order_id: input.productionOrderId,
                process_step_id: input.processStepId,
                workcenter_id: input.workcenterId,
                ts: event.ts.toISOString(),
            });

            executionEventsTotal.inc({ event_type: 'COMPLETE', workcenter: input.workcenterId });

            return updatedExecution;
        } catch (error) {
            logError('Failed to complete step', error as Error);
            throw error;
        }
    }
}

export default new ExecutionService();
