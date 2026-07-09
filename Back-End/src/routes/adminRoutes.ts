import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/requireRole'
import { createUserAsStoreAdmin, createStoreAsAdmin, selectStoreAsAdmin } from '../controllers/adminController'

const router = Router()

router.post('/users/new', authMiddleware, requireRole('STORE_ADMIN'), createUserAsStoreAdmin)

router.post('/store/new', authMiddleware, requireRole('ADMIN'), createStoreAsAdmin)

router.post('/select-store', authMiddleware, requireRole('STORE_ADMIN'), selectStoreAsAdmin)

export default router
