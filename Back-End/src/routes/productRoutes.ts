import { Router } from 'express'
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireRole('STORE_ADMIN'), listProducts)
router.post('/', authMiddleware, requireRole('STORE_ADMIN'), createProduct)
router.get('/:id', authMiddleware, requireRole('STORE_ADMIN'), getProduct)
router.put('/:id', authMiddleware, requireRole('STORE_ADMIN'), updateProduct)
router.delete('/:id', authMiddleware, requireRole('STORE_ADMIN'), deleteProduct)

export default router
