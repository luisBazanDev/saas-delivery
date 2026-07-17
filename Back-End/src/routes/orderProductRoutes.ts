import { Router } from 'express'
import {
  createOrderProduct,
  listOrderProducts,
  getOrderProduct,
  updateOrderProduct,
  deleteOrderProduct,
} from '../controllers/orderProductController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireAnyRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), listOrderProducts)
router.post('/', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), createOrderProduct)
router.get('/:order_id/:product_id', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), getOrderProduct)
router.put('/:order_id/:product_id', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), updateOrderProduct)
router.delete('/:order_id/:product_id', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), deleteOrderProduct)

export default router
