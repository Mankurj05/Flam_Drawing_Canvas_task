import { create } from 'zustand'
import type { CanvasObject } from '@/types/canvas'

type HistoryAction = 
  | { type: 'add'; object: CanvasObject }
  | { type: 'update'; id: string; previous: CanvasObject; current: CanvasObject }
  | { type: 'delete'; objects: CanvasObject[] }
  | { type: 'reorder'; previousOrder: string[]; currentOrder: string[] }

interface HistoryState {
  past: HistoryAction[]
  future: HistoryAction[]
  
  // Actions
  pushAction: (action: HistoryAction) => void
  popAction: () => HistoryAction | null
  peekFuture: () => HistoryAction | null
  shiftFuture: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  clear: () => void
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  pushAction: (action) => set((state) => ({
    past: [...state.past, action],
    future: [] // Clear future when new action is added
  })),

  popAction: () => {
    const { past } = get()
    if (past.length === 0) return null

    const action = past[past.length - 1]
    set((state) => ({
      past: state.past.slice(0, -1),
      future: [action, ...state.future]
    }))
    return action
  },

  peekFuture: () => {
    const { future } = get()
    return future.length > 0 ? future[0] : null
  },

  shiftFuture: () => {
    const { future } = get()
    if (future.length === 0) return

    const action = future[0]
    set((state) => ({
      past: [...state.past, action],
      future: state.future.slice(1)
    }))
  },

  canUndo: () => get().past.length > 0,
  
  canRedo: () => get().future.length > 0,

  clear: () => set({ past: [], future: [] })
}))
