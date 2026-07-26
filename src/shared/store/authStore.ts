import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

export interface Member {
  id: string
  email: string | null
  name: string | null
  avatarUrl: string | null
}

interface AuthState {
  session: Session | null
  member: Member | null
  isLoading: boolean
  hasNode: boolean | null
  setSession: (session: Session | null) => void
  setMember: (member: Member | null) => void
  setLoading: (isLoading: boolean) => void
  setHasNode: (hasNode: boolean | null) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  member: null,
  isLoading: true,
  hasNode: null,
  setSession: (session) => set({ session }),
  setMember: (member) => set({ member }),
  setLoading: (isLoading) => set({ isLoading }),
  setHasNode: (hasNode) => set({ hasNode }),
}))
