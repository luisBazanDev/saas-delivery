import { Router } from 'express'
import {
  createPayment,
  listPayments,
  getPayment,
  updatePayment,
  deletePayment,
} from '../controllers/paymentController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/requireRole'

const router = Router()

router.get('/', authMiddleware, requireRole('STORE_ADMIN'), listPayments)
router.post('/', authMiddleware, requireRole('STORE_ADMIN'), createPayment)
router.get('/:id', authMiddleware, requireRole('STORE_ADMIN'), getPayment)
router.put('/:id', authMiddleware, requireRole('STORE_ADMIN'), updatePayment)
router.delete('/:id', authMiddleware, requireRole('STORE_ADMIN'), deletePayment)

export default router
