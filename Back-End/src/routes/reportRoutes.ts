import { Router } from 'express'
import {
  getReportSummary,
  exportMovements,
  exportBusinessReport,
} from '../controllers/reportController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireAnyRole } from '../middleware/requireRole'

const router = Router({ mergeParams: true })

router.get('/summary', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), getReportSummary)
router.get('/export', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), exportMovements)
router.get('/business-report', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), exportBusinessReport)

export default router
