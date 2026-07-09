import { Router } from 'express'
import {
  createOrderProduct,
  listOrderProducts,
  getOrderProduct,
  updateOrderProduct,
  deleteOrderProduct,
} from '../controllers/orderProductController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireRole('STORE_ADMIN'), listOrderProducts)
router.post('/', authMiddleware, requireRole('STORE_ADMIN'), createOrderProduct)
router.get('/:order_code/:product_id', authMiddleware, requireRole('STORE_ADMIN'), getOrderProduct)
router.put('/:order_code/:product_id', authMiddleware, requireRole('STORE_ADMIN'), updateOrderProduct)
router.delete('/:order_code/:product_id', authMiddleware, requireRole('STORE_ADMIN'), deleteOrderProduct)

export default router
