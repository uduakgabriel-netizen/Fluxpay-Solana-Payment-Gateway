import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { FileText, Download, Plus, X } from 'lucide-react'
import { listInvoices, createInvoice, updateInvoiceStatus, deleteInvoice, type Invoice, type InvoiceListResponse } from '@/services/api/invoices'

const statusStyles: Record<string, string> = {
  PAID: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  SENT: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  DRAFT: 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400',
  OVERDUE: 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400',
  CANCELLED: 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-500',
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ customer: '', customerEmail: '', amount: '', description: '', dueDate: '' })

  const fetchInvoices = async () => {
    try {
      const res = await listInvoices()
      setInvoices(res.data)
    } catch {
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInvoices() }, [])

  const handleCreate = async () => {
    if (!form.customer || !form.amount || !form.dueDate) return
    setCreating(true)
    try {
      await createInvoice({
        customer: form.customer,
        customerEmail: form.customerEmail || undefined,
        amount: parseFloat(form.amount),
        description: form.description || undefined,
        dueDate: form.dueDate,
      })
      setForm({ customer: '', customerEmail: '', amount: '', description: '', dueDate: '' })
      setShowCreate(false)
      fetchInvoices()
    } catch {
      // handle error
    } finally {
      setCreating(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateInvoiceStatus(id, status)
      fetchInvoices()
    } catch {
      // handle error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteInvoice(id)
      fetchInvoices()
    } catch {
      // handle error
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <DashboardLayout pageTitle="Invoices">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage invoices</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <Plus size={16} />
            Create Invoice
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New Invoice</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <input
                type="text"
                placeholder="Customer name *"
                value={form.customer}
                onChange={(e) => setForm(f => ({ ...f, customer: e.target.value }))}
                className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors"
              />
              <input
                type="email"
                placeholder="Customer email"
                value={form.customerEmail}
                onChange={(e) => setForm(f => ({ ...f, customerEmail: e.target.value }))}
                className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors"
              />
              <input
                type="number"
                placeholder="Amount (USD) *"
                value={form.amount}
                onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors"
              />
              <input
                type="date"
                placeholder="Due date *"
                value={form.dueDate}
                onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6]/40 transition-colors mb-4"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !form.customer || !form.amount || !form.dueDate}
              className="px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">
              <p className="text-sm text-gray-400 animate-pulse">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-10 text-center">
              <FileText size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No invoices yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Create your first invoice above</p>
            </div>
          ) : (
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
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{inv.customer}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyles[inv.status] || statusStyles['DRAFT']}`}>
                          {inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(inv.dueDate)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status === 'DRAFT' && (
                            <>
                              <button onClick={() => handleStatusUpdate(inv.id, 'SENT')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">Send</button>
                              <button onClick={() => handleDelete(inv.id)} className="text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer">Delete</button>
                            </>
                          )}
                          {inv.status === 'SENT' && (
                            <button onClick={() => handleStatusUpdate(inv.id, 'PAID')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer">Mark Paid</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
