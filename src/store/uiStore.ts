import { create } from 'zustand'

interface UIState {
  theme: 'light' | 'dark'
  isSidebarOpen: boolean
  isCommandPaletteOpen: boolean
  recentRooms: string[]
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void
  setCommandPaletteOpen: (isOpen: boolean) => void
  addRecentRoom: (roomId: string) => void
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const saved = window.localStorage.getItem('theme')
  if (saved === 'light' || saved === 'dark') {
    return saved
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: getInitialTheme(),
  isSidebarOpen: false,
  isCommandPaletteOpen: false,
  recentRooms: [],

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }

    set({ theme })
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light'
    get().setTheme(nextTheme)
  },

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),

  addRecentRoom: (roomId) => set((state) => ({
    recentRooms: [roomId, ...state.recentRooms.filter((id) => id !== roomId)].slice(0, 8),
  })),
}))
