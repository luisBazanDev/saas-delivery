import { Router } from 'express'
import { getDashboard } from '../controllers/dashboardController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireAnyRole } from '../middleware/requireRole'

const router = Router({ mergeParams: true })

router.get('/', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_CHEF']), getDashboard)

export default router
