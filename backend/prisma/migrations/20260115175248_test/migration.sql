-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('RAW_MATERIAL', 'WIP', 'FINISHED_GOOD', 'COMPONENT');

-- CreateEnum
CREATE TYPE "WorkcenterType" AS ENUM ('OPTIMIZER', 'PRE_CUT', 'CNC', 'FINISHING', 'ASSEMBLY', 'PAINTING', 'PACKAGING', 'PRESS', 'CALIBRATOR', 'BRUSH');

-- CreateEnum
CREATE TYPE "OperatorRole" AS ENUM ('OPERATOR', 'SUPERVISOR', 'PCP', 'MANAGER');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('PRODUCTION', 'REPLENISHMENT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('OPEN_NOT_STARTED', 'IN_PROGRESS', 'OPEN_PARTIAL', 'CLOSED');

-- CreateEnum
CREATE TYPE "LotOrigin" AS ENUM ('RAW', 'WIP', 'FINISHED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SCAN', 'START', 'STOP', 'COUNT', 'QUALITY', 'COMPLETE');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED');

-- CreateEnum
CREATE TYPE "QualityDisposition" AS ENUM ('SCRAP_NO_REUSE', 'REUSE');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('OVERTIME', 'ENABLE_EQUIPMENT', 'DISABLE_EQUIPMENT', 'SPECIAL_OPERATION');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "unitOfMeasure" TEXT NOT NULL,
    "standardCycleTime" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_of_materials" (
    "id" TEXT NOT NULL,
    "parentItemId" TEXT NOT NULL,
    "componentItemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "sequence" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bill_of_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_steps" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routings" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routing_steps" (
    "id" TEXT NOT NULL,
    "routingId" TEXT NOT NULL,
    "processStepId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "workcenterId" TEXT,
    "setupTime" DOUBLE PRECISION,
    "runTime" DOUBLE PRECISION,

    CONSTRAINT "routing_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workcenters" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WorkcenterType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workcenters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operators" (
    "id" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "OperatorRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_orders" (
    "id" TEXT NOT NULL,
    "erpOrderCode" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "itemId" TEXT NOT NULL,
    "plannedQty" DOUBLE PRECISION NOT NULL,
    "executedGoodQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "executedTotalQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "lotCode" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "productionOrderId" TEXT,
    "origin" "LotOrigin" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lot_genealogy" (
    "id" TEXT NOT NULL,
    "parentLotId" TEXT NOT NULL,
    "childLotId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lot_genealogy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_events" (
    "id" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "lotId" TEXT,
    "processStepId" TEXT NOT NULL,
    "workcenterId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB,
    "idempotencyKey" TEXT,

    CONSTRAINT "execution_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_executions" (
    "id" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "processStepId" TEXT NOT NULL,
    "workcenterId" TEXT NOT NULL,
    "operatorId" TEXT,
    "status" "ExecutionStatus" NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "plannedQty" DOUBLE PRECISION NOT NULL,
    "executedQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "goodQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scrapQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_records" (
    "id" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "processStepId" TEXT NOT NULL,
    "disposition" "QualityDisposition" NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "quality_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downtime_events" (
    "id" TEXT NOT NULL,
    "workcenterId" TEXT NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "startTs" TIMESTAMP(3) NOT NULL,
    "endTs" TIMESTAMP(3),
    "isMicroStop" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "downtime_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_schedules" (
    "id" TEXT NOT NULL,
    "workcenterId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "shiftNumber" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "shift_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workcenter_calendars" (
    "id" TEXT NOT NULL,
    "workcenterId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,

    CONSTRAINT "workcenter_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "type" "ApprovalType" NOT NULL,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "workcenterId" TEXT,
    "status" "ApprovalStatus" NOT NULL,
    "justification" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "replenishment_links" (
    "id" TEXT NOT NULL,
    "originalProductionOrderId" TEXT NOT NULL,
    "replenishmentOrderId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "replenishment_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oee_snapshots" (
    "id" TEXT NOT NULL,
    "workcenterId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "shiftNumber" INTEGER NOT NULL,
    "availability" DOUBLE PRECISION NOT NULL,
    "performance" DOUBLE PRECISION NOT NULL,
    "quality" DOUBLE PRECISION NOT NULL,
    "oee" DOUBLE PRECISION NOT NULL,
    "plannedTime" DOUBLE PRECISION NOT NULL,
    "downtime" DOUBLE PRECISION NOT NULL,
    "operatingTime" DOUBLE PRECISION NOT NULL,
    "idealCycleTime" DOUBLE PRECISION NOT NULL,
    "totalPieces" INTEGER NOT NULL,
    "goodPieces" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oee_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_summaries" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "shiftNumber" INTEGER NOT NULL,
    "plannedQty" DOUBLE PRECISION NOT NULL,
    "executedQty" DOUBLE PRECISION NOT NULL,
    "goodQty" DOUBLE PRECISION NOT NULL,
    "scrapQty" DOUBLE PRECISION NOT NULL,
    "efficiency" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_utilizations" (
    "id" TEXT NOT NULL,
    "workcenterId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "shiftNumber" INTEGER NOT NULL,
    "totalCapacity" INTEGER NOT NULL,
    "avgOccupied" DOUBLE PRECISION NOT NULL,
    "utilizationPct" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "table_utilizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "items_code_key" ON "items"("code");

-- CreateIndex
CREATE INDEX "items_code_idx" ON "items"("code");

-- CreateIndex
CREATE INDEX "items_type_idx" ON "items"("type");

-- CreateIndex
CREATE INDEX "bill_of_materials_parentItemId_idx" ON "bill_of_materials"("parentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "bill_of_materials_parentItemId_componentItemId_key" ON "bill_of_materials"("parentItemId", "componentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "process_steps_code_key" ON "process_steps"("code");

-- CreateIndex
CREATE INDEX "process_steps_code_idx" ON "process_steps"("code");

-- CreateIndex
CREATE INDEX "process_steps_sequence_idx" ON "process_steps"("sequence");

-- CreateIndex
CREATE INDEX "routings_itemId_isActive_idx" ON "routings"("itemId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "routings_itemId_version_key" ON "routings"("itemId", "version");

-- CreateIndex
CREATE INDEX "routing_steps_routingId_idx" ON "routing_steps"("routingId");

-- CreateIndex
CREATE UNIQUE INDEX "routing_steps_routingId_sequence_key" ON "routing_steps"("routingId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "workcenters_code_key" ON "workcenters"("code");

-- CreateIndex
CREATE INDEX "workcenters_code_idx" ON "workcenters"("code");

-- CreateIndex
CREATE INDEX "workcenters_isEnabled_idx" ON "workcenters"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "operators_badge_key" ON "operators"("badge");

-- CreateIndex
CREATE INDEX "operators_badge_idx" ON "operators"("badge");

-- CreateIndex
CREATE INDEX "operators_role_idx" ON "operators"("role");

-- CreateIndex
CREATE UNIQUE INDEX "production_orders_erpOrderCode_key" ON "production_orders"("erpOrderCode");

-- CreateIndex
CREATE INDEX "production_orders_erpOrderCode_idx" ON "production_orders"("erpOrderCode");

-- CreateIndex
CREATE INDEX "production_orders_status_idx" ON "production_orders"("status");

-- CreateIndex
CREATE INDEX "production_orders_type_idx" ON "production_orders"("type");

-- CreateIndex
CREATE INDEX "production_orders_dueDate_idx" ON "production_orders"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "lots_lotCode_key" ON "lots"("lotCode");

-- CreateIndex
CREATE INDEX "lots_lotCode_idx" ON "lots"("lotCode");

-- CreateIndex
CREATE INDEX "lots_productionOrderId_idx" ON "lots"("productionOrderId");

-- CreateIndex
CREATE INDEX "lot_genealogy_parentLotId_idx" ON "lot_genealogy"("parentLotId");

-- CreateIndex
CREATE INDEX "lot_genealogy_childLotId_idx" ON "lot_genealogy"("childLotId");

-- CreateIndex
CREATE UNIQUE INDEX "lot_genealogy_parentLotId_childLotId_key" ON "lot_genealogy"("parentLotId", "childLotId");

-- CreateIndex
CREATE UNIQUE INDEX "execution_events_idempotencyKey_key" ON "execution_events"("idempotencyKey");

-- CreateIndex
CREATE INDEX "execution_events_productionOrderId_processStepId_workcenter_idx" ON "execution_events"("productionOrderId", "processStepId", "workcenterId");

-- CreateIndex
CREATE INDEX "execution_events_ts_idx" ON "execution_events"("ts");

-- CreateIndex
CREATE INDEX "execution_events_eventType_idx" ON "execution_events"("eventType");

-- CreateIndex
CREATE INDEX "execution_events_idempotencyKey_idx" ON "execution_events"("idempotencyKey");

-- CreateIndex
CREATE INDEX "process_executions_status_idx" ON "process_executions"("status");

-- CreateIndex
CREATE INDEX "process_executions_startedAt_idx" ON "process_executions"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "process_executions_productionOrderId_processStepId_workcent_key" ON "process_executions"("productionOrderId", "processStepId", "workcenterId");

-- CreateIndex
CREATE INDEX "quality_records_productionOrderId_idx" ON "quality_records"("productionOrderId");

-- CreateIndex
CREATE INDEX "quality_records_disposition_idx" ON "quality_records"("disposition");

-- CreateIndex
CREATE INDEX "quality_records_ts_idx" ON "quality_records"("ts");

-- CreateIndex
CREATE INDEX "downtime_events_workcenterId_idx" ON "downtime_events"("workcenterId");

-- CreateIndex
CREATE INDEX "downtime_events_startTs_idx" ON "downtime_events"("startTs");

-- CreateIndex
CREATE INDEX "downtime_events_isMicroStop_idx" ON "downtime_events"("isMicroStop");

-- CreateIndex
CREATE INDEX "shift_schedules_workcenterId_idx" ON "shift_schedules"("workcenterId");

-- CreateIndex
CREATE UNIQUE INDEX "shift_schedules_workcenterId_dayOfWeek_shiftNumber_key" ON "shift_schedules"("workcenterId", "dayOfWeek", "shiftNumber");

-- CreateIndex
CREATE INDEX "workcenter_calendars_workcenterId_date_idx" ON "workcenter_calendars"("workcenterId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "workcenter_calendars_workcenterId_date_key" ON "workcenter_calendars"("workcenterId", "date");

-- CreateIndex
CREATE INDEX "approvals_status_idx" ON "approvals"("status");

-- CreateIndex
CREATE INDEX "approvals_type_idx" ON "approvals"("type");

-- CreateIndex
CREATE INDEX "approvals_requestedAt_idx" ON "approvals"("requestedAt");

-- CreateIndex
CREATE INDEX "replenishment_links_originalProductionOrderId_idx" ON "replenishment_links"("originalProductionOrderId");

-- CreateIndex
CREATE INDEX "replenishment_links_replenishmentOrderId_idx" ON "replenishment_links"("replenishmentOrderId");

-- CreateIndex
CREATE INDEX "oee_snapshots_workcenterId_date_idx" ON "oee_snapshots"("workcenterId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "oee_snapshots_workcenterId_date_shiftNumber_key" ON "oee_snapshots"("workcenterId", "date", "shiftNumber");

-- CreateIndex
CREATE INDEX "shift_summaries_date_idx" ON "shift_summaries"("date");

-- CreateIndex
CREATE UNIQUE INDEX "shift_summaries_date_shiftNumber_key" ON "shift_summaries"("date", "shiftNumber");

-- CreateIndex
CREATE INDEX "table_utilizations_workcenterId_date_idx" ON "table_utilizations"("workcenterId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "table_utilizations_workcenterId_date_shiftNumber_key" ON "table_utilizations"("workcenterId", "date", "shiftNumber");

-- AddForeignKey
ALTER TABLE "bill_of_materials" ADD CONSTRAINT "bill_of_materials_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_of_materials" ADD CONSTRAINT "bill_of_materials_componentItemId_fkey" FOREIGN KEY ("componentItemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routings" ADD CONSTRAINT "routings_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routing_steps" ADD CONSTRAINT "routing_steps_routingId_fkey" FOREIGN KEY ("routingId") REFERENCES "routings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routing_steps" ADD CONSTRAINT "routing_steps_processStepId_fkey" FOREIGN KEY ("processStepId") REFERENCES "process_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routing_steps" ADD CONSTRAINT "routing_steps_workcenterId_fkey" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_genealogy" ADD CONSTRAINT "lot_genealogy_parentLotId_fkey" FOREIGN KEY ("parentLotId") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_genealogy" ADD CONSTRAINT "lot_genealogy_childLotId_fkey" FOREIGN KEY ("childLotId") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_events" ADD CONSTRAINT "execution_events_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_events" ADD CONSTRAINT "execution_events_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_events" ADD CONSTRAINT "execution_events_processStepId_fkey" FOREIGN KEY ("processStepId") REFERENCES "process_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_events" ADD CONSTRAINT "execution_events_workcenterId_fkey" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_events" ADD CONSTRAINT "execution_events_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_executions" ADD CONSTRAINT "process_executions_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_executions" ADD CONSTRAINT "process_executions_processStepId_fkey" FOREIGN KEY ("processStepId") REFERENCES "process_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_executions" ADD CONSTRAINT "process_executions_workcenterId_fkey" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_executions" ADD CONSTRAINT "process_executions_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_records" ADD CONSTRAINT "quality_records_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_records" ADD CONSTRAINT "quality_records_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_records" ADD CONSTRAINT "quality_records_processStepId_fkey" FOREIGN KEY ("processStepId") REFERENCES "process_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downtime_events" ADD CONSTRAINT "downtime_events_workcenterId_fkey" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_schedules" ADD CONSTRAINT "shift_schedules_workcenterId_fkey" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workcenter_calendars" ADD CONSTRAINT "workcenter_calendars_workcenterId_fkey" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "operators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_workcenterId_fkey" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replenishment_links" ADD CONSTRAINT "replenishment_links_originalProductionOrderId_fkey" FOREIGN KEY ("originalProductionOrderId") REFERENCES "production_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replenishment_links" ADD CONSTRAINT "replenishment_links_replenishmentOrderId_fkey" FOREIGN KEY ("replenishmentOrderId") REFERENCES "production_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oee_snapshots" ADD CONSTRAINT "oee_snapshots_workcenterId_fkey" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_utilizations" ADD CONSTRAINT "table_utilizations_workcenterId_fkey" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
