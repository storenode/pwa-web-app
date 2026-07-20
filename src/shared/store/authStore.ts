import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

export interface Member {
  id: string
  email: string | null
  name: string | null
}

interface AuthState {
  session: Session | null
  member: Member | null
  isLoading: boolean
  setSession: (session: Session | null) => void
  setMember: (member: Member | null) => void
  setLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  member: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setMember: (member) => set({ member }),
  setLoading: (isLoading) => set({ isLoading }),
}))
