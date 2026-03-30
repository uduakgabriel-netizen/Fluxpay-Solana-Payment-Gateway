import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

export interface TeamListResponse {
  data: TeamMember[]
  total: number
}

export interface InviteMemberInput {
  email: string
  role?: 'ADMIN' | 'DEVELOPER'
}

// ─── API Functions ──────────────────────────────────────────

export async function listTeamMembers(): Promise<TeamListResponse> {
  const { data } = await apiClient.get<TeamListResponse>('/team')
  return data
}

export async function inviteMember(input: InviteMemberInput) {
  const { data } = await apiClient.post('/team/invite', input)
  return data
}

export async function removeMember(id: string) {
  const { data } = await apiClient.delete(`/team/${id}`)
  return data
}

export async function updateMemberRole(id: string, role: 'ADMIN' | 'DEVELOPER') {
  const { data } = await apiClient.patch(`/team/${id}/role`, { role })
  return data
}
