import { Router } from 'express'
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  archiveProduct,
  unarchiveProduct,
} from '../controllers/productController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireRole('STORE_ADMIN'), listProducts)
router.post('/', authMiddleware, requireRole('STORE_ADMIN'), createProduct)
router.get('/:id', authMiddleware, requireRole('STORE_ADMIN'), getProduct)
router.put('/:id', authMiddleware, requireRole('STORE_ADMIN'), updateProduct)
router.put('/:id/archive', authMiddleware, requireRole('STORE_ADMIN'), archiveProduct)
router.put('/:id/unarchive', authMiddleware, requireRole('STORE_ADMIN'), unarchiveProduct)

export default router
