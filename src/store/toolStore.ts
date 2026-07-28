import { create } from 'zustand'
import type { ToolType } from '@/types/canvas'

interface ToolState {
  currentTool: ToolType
  strokeColor: string
  fillColor: string
  strokeWidth: number
  opacity: number
  fontSize: number
  fontFamily: string
  
  // Actions
  setCurrentTool: (tool: ToolType) => void
  setStrokeColor: (color: string) => void
  setFillColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setOpacity: (opacity: number) => void
  setFontSize: (fontSize: number) => void
  setFontFamily: (fontFamily: string) => void
  resetSettings: () => void
}

export const useToolStore = create<ToolState>((set) => ({
  currentTool: 'pencil',
  strokeColor: '#aa3bff',
  fillColor: 'transparent',
  strokeWidth: 4,
  opacity: 1,
  fontSize: 18,
  fontFamily: 'Inter, system-ui, sans-serif',

  setCurrentTool: (tool) => set({ currentTool: tool }),
  
  setStrokeColor: (color) => set({ strokeColor: color }),
  
  setFillColor: (color) => set({ fillColor: color }),
  
  setStrokeWidth: (width) => set({ strokeWidth: Math.max(1, Math.min(20, width)) }),
  
  setOpacity: (opacity) => set({ opacity: Math.max(0.1, Math.min(1, opacity)) }),

  setFontSize: (fontSize) => set({ fontSize: Math.max(10, Math.min(72, fontSize)) }),

  setFontFamily: (fontFamily) => set({ fontFamily }),
  
  resetSettings: () => set({
    currentTool: 'pencil',
    strokeColor: '#aa3bff',
    fillColor: 'transparent',
    strokeWidth: 4,
    opacity: 1,
    fontSize: 18,
    fontFamily: 'Inter, system-ui, sans-serif',
  })
}))
