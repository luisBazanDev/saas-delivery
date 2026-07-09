import { Router } from 'express'
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireRole('STORE_ADMIN'), listOrders)
router.post('/', authMiddleware, requireRole('STORE_ADMIN'), createOrder)
router.get('/:code', authMiddleware, requireRole('STORE_ADMIN'), getOrder)
router.put('/:code', authMiddleware, requireRole('STORE_ADMIN'), updateOrder)
router.delete('/:code', authMiddleware, requireRole('STORE_ADMIN'), deleteOrder)

export default router
