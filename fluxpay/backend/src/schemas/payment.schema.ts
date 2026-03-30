import { z } from 'zod';
import { SUPPORTED_TOKENS } from '../utils/solana';

const walletAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const createPaymentSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(1_000_000, 'Amount cannot exceed 1,000,000'),
  token: z
    .string()
    .refine(
      (val) => SUPPORTED_TOKENS.includes(val.toUpperCase() as any),
      `Token must be one of: ${SUPPORTED_TOKENS.join(', ')}`
    ),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  customerWallet: z
    .string()
    .regex(walletAddressRegex, 'Invalid Solana wallet address')
    .optional()
    .or(z.literal('')),
  metadata: z.record(z.any()).optional(),
});

export const listPaymentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .enum(['PENDING', 'CONFIRMED', 'SWAPPED', 'COMPLETED', 'FAILED', 'EXPIRED'])
    .optional(),
  token: z.string().optional(),
  fromDate: z.string().datetime({ offset: true }).optional().or(z.string().optional()),
  toDate: z.string().datetime({ offset: true }).optional().or(z.string().optional()),
  search: z.string().optional(),
});

export const exportPaymentsSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  status: z
    .enum(['PENDING', 'CONFIRMED', 'SWAPPED', 'COMPLETED', 'FAILED', 'EXPIRED'])
    .optional(),
  token: z.string().optional(),
});
