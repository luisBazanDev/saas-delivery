import { Router } from 'express'
import { getKitchenOrders, markOrderReady, cancelOrderReady } from '../controllers/kitchenController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireAnyRole } from '../middleware/requireRole'

const router = Router({ mergeParams: true })

router.get('/', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_CHEF']), getKitchenOrders)
router.put('/:orderId/ready', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_CHEF']), markOrderReady)
router.put('/:orderId/unready', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_CHEF']), cancelOrderReady)

export default router
