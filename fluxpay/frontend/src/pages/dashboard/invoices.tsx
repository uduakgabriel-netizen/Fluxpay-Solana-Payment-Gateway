import DashboardLayout from '@/components/dashboard/layout'
import { FileText, Download, Plus, Search } from 'lucide-react'

const mockInvoices = [
  { id: 'INV-001', customer: 'Acme Corp', amount: '$2,500.00', status: 'paid', date: 'Mar 20, 2026', due: 'Mar 25, 2026' },
  { id: 'INV-002', customer: 'TechStart Inc', amount: '$1,200.00', status: 'sent', date: 'Mar 22, 2026', due: 'Mar 30, 2026' },
  { id: 'INV-003', customer: 'Web3 Studio', amount: '$800.00', status: 'draft', date: 'Mar 25, 2026', due: 'Apr 5, 2026' },
  { id: 'INV-004', customer: 'DeFi Labs', amount: '$3,400.00', status: 'overdue', date: 'Mar 1, 2026', due: 'Mar 15, 2026' },
]

const statusStyles: Record<string, string> = {
  paid: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  sent: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  draft: 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400',
  overdue: 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400',
}

export default function InvoicesPage() {
  return (
    <DashboardLayout pageTitle="Invoices">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage invoices</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer">
            <Plus size={16} />
            Create Invoice
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Invoice</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Customer</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Amount</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Due Date</th>
                  <th className="text-right px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{inv.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{inv.customer}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{inv.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyles[inv.status]}`}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{inv.due}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors cursor-pointer">
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
