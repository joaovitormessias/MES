import { Router } from 'express';
import opsRoutes from './ops.routes';
import scansRoutes from './scans.routes';
import traceabilityRoutes from './traceability.routes';
import dashboardsRoutes from './dashboards.routes';
import kpisRoutes from './kpis.routes';
import approvalsRoutes from './approvals.routes';
import iotRoutes from './iot.routes';
import grafanaRoutes from './grafana.routes';
import authRoutes from './auth.routes';
import telemetryRoutes from './telemetry.routes';
import aiRoutes from './ai.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/ops', opsRoutes);
router.use('/scans', scansRoutes);
router.use('/traceability', traceabilityRoutes);
router.use('/dashboards', dashboardsRoutes);
router.use('/kpis', kpisRoutes);
router.use('/approvals', approvalsRoutes);
router.use('/iot', iotRoutes);
router.use('/grafana', grafanaRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/ai', aiRoutes);

export default router;

