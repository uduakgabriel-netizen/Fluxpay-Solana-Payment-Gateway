import { logger } from '../utils/logger';
import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { AuthRequest } from '../types/auth.types';
import { cacheService } from '../services/cache.service';

const prisma = new PrismaClient();

/**
 * API Key authentication middleware
 * Verifies API key from Authorization header: Bearer sk_live_xxx
 * Rejects revoked keys, tracks usage (lastUsed, requestCount, lastIp)
 */
export const requireApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No API key provided. Use Authorization: Bearer sk_live_xxx' });
      return;
    }

    const apiKey = authHeader.replace('Bearer ', '');

    // Hash the API key to compare with stored hash
    const keyHash = createHash('sha256').update(apiKey).digest('hex');

    const cacheKey = `apikey:${keyHash}`;
    let apiKeyRecord: any = await cacheService.get(cacheKey);

    if (!apiKeyRecord) {
      // Find the API key in the database
      apiKeyRecord = await prisma.apiKey.findUnique({
        where: { keyHash },
        include: { merchant: true },
      });

      if (apiKeyRecord && !apiKeyRecord.revoked) {
        await cacheService.set(cacheKey, apiKeyRecord, 60 * 60); // 1 hour TTL
      }
    }

    if (!apiKeyRecord) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    // Check if key has been revoked
    if (apiKeyRecord.revoked) {
      res.status(401).json({ error: 'API key has been revoked' });
      return;
    }

    // Get client IP
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // Update usage tracking (lastUsed, requestCount, lastIp)
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: {
        lastUsed: new Date(),
        requestCount: { increment: 1 },
        lastIp: clientIp,
      },
    });

    // Attach merchant to request
    req.merchant = {
      id: apiKeyRecord.merchant.id,
      walletAddress: apiKeyRecord.merchant.walletAddress,
      email: apiKeyRecord.merchant.email,
      businessName: apiKeyRecord.merchant.businessName,
    };

    next();
  } catch (error) {
    logger.error('API Key middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Combined auth middleware: accepts either JWT Bearer token OR API key
 * This allows both dashboard (JWT) and programmatic (API key) access
 */
export const requireAuthOrApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No authentication provided' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  // If it looks like an API key (starts with sk_), use API key auth
  if (token.startsWith('sk_')) {
    return requireApiKey(req, res, next);
  }

  // Otherwise try JWT auth
  const { requireAuth } = await import('./auth.middleware');
  return requireAuth(req, res, next);
};
