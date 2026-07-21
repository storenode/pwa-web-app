import { create } from 'zustand'

interface NavState {
  activeLink: string
  setActiveLink: (path: string) => void
}

export const useNavStore = create<NavState>((set) => ({
  activeLink: '/dashboard',
  setActiveLink: (path) => set({ activeLink: path }),
}))
