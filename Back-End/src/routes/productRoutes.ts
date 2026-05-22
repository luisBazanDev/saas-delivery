import { Router } from 'express'
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/', authMiddleware, listProducts)
router.post('/', authMiddleware, createProduct)
router.get('/:id', authMiddleware, getProduct)
router.put('/:id', authMiddleware, updateProduct)
router.delete('/:id', authMiddleware, deleteProduct)

export default router
