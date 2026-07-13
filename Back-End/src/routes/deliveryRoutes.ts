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

const router = Router()

router.get('/', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_DELIVERY']), getDeliveryOrders)
router.get('/active', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), getActiveDeliveries)
router.get('/:id/map', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_DELIVERY']), getOrderWithMap)
router.put('/:id/assign', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), assignDelivery)
router.put('/:id/status', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_DELIVERY']), updateDeliveryStatus)

export default router
