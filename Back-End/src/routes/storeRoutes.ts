import { Router } from 'express'
import {
  createStore,
  listStores,
  getStore,
  updateStore,
  deleteStore,
} from '../controllers/storeController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/', authMiddleware, listStores)
router.post('/', authMiddleware, createStore)
router.get('/:id', authMiddleware, getStore)
router.put('/:id', authMiddleware, updateStore)
router.delete('/:id', authMiddleware, deleteStore)

export default router
