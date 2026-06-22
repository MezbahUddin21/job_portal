// src/store/authStore.js
import { create } from 'zustand'

const stored = () => {
  try {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

export const useAuthStore = create((set, get) => ({
  user:  stored(),
  token: localStorage.getItem('token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token })
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },

  clearAuth: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  isAuthenticated: () => !!get().token,
  isAdmin:         () => get().user?.role === 'admin',
  isEmployer:      () => get().user?.role === 'employer',
  isCandidate:     () => get().user?.role === 'candidate',
}))
