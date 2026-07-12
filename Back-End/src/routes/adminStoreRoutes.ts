import { Router } from 'express'
import {
  listStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  toggleStoreStatus,
} from '../controllers/adminStoreController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireRole('ADMIN'), listStores)
router.get('/:id', authMiddleware, requireRole('ADMIN'), getStore)
router.post('/', authMiddleware, requireRole('ADMIN'), createStore)
router.put('/:id', authMiddleware, requireRole('ADMIN'), updateStore)
router.delete('/:id', authMiddleware, requireRole('ADMIN'), deleteStore)
router.patch('/:id/toggle', authMiddleware, requireRole('ADMIN'), toggleStoreStatus)

export default router
