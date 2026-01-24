import { Router } from 'express';
import opsRoutes from './ops.routes';
import scansRoutes from './scans.routes';
import traceabilityRoutes from './traceability.routes';
import dashboardsRoutes from './dashboards.routes';
import kpisRoutes from './kpis.routes';
import approvalsRoutes from './approvals.routes';

const router = Router();

// Mount route modules
router.use('/ops', opsRoutes);
router.use('/scans', scansRoutes);
router.use('/traceability', traceabilityRoutes);
router.use('/dashboards', dashboardsRoutes);
router.use('/kpis', kpisRoutes);
router.use('/approvals', approvalsRoutes);

export default router;
