import { create } from 'zustand'

export type DrawingTool = 
  | 'select' 
  | 'pencil' 
  | 'rectangle' 
  | 'circle' 
  | 'ellipse' 
  | 'arrow' 
  | 'line' 
  | 'text' 
  | 'pan' 
  | 'eraser'

export interface CanvasSettings {
  strokeColor: string
  fillColor: string
  strokeWidth: number
  opacity: number
}

interface UIState {
  theme: 'light' | 'dark'
  activeTool: DrawingTool
  canvasSettings: CanvasSettings
  zoom: number
  isSidebarOpen: boolean
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setActiveTool: (tool: DrawingTool) => void
  setCanvasSettings: (settings: Partial<CanvasSettings>) => void
  setZoom: (zoom: number) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  activeTool: 'select',
  canvasSettings: {
    strokeColor: '#aa3bff',
    fillColor: 'transparent',
    strokeWidth: 3,
    opacity: 1,
  },
  zoom: 1,
  isSidebarOpen: false,

  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme })
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', newTheme)
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { theme: newTheme }
    })
  },

  setActiveTool: (tool) => set({ activeTool: tool }),

  setCanvasSettings: (settings) => set((state) => ({
    canvasSettings: { ...state.canvasSettings, ...settings }
  })),

  setZoom: (zoom) => set({ zoom }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))
