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
import { requireAnyRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), listProducts)
router.post('/', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), createProduct)
router.get('/:id', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), getProduct)
router.put('/:id', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), updateProduct)
router.put('/:id/archive', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), archiveProduct)
router.put('/:id/unarchive', authMiddleware, requireAnyRole(['STORE_ADMIN', 'STORE_MANAGER']), unarchiveProduct)

export default router
