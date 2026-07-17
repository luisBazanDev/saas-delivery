import { Router } from 'express'
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireAnyRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), listOrders)
router.post('/', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), createOrder)
router.get('/:id', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), getOrder)
router.put('/:id', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), updateOrder)
router.delete('/:id', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), deleteOrder)

export default router
