import { create } from 'zustand'
import type { CanvasObject, Viewport } from '@/types/canvas'

interface CanvasState {
  objects: CanvasObject[]
  selectedIds: string[]
  viewport: Viewport
  
  // Actions
  setObjects: (objects: CanvasObject[]) => void
  addObject: (object: CanvasObject) => void
  updateObject: (id: string, updates: Partial<CanvasObject>) => void
  deleteObjects: (ids: string[]) => void
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void
  setViewport: (viewport: Partial<Viewport>) => void
  resetViewport: () => void
  clearCanvas: () => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  objects: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },

  setObjects: (objects) => set({ objects }),
  
  addObject: (object) => set((state) => ({
    objects: [...state.objects, object]
  })),

  updateObject: (id, updates) => set((state) => ({
    objects: state.objects.map((obj) => 
      obj.id === id 
        ? { ...obj, ...updates, updatedAt: Date.now() } 
        : obj
    )
  })),

  deleteObjects: (ids) => set((state) => ({
    objects: state.objects.filter((obj) => !ids.includes(obj.id)),
    selectedIds: state.selectedIds.filter((id) => !ids.includes(id))
  })),

  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),

  setViewport: (viewportUpdates) => set((state) => ({
    viewport: { ...state.viewport, ...viewportUpdates }
  })),

  resetViewport: () => set({ viewport: { x: 0, y: 0, zoom: 1 } }),

  clearCanvas: () => set({ objects: [], selectedIds: [] })
}))
