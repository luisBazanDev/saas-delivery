import { Router } from 'express'
import { searchPlace, reverseGeocode } from '../controllers/geocodeController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/search', authMiddleware, searchPlace)
router.get('/reverse', authMiddleware, reverseGeocode)

export default router
