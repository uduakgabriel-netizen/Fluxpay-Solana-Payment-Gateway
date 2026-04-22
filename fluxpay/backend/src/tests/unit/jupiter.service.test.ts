import { getSwapQuote, buildNonCustodialSwapTx } from '../../services/jupiter.service';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

describe('Jupiter Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null on quote error', async () => {
    mockFetch.mockResolvedValue({ ok: false, text: jest.fn().mockResolvedValue('API Error') });
    
    // Non-existent token for testing early exit
    const result = await getSwapQuote('FAKE', 'FAKE2', 10);
    expect(result).toBeNull();
  });

  it('gets a successful quote', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({ outAmount: '1000000' }) });
    const result = await getSwapQuote('SOL', 'USDC', 1);
    expect(mockFetch).toHaveBeenCalled();
    expect(result?.outAmount).toBe('1000000');
  });

  it('builds a non-custodial swap transaction', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({ swapTransaction: 'base64tx' }) });
    const result = await buildNonCustodialSwapTx({} as any, 'cust_wallet', 'merch_wallet');
    expect(result).toBe('base64tx');
    
    const reqBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(reqBody.useSharedAccounts).toBe(true);
    expect(reqBody.userPublicKey).toBe('cust_wallet');
    expect(reqBody.destinationTokenAccount).toBe('merch_wallet');
  });
});
