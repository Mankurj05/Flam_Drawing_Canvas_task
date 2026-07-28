import { create } from 'zustand'
import type { ToolType } from '@/types/canvas'

interface ToolState {
  currentTool: ToolType
  strokeColor: string
  fillColor: string
  strokeWidth: number
  opacity: number
  
  // Actions
  setCurrentTool: (tool: ToolType) => void
  setStrokeColor: (color: string) => void
  setFillColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setOpacity: (opacity: number) => void
  resetSettings: () => void
}

export const useToolStore = create<ToolState>((set) => ({
  currentTool: 'selection',
  strokeColor: '#000000',
  fillColor: 'transparent',
  strokeWidth: 2,
  opacity: 1,

  setCurrentTool: (tool) => set({ currentTool: tool }),
  
  setStrokeColor: (color) => set({ strokeColor: color }),
  
  setFillColor: (color) => set({ fillColor: color }),
  
  setStrokeWidth: (width) => set({ strokeWidth: Math.max(1, Math.min(20, width)) }),
  
  setOpacity: (opacity) => set({ opacity: Math.max(0.1, Math.min(1, opacity)) }),
  
  resetSettings: () => set({
    currentTool: 'selection',
    strokeColor: '#000000',
    fillColor: 'transparent',
    strokeWidth: 2,
    opacity: 1
  })
}))
