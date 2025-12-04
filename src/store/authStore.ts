// src/store/authStore.ts
// Purpose: Global auth state management using Zustand
// Stores user info, role, auth tokens (accessible across all components)

import create from 'zustand'
import { Role } from '@prisma/client'

interface AuthState {
  isLoggedIn: boolean
  user: {
    id: string
    email: string
    role: Role
    profileComplete: boolean
  } | null
  setUser: (user: AuthState['user']) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  logout: () => set({ user: null, isLoggedIn: false }),
}))
