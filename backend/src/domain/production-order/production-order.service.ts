import prisma from '../../utils/prisma';
import { publishEvent, DomainEvent } from '../../events/event-bus';
import { logInfo, logError } from '../../utils/logger';
import { AppError } from '../../api/middleware/error.middleware';

export interface CreateProductionOrderInput {
    erpOrderCode: string;
    type: 'PRODUCTION' | 'REPLENISHMENT';
    itemId: string;
    plannedQty: number;
    dueDate: Date;
    priority?: number;
}

export interface UpdateProductionOrderInput {
    executedGoodQty?: number;
    executedTotalQty?: number;
    status?: 'OPEN_NOT_STARTED' | 'IN_PROGRESS' | 'OPEN_PARTIAL' | 'CLOSED';
}

export class ProductionOrderService {
    /**
     * Create a new production order
     */
    async createProductionOrder(input: CreateProductionOrderInput) {
        try {
            const productionOrder = await prisma.productionOrder.create({
                data: {
                    erpOrderCode: input.erpOrderCode,
                    type: input.type,
                    itemId: input.itemId,
                    plannedQty: input.plannedQty,
                    dueDate: input.dueDate,
                    priority: input.priority || 0,
                    status: 'OPEN_NOT_STARTED',
                },
                include: {
                    item: true,
                },
            });

            logInfo('Production order created', {
                id: productionOrder.id,
                erpOrderCode: productionOrder.erpOrderCode,
            });

            // Publish event
            await publishEvent(DomainEvent.OP_IMPORTED_FROM_ERP, {
                production_order_id: productionOrder.id,
                erp_order_code: productionOrder.erpOrderCode,
                planned_qty: productionOrder.plannedQty,
                routing: [], // TODO: Fetch routing from item
            });

            return productionOrder;
        } catch (error) {
            logError('Failed to create production order', error as Error);
            throw error;
        }
    }

    /**
     * Get production order by ID
     */
    async getProductionOrderById(id: string) {
        const productionOrder = await prisma.productionOrder.findUnique({
            where: { id },
            include: {
                item: true,
                lots: true,
                processExecutions: {
                    include: {
                        processStep: true,
                        workcenter: true,
                        operator: true,
                    },
                },
            },
        });

        if (!productionOrder) {
            throw new AppError(404, 'NOT_FOUND', 'Production order not found');
        }

        return productionOrder;
    }

    /**
     * Search production orders with filters
     */
    async searchProductionOrders(filters: {
        status?: string[];
        type?: string[];
        dateFrom?: Date;
        dateTo?: Date;
        erpOrderCode?: string;
    }) {
        const where: any = {};

        if (filters.status && filters.status.length > 0) {
            where.status = { in: filters.status };
        }

        if (filters.type && filters.type.length > 0) {
            where.type = { in: filters.type };
        }

        if (filters.dateFrom || filters.dateTo) {
            where.dueDate = {};
            if (filters.dateFrom) {
                where.dueDate.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.dueDate.lte = filters.dateTo;
            }
        }

        if (filters.erpOrderCode) {
            where.erpOrderCode = { contains: filters.erpOrderCode };
        }

        const productionOrders = await prisma.productionOrder.findMany({
            where,
            include: {
                item: true,
                processExecutions: {
                    select: {
                        processStepId: true,
                        status: true,
                        executedQty: true,
                    },
                },
            },
            orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        });

        return productionOrders;
    }

    /**
     * Update production order
     */
    async updateProductionOrder(id: string, input: UpdateProductionOrderInput) {
        const productionOrder = await prisma.productionOrder.update({
            where: { id },
            data: input,
        });

        logInfo('Production order updated', {
            id: productionOrder.id,
            status: productionOrder.status,
        });

        return productionOrder;
    }

    /**
     * Calculate and update executed quantities
     */
    async recalculateExecutedQuantities(productionOrderId: string) {
        const executions = await prisma.processExecution.findMany({
            where: { productionOrderId },
        });

        const totalGood = executions.reduce((sum, exec) => sum + exec.goodQty, 0);
        const totalExecuted = executions.reduce((sum, exec) => sum + exec.executedQty, 0);

        const productionOrder = await prisma.productionOrder.findUnique({
            where: { id: productionOrderId },
        });

        if (!productionOrder) {
            throw new AppError(404, 'NOT_FOUND', 'Production order not found');
        }

        // Determine status
        let status = productionOrder.status;
        if (totalExecuted === 0) {
            status = 'OPEN_NOT_STARTED';
        } else if (totalGood >= productionOrder.plannedQty) {
            status = 'CLOSED';
        } else if (totalExecuted > 0 && totalExecuted < productionOrder.plannedQty) {
            status = 'IN_PROGRESS';
        } else if (totalExecuted >= productionOrder.plannedQty && totalGood < productionOrder.plannedQty) {
            status = 'OPEN_PARTIAL';
        }

        await this.updateProductionOrder(productionOrderId, {
            executedGoodQty: totalGood,
            executedTotalQty: totalExecuted,
            status,
        });

        return { totalGood, totalExecuted, status };
    }
}

export default new ProductionOrderService();
