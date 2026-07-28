import { create } from 'zustand'
import type { CanvasObject, Viewport } from '@/types/canvas'
import { useHistoryStore } from './historyStore'

interface CanvasState {
  objects: CanvasObject[]
  selectedIds: string[]
  viewport: Viewport
  
  // Actions
  setObjects: (objects: CanvasObject[], recordHistory?: boolean) => void
  addObject: (object: CanvasObject, recordHistory?: boolean) => void
  updateObject: (id: string, updates: Partial<CanvasObject>, recordHistory?: boolean) => void
  deleteObjects: (ids: string[], recordHistory?: boolean) => void
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void
  setViewport: (viewport: Partial<Viewport>) => void
  resetViewport: () => void
  clearCanvas: () => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  objects: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },

  setObjects: (objects, recordHistory = false) => {
    if (recordHistory) {
      const previousOrder = get().objects.map((obj) => obj.id)
      const currentOrder = objects.map((obj) => obj.id)
      if (previousOrder.join(',') !== currentOrder.join(',')) {
        useHistoryStore.getState().pushAction({ 
          type: 'reorder', 
          previousOrder, 
          currentOrder 
        })
      }
    }
    set({ objects })
  },
  
  addObject: (object, recordHistory = true) => {
    if (recordHistory) {
      useHistoryStore.getState().pushAction({ type: 'add', object })
    }
    set((state) => ({
      objects: [...state.objects, object]
    }))
  },

  updateObject: (id, updates, recordHistory = true) => {
    if (recordHistory) {
      const previous = get().objects.find((obj) => obj.id === id)
      if (previous) {
        const current = { ...previous, ...updates, updatedAt: Date.now() }
        useHistoryStore.getState().pushAction({ type: 'update', id, previous, current })
      }
    }
    set((state) => ({
      objects: state.objects.map((obj) => 
        obj.id === id 
          ? { ...obj, ...updates, updatedAt: Date.now() } 
          : obj
      )
    }))
  },

  deleteObjects: (ids, recordHistory = true) => {
    if (recordHistory && ids.length > 0) {
      const objectsToDelete = get().objects.filter((obj) => ids.includes(obj.id))
      useHistoryStore.getState().pushAction({ type: 'delete', objects: objectsToDelete })
    }
    set((state) => ({
      objects: state.objects.filter((obj) => !ids.includes(obj.id)),
      selectedIds: state.selectedIds.filter((id) => !ids.includes(id))
    }))
  },

  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),

  setViewport: (viewportUpdates) => set((state) => ({
    viewport: { ...state.viewport, ...viewportUpdates }
  })),

  resetViewport: () => set({ viewport: { x: 0, y: 0, zoom: 1 } }),

  clearCanvas: () => {
    const objects = get().objects
    if (objects.length > 0) {
      useHistoryStore.getState().pushAction({ type: 'delete', objects })
    }
    set({ objects: [], selectedIds: [] })
  }
}))
