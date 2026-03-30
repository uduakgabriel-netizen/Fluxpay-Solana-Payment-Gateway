import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Users, Plus, Mail } from 'lucide-react'
import { listTeamMembers, inviteMember, removeMember, type TeamMember } from '@/services/api/team'

const roleColors: Record<string, string> = {
  OWNER: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  ADMIN: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  DEVELOPER: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400',
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'DEVELOPER' | 'ADMIN'>('DEVELOPER')
  const [inviting, setInviting] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchMembers = async () => {
    try {
      const res = await listTeamMembers()
      setMembers(res.data)
    } catch {
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMembers() }, [])

  const handleInvite = async () => {
    if (!inviteEmail) return
    setInviting(true)
    setMsg('')
    try {
      await inviteMember({ email: inviteEmail, role: inviteRole })
      setInviteEmail('')
      setMsg('Invite sent!')
      fetchMembers()
    } catch (err: any) {
      setMsg(err?.response?.data?.error || 'Failed to invite')
    } finally {
      setInviting(false)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await removeMember(id)
      fetchMembers()
    } catch {
      // handle error
    }
  }

  return (
    <DashboardLayout pageTitle="Team">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage team members and permissions</p>
          </div>
        </div>

        {/* Invite form */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Invite by Email</h3>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] flex-1">
              <Mail size={16} className="text-gray-400 flex-shrink-0" />
              <input
                type="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none w-full"
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white outline-none"
            >
              <option value="DEVELOPER">Developer</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail}
              className="px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {inviting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
          {msg && (
            <p className={`text-xs mt-2 font-medium ${msg.includes('sent') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {msg}
            </p>
          )}
        </div>

        {/* Members list */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">
              <p className="text-sm text-gray-400 animate-pulse">Loading team...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="p-10 text-center">
              <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No team members yet</p>
            </div>
          ) : (
            members.map((member, i) => (
              <div key={member.id} className={`flex items-center justify-between p-5 ${i < members.length - 1 ? 'border-b border-gray-100 dark:border-white/[0.04]' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#14B8A6] flex items-center justify-center text-white text-sm font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.name}</p>
                      {member.status === 'PENDING' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">PENDING</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${roleColors[member.role] || roleColors['DEVELOPER']}`}>
                    {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                  </span>
                  {member.role !== 'OWNER' && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
