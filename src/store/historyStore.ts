import { create } from 'zustand'
import type { HistoryAction } from '@/types/canvas'

interface HistoryState {
  past: HistoryAction[]
  future: HistoryAction[]
  limit: number
  pushAction: (action: HistoryAction) => void
  popAction: () => HistoryAction | null
  peekFuture: () => HistoryAction | null
  shiftFuture: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  clear: () => void
}

function trimHistory(entries: HistoryAction[], limit: number): HistoryAction[] {
  return entries.length > limit ? entries.slice(entries.length - limit) : entries
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  limit: 120,

  pushAction: (action) => {
    set((state) => ({
      past: trimHistory([...state.past, action], get().limit),
      future: [],
    }))
  },

  popAction: () => {
    const { past } = get()
    if (past.length === 0) {
      return null
    }

    const action = past[past.length - 1]
    set((state) => ({
      past: state.past.slice(0, -1),
      future: [action, ...state.future],
    }))

    return action
  },

  peekFuture: () => {
    const { future } = get()
    return future.length > 0 ? future[0] : null
  },

  shiftFuture: () => {
    set((state) => ({
      future: state.future.slice(1),
    }))
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  clear: () => set({ past: [], future: [] }),
}))
