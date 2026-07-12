import { Router } from 'express'
import {
  listOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/storeOrderController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireAnyRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), listOrders)
router.post('/', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), createOrder)
router.put('/:code/status', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN', 'STORE_MANAGER']), updateOrderStatus)
router.delete('/:code', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN']), deleteOrder)

export default router
