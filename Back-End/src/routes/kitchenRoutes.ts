import { Router } from 'express'
import { getKitchenOrders, markOrderReady } from '../controllers/kitchenController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireAnyRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), getKitchenOrders)
router.put('/:code/ready', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), markOrderReady)

export default router
