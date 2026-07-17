import { Router } from 'express'
import {
  getDeliveryOrders,
  getOrderWithMap,
  assignDelivery,
  claimDelivery,
  updateDeliveryStatus,
  getActiveDeliveries,
  updateDeliveryUserLocation,
  getActiveDeliveryUsers,
} from '../controllers/deliveryController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireAnyRole } from '../middleware/requireRole'

const router = Router({ mergeParams: true })

router.get('/', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_DELIVERY']), getDeliveryOrders)
router.get('/active', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), getActiveDeliveries)
router.get('/users', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), getActiveDeliveryUsers)
router.get('/:orderId/map', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_DELIVERY']), getOrderWithMap)
router.put('/:orderId/assign', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), assignDelivery)
router.put('/:orderId/claim', authMiddleware, requireAnyRole(['STORE_DELIVERY']), claimDelivery)
router.put('/:orderId/status', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'STORE_DELIVERY']), updateDeliveryStatus)
router.post('/users/:userId/location', authMiddleware, requireAnyRole(['STORE_DELIVERY']), updateDeliveryUserLocation)

export default router
