/**
 * TokenSelector — Dynamic token picker that allows manual selection of ANY token
 * from Jupiter's list via backend search API.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, CheckCircle2, Loader2, Zap } from 'lucide-react';

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://api.fluxpay.com/api';

const DEFAULT_ICON = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';

export interface Token {
  symbol: string;
  name: string;
  mint: string;
  logoUrl: string;
  decimals: number;
}

interface TokenSelectorProps {
  selected: Token | null;
  onSelect: (token: Token) => void;
  disabled?: boolean;
}

const COMMON_TOKENS: Token[] = [
  { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png', decimals: 9, name: 'Solana' },
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png', decimals: 6, name: 'USD Coin' },
  { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png', decimals: 6, name: 'Tether' },
  { symbol: 'BONK', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', logoUrl: 'https://arweave.net/hQiPZOsRZXG32Tjq8CDZvydg9qYp8c2w_AId_1y8vGo', decimals: 5, name: 'Bonk' },
  { symbol: 'JUP', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', logoUrl: 'https://static.jup.ag/jup/icon.png', decimals: 6, name: 'Jupiter' },
  { symbol: 'WIF', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm/logo.png', decimals: 6, name: 'dogwifhat' },
  { symbol: 'PYTH', mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', logoUrl: 'https://cryptologos.cc/logos/pyth-network-pyth-logo.png', decimals: 6, name: 'Pyth Network' },
];

export default function TokenSelector({ selected, onSelect, disabled }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Auto-focus search when opened
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/tokens/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.data) {
          setSearchResults(json.data);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      {/* Selected Token Button */}
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
          open
            ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.15)]'
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {selected ? (
          <div className="flex items-center space-x-3">
            <img
              src={selected.logoUrl || DEFAULT_ICON}
              alt={selected.symbol}
              className="w-8 h-8 rounded-full bg-white/10"
              onError={(e) => (e.currentTarget.src = DEFAULT_ICON)}
            />
            <div className="text-left">
              <div className="font-bold text-white text-sm">{selected.symbol}</div>
              <div className="text-xs text-gray-400">{selected.name}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Select a token to pay with</span>
        )}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-[#12122A] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search any token..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" />
              )}
            </div>
          </div>

          {/* Token List */}
          <div className="max-h-64 overflow-y-auto">
            {!query ? (
              <div className="p-2">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-2 px-2 tracking-wider">Common Tokens</div>
                <div className="grid grid-cols-2 gap-1.5 px-1">
                  {COMMON_TOKENS.map((token) => (
                    <button
                      key={token.mint}
                      onClick={() => {
                        onSelect(token);
                        setOpen(false);
                      }}
                      className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                        selected?.mint === token.mint ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <img
                        src={token.logoUrl || DEFAULT_ICON}
                        alt={token.symbol}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => (e.currentTarget.src = DEFAULT_ICON)}
                      />
                      <span className="text-sm font-semibold text-white">{token.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : searchResults.length === 0 && !isSearching ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No tokens found for "{query}"
              </div>
            ) : (
              <div className="py-1">
                {searchResults.map((token) => (
                  <button
                    key={token.mint}
                    onClick={() => {
                      onSelect(token);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors ${
                      selected?.mint === token.mint
                        ? 'bg-indigo-500/15'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={token.logoUrl || DEFAULT_ICON}
                        alt={token.symbol}
                        className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0"
                        onError={(e) => (e.currentTarget.src = DEFAULT_ICON)}
                      />
                      <div className="text-left min-w-0">
                        <div className="text-sm font-semibold text-white">{token.symbol}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[160px]">{token.name}</div>
                      </div>
                    </div>
                    {selected?.mint === token.mint && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
