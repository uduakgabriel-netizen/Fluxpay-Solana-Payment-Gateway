/**
 * Blockchain Routes
 *
 * Public and authenticated routes for blockchain operations.
 */

import { Router } from 'express';
import { requireAuthOrApiKey } from '../middleware/apikey.middleware';
import {
  getSupportedTokens,
  getBalance,
  getTransaction,
  getQuote,
  getNetworkInfo,
} from '../controllers/blockchain.controller';

const router = Router();

// Public routes (no auth needed)
router.get('/tokens', getSupportedTokens);
router.get('/network', getNetworkInfo);

// Authenticated routes
router.get('/balance/:address', requireAuthOrApiKey, getBalance);
router.get('/transaction/:signature', requireAuthOrApiKey, getTransaction);
router.get('/swap-quote', requireAuthOrApiKey, getQuote);

export default router;
