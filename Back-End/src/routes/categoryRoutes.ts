import { Router } from 'express'
import {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/', authMiddleware, listCategories)
router.post('/', authMiddleware, createCategory)
router.get('/:id', authMiddleware, getCategory)
router.put('/:id', authMiddleware, updateCategory)
router.delete('/:id', authMiddleware, deleteCategory)

export default router
