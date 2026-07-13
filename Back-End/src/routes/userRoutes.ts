import { Router } from 'express'
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole, requireAnyRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN']), listUsers)
router.get('/:id', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN']), getUser)
router.post('/', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN']), createUser)
router.put('/:id', authMiddleware, requireAnyRole(['ADMIN', 'STORE_ADMIN']), updateUser)
router.delete('/:id', authMiddleware, requireRole('ADMIN'), deleteUser)

export default router
