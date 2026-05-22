import { Router } from 'express'
import {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireRole('STORE_ADMIN'), listCategories)
router.post('/', authMiddleware, requireRole('STORE_ADMIN'), createCategory)
router.get('/:id', authMiddleware, requireRole('STORE_ADMIN'), getCategory)
router.put('/:id', authMiddleware, requireRole('STORE_ADMIN'), updateCategory)
router.delete('/:id', authMiddleware, requireRole('STORE_ADMIN'), deleteCategory)

export default router
