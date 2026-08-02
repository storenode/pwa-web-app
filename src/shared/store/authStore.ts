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
  setSession: (session: Session | null) => void
  setMember: (member: Member | null) => void
  setLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  member: null,
  isLoading: true,
  // Session objects always differ by token/expiry even for "the same"
  // signed-in user (e.g. a silent TOKEN_REFRESHED) — compare by user id
  // instead of reference so callers don't push needless re-renders.
  setSession: (session) => {
    const current = get().session
    if ((current?.user.id ?? null) === (session?.user.id ?? null)) return
    set({ session })
  },
  setMember: (member) => {
    const current = get().member
    if ((current?.id ?? null) === (member?.id ?? null)) return
    set({ member })
  },
  setLoading: (isLoading) => set({ isLoading }),
}))
