import DashboardLayout from '@/components/dashboard/layout'
import { Users, Plus, Mail, Shield } from 'lucide-react'

const mockMembers = [
  { id: 1, name: 'You', email: 'merchant@fluxpay.io', role: 'Owner', status: 'active', avatar: 'M' },
  { id: 2, name: 'Alex Chen', email: 'alex@company.com', role: 'Admin', status: 'active', avatar: 'A' },
  { id: 3, name: 'Sarah Kim', email: 'sarah@company.com', role: 'Developer', status: 'active', avatar: 'S' },
  { id: 4, name: 'Invited User', email: 'dev@contractor.io', role: 'Developer', status: 'pending', avatar: '?' },
]

const roleColors: Record<string, string> = {
  Owner: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  Admin: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Developer: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400',
}

export default function TeamPage() {
  return (
    <DashboardLayout pageTitle="Team">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage team members and permissions</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer">
            <Plus size={16} />
            Invite Member
          </button>
        </div>

        {/* Invite form */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Invite by Email</h3>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] flex-1">
              <Mail size={16} className="text-gray-400 flex-shrink-0" />
              <input type="email" placeholder="email@example.com" className="bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none w-full" />
            </div>
            <select className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white outline-none">
              <option>Developer</option>
              <option>Admin</option>
            </select>
            <button className="px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
              Send Invite
            </button>
          </div>
        </div>

        {/* Members list */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
          {mockMembers.map((member, i) => (
            <div key={member.id} className={`flex items-center justify-between p-5 ${i < mockMembers.length - 1 ? 'border-b border-gray-100 dark:border-white/[0.04]' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#14B8A6] flex items-center justify-center text-white text-sm font-bold">
                  {member.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.name}</p>
                    {member.status === 'pending' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">PENDING</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${roleColors[member.role]}`}>
                  {member.role}
                </span>
                {member.role !== 'Owner' && (
                  <button className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
