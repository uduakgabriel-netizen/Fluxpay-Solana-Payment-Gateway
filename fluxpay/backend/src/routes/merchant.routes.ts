import express from 'express'
import { getMerchantInfo, updatePreferredToken, getMerchantBalance } from '../controllers/merchant.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = express.Router()

// Protected routes (require authentication)
router.get('/me', requireAuth, getMerchantInfo)
router.put('/preferred-token', requireAuth, updatePreferredToken)
router.get('/balance', requireAuth, getMerchantBalance)

export default router
