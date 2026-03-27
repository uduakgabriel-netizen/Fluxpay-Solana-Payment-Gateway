// Mock data for dashboard - easy to replace with real API calls later

export const mockMerchant = {
  name: 'FluxPay Labs',
  email: 'merchant@fluxpay.io',
  avatar: null,
  plan: 'Pro',
}

export const mockStats = {
  totalRevenue: {
    value: '$12,450',
    change: '+12%',
    trend: 'up' as const,
    label: 'Total Revenue',
    icon: 'DollarSign',
  },
  transactions: {
    value: '234',
    change: '+8%',
    trend: 'up' as const,
    label: 'Transactions',
    icon: 'ArrowUpDown',
  },
  pendingSettlements: {
    value: '$2,340',
    change: '-5%',
    trend: 'down' as const,
    label: 'Pending Settlements',
    icon: 'Clock',
  },
  successRate: {
    value: '99.8%',
    change: '+0.2%',
    trend: 'up' as const,
    label: 'Success Rate',
    icon: 'CheckCircle',
  },
}

export const mockRevenueData = [
  { date: 'Feb 25', amount: 3200 },
  { date: 'Feb 26', amount: 2800 },
  { date: 'Feb 27', amount: 4100 },
  { date: 'Feb 28', amount: 3600 },
  { date: 'Mar 01', amount: 4500 },
  { date: 'Mar 02', amount: 3900 },
  { date: 'Mar 03', amount: 5200 },
  { date: 'Mar 04', amount: 4800 },
  { date: 'Mar 05', amount: 5600 },
  { date: 'Mar 06', amount: 4200 },
  { date: 'Mar 07', amount: 3800 },
  { date: 'Mar 08', amount: 4900 },
  { date: 'Mar 09', amount: 5100 },
  { date: 'Mar 10', amount: 5800 },
  { date: 'Mar 11', amount: 4600 },
  { date: 'Mar 12', amount: 5300 },
  { date: 'Mar 13', amount: 6100 },
  { date: 'Mar 14', amount: 5700 },
  { date: 'Mar 15', amount: 6400 },
  { date: 'Mar 16', amount: 5900 },
  { date: 'Mar 17', amount: 7200 },
  { date: 'Mar 18', amount: 6800 },
  { date: 'Mar 19', amount: 7500 },
  { date: 'Mar 20', amount: 6200 },
  { date: 'Mar 21', amount: 7800 },
  { date: 'Mar 22', amount: 8200 },
  { date: 'Mar 23', amount: 7600 },
  { date: 'Mar 24', amount: 9100 },
  { date: 'Mar 25', amount: 8800 },
  { date: 'Mar 26', amount: 10200 },
]

export const mockTransactions = [
  {
    id: 'pay_1a2b3c4d',
    customer: '9Bv8...whFB',
    amount: '250.00',
    token: 'USDC',
    status: 'completed' as const,
    date: '2 mins ago',
  },
  {
    id: 'pay_5e6f7g8h',
    customer: '4Kx2...mN9P',
    amount: '1,200.00',
    token: 'SOL',
    status: 'completed' as const,
    date: '15 mins ago',
  },
  {
    id: 'pay_9i0j1k2l',
    customer: '7Ht5...pQ3R',
    amount: '89.50',
    token: 'USDT',
    status: 'pending' as const,
    date: '1 hour ago',
  },
  {
    id: 'pay_3m4n5o6p',
    customer: '2Ws6...vX8Y',
    amount: '5,000.00',
    token: 'USDC',
    status: 'completed' as const,
    date: '3 hours ago',
  },
  {
    id: 'pay_7q8r9s0t',
    customer: '6Lm1...kJ4H',
    amount: '450.00',
    token: 'BONK',
    status: 'failed' as const,
    date: '5 hours ago',
  },
]

export const mockTokenDistribution = [
  { name: 'USDC', value: 45, color: '#2563eb' },
  { name: 'SOL', value: 30, color: '#7c3aed' },
  { name: 'USDT', value: 15, color: '#0d9488' },
  { name: 'BONK', value: 10, color: '#f59e0b' },
]

export const mockNotifications = [
  { id: 1, message: 'New payment received: 250 USDC', time: '2m ago', read: false },
  { id: 2, message: 'Settlement completed: $4,200', time: '1h ago', read: false },
  { id: 3, message: 'API key rotated successfully', time: '3h ago', read: true },
]
