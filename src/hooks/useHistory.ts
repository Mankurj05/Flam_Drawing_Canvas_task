import { useCallback } from 'react'
import { useHistoryStore } from '@/store/historyStore'
import { useCanvasStore } from '@/store/canvasStore'
import type { CanvasObject } from '@/types/canvas'

export const useHistory = () => {
  const pushAction = useHistoryStore((state) => state.pushAction)
  const popAction = useHistoryStore((state) => state.popAction)
  const peekFuture = useHistoryStore((state) => state.peekFuture)
  const shiftFuture = useHistoryStore((state) => state.shiftFuture)
  const canUndo = useHistoryStore((state) => state.canUndo)
  const canRedo = useHistoryStore((state) => state.canRedo)
  const clear = useHistoryStore((state) => state.clear)

  const undo = useCallback(() => {
    const action = popAction()
    if (!action) return

    const { setObjects, addObject, updateObject, deleteObjects } = useCanvasStore.getState()
    const objects = useCanvasStore.getState().objects

    switch (action.type) {
      case 'add':
        deleteObjects([action.object.id], false)
        break
      case 'update':
        updateObject(action.id, action.previous, false)
        break
      case 'delete':
        for (const obj of action.objects) {
          addObject(obj, false)
        }
        break
      case 'reorder':
        const reordered = [...objects].sort((a, b) => {
          const aIndex = action.previousOrder.indexOf(a.id)
          const bIndex = action.previousOrder.indexOf(b.id)
          return aIndex - bIndex
        })
        setObjects(reordered, false)
        break
    }
  }, [popAction])

  const redo = useCallback(() => {
    const action = peekFuture()
    if (!action) return

    shiftFuture()

    const { setObjects, addObject, updateObject, deleteObjects } = useCanvasStore.getState()
    const objects = useCanvasStore.getState().objects

    switch (action.type) {
      case 'add':
        addObject(action.object, false)
        break
      case 'update':
        updateObject(action.id, action.current, false)
        break
      case 'delete':
        deleteObjects(action.objects.map((obj) => obj.id), false)
        break
      case 'reorder':
        const reordered = [...objects].sort((a, b) => {
          const aIndex = action.currentOrder.indexOf(a.id)
          const bIndex = action.currentOrder.indexOf(b.id)
          return aIndex - bIndex
        })
        setObjects(reordered, false)
        break
    }
  }, [peekFuture, shiftFuture])

  const recordAdd = useCallback((object: CanvasObject) => {
    pushAction({ type: 'add', object })
  }, [pushAction])

  const recordUpdate = useCallback((id: string, previous: CanvasObject, current: CanvasObject) => {
    pushAction({ type: 'update', id, previous, current })
  }, [pushAction])

  const recordDelete = useCallback((objects: CanvasObject[]) => {
    pushAction({ type: 'delete', objects })
  }, [pushAction])

  const recordReorder = useCallback((previousOrder: string[], currentOrder: string[]) => {
    pushAction({ type: 'reorder', previousOrder, currentOrder })
  }, [pushAction])

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    recordAdd,
    recordUpdate,
    recordDelete,
    recordReorder
  }
}
