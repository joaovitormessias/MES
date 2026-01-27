-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('SENSOR', 'PLC', 'CAMERA', 'GATEWAY', 'SIMULATOR');

-- CreateEnum
CREATE TYPE "IoTAlertType" AS ENUM ('TEMPERATURE_HIGH', 'TEMPERATURE_LOW', 'PRESSURE_HIGH', 'PRESSURE_LOW', 'VIBRATION_HIGH', 'DEVICE_OFFLINE', 'THRESHOLD_EXCEEDED', 'MAINTENANCE_DUE');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "iot_devices" (
    "id" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workcenterId" TEXT,
    "deviceType" "DeviceType" NOT NULL,
    "thingsBoardId" TEXT,
    "accessToken" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iot_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemetry_snapshots" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metrics" JSONB NOT NULL,

    CONSTRAINT "telemetry_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iot_alerts" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "alertType" "IoTAlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "threshold" DOUBLE PRECISION,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "iot_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "iot_devices_deviceCode_key" ON "iot_devices"("deviceCode");

-- CreateIndex
CREATE UNIQUE INDEX "iot_devices_thingsBoardId_key" ON "iot_devices"("thingsBoardId");

-- CreateIndex
CREATE INDEX "iot_devices_deviceCode_idx" ON "iot_devices"("deviceCode");

-- CreateIndex
CREATE INDEX "iot_devices_workcenterId_idx" ON "iot_devices"("workcenterId");

-- CreateIndex
CREATE INDEX "iot_devices_isOnline_idx" ON "iot_devices"("isOnline");

-- CreateIndex
CREATE INDEX "telemetry_snapshots_deviceId_ts_idx" ON "telemetry_snapshots"("deviceId", "ts");

-- CreateIndex
CREATE INDEX "iot_alerts_deviceId_idx" ON "iot_alerts"("deviceId");

-- CreateIndex
CREATE INDEX "iot_alerts_alertType_idx" ON "iot_alerts"("alertType");

-- CreateIndex
CREATE INDEX "iot_alerts_acknowledged_idx" ON "iot_alerts"("acknowledged");

-- CreateIndex
CREATE INDEX "iot_alerts_createdAt_idx" ON "iot_alerts"("createdAt");

-- AddForeignKey
ALTER TABLE "iot_devices" ADD CONSTRAINT "iot_devices_workcenterId_fkey" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemetry_snapshots" ADD CONSTRAINT "telemetry_snapshots_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "iot_devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iot_alerts" ADD CONSTRAINT "iot_alerts_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "iot_devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
