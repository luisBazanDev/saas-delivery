import { Router } from 'express'
import {
  getDeliveryOrders,
  getOrderWithMap,
  assignDelivery,
  updateDeliveryStatus,
  getActiveDeliveries,
} from '../controllers/deliveryController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireAnyRole } from '../middleware/requireRole'

const router = Router({ mergeParams: true })

router.get('/', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_DELIVERY']), getDeliveryOrders)
router.get('/active', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), getActiveDeliveries)
router.get('/:orderId/map', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_DELIVERY']), getOrderWithMap)
router.put('/:orderId/assign', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), assignDelivery)
router.put('/:orderId/status', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_DELIVERY']), updateDeliveryStatus)

export default router
