import { useState, useCallback } from 'react'
import type { CanvasObject, Point } from '@/types/canvas'
import { useCanvasStore } from '@/store/canvasStore'
import { useToolStore } from '@/store/toolStore'


export const useSelection = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState<Point | null>(null)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [originalObject, setOriginalObject] = useState<CanvasObject | null>(null)

  const selectedIds = useCanvasStore((state) => state.selectedIds)
  const objects = useCanvasStore((state) => state.objects)
  const setSelectedIds = useCanvasStore((state) => state.setSelectedIds)
  const updateObject = useCanvasStore((state) => state.updateObject)
  const currentTool = useToolStore((state) => state.currentTool)

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const viewport = useCanvasStore.getState().viewport
    return {
      x: (e.clientX - rect.left - viewport.x) / viewport.zoom,
      y: (e.clientY - rect.top - viewport.y) / viewport.zoom
    }
  }, [])

  const isPointInObject = useCallback((point: Point, obj: CanvasObject): boolean => {
    const { x, y, width, height, rotation } = obj
    
    // For rotated objects, we need to transform the point to object's local space
    if (rotation !== 0) {
      const cx = x + width / 2
      const cy = y + height / 2
      const cos = Math.cos(-rotation)
      const sin = Math.sin(-rotation)
      const dx = point.x - cx
      const dy = point.y - cy
      const localX = dx * cos - dy * sin + cx
      const localY = dx * sin + dy * cos + cy
      
      return localX >= Math.min(x, x + width) && 
             localX <= Math.max(x, x + width) &&
             localY >= Math.min(y, y + height) && 
             localY <= Math.max(y, y + height)
    }

    return point.x >= Math.min(x, x + width) && 
           point.x <= Math.max(x, x + width) &&
           point.y >= Math.min(y, y + height) && 
           point.y <= Math.max(y, y + height)
  }, [])

  const getResizeHandle = useCallback((point: Point, obj: CanvasObject): string | null => {
    const handleSize = 10
    const cx = obj.x + obj.width / 2
    const cy = obj.y + obj.height / 2

    const rotatePoint = (x: number, y: number) => {
      const cos = Math.cos(obj.rotation)
      const sin = Math.sin(obj.rotation)
      const dx = x - cx
      const dy = y - cy
      return {
        x: dx * cos - dy * sin + cx,
        y: dx * sin + dy * cos + cy
      }
    }

    const handles = [
      { name: 'tl', ...rotatePoint(obj.x, obj.y) },
      { name: 'tr', ...rotatePoint(obj.x + obj.width, obj.y) },
      { name: 'bl', ...rotatePoint(obj.x, obj.y + obj.height) },
      { name: 'br', ...rotatePoint(obj.x + obj.width, obj.y + obj.height) },
    ]

    for (const handle of handles) {
      if (
        point.x >= handle.x - handleSize && 
        point.x <= handle.x + handleSize &&
        point.y >= handle.y - handleSize && 
        point.y <= handle.y + handleSize
      ) {
        return handle.name
      }
    }
    return null
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool !== 'selection') return

    const point = getCanvasCoordinates(e)
    
    // Check if clicking on resize handle of selected object
    if (selectedIds.length === 1) {
      const selectedObj = objects.find((obj) => obj.id === selectedIds[0])
      if (selectedObj) {
        const handle = getResizeHandle(point, selectedObj)
        if (handle) {
          setIsResizing(true)
          setResizeHandle(handle)
          setOriginalObject(selectedObj)
          setDragStart(point)
          return
        }
      }
    }

    // Check if clicking on an object
    let clickedObjectId: string | null = null
    
    // Check in reverse order (topmost first)
    for (let i = objects.length - 1; i >= 0; i--) {
      if (isPointInObject(point, objects[i])) {
        clickedObjectId = objects[i].id
        break
      }
    }

    if (clickedObjectId) {
      if (e.shiftKey) {
        // Multi-select with shift
        if (selectedIds.includes(clickedObjectId)) {
          setSelectedIds(selectedIds.filter((id) => id !== clickedObjectId))
        } else {
          setSelectedIds([...selectedIds, clickedObjectId])
        }
      } else {
        // Single select
        setSelectedIds([clickedObjectId])
      }
      setIsDragging(true)
      setDragStart(point)
    } else {
      // Clicked on empty space - clear selection
      setSelectedIds([])
    }
  }, [currentTool, getCanvasCoordinates, selectedIds, objects, isPointInObject, getResizeHandle, setSelectedIds])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool !== 'selection') return

    const point = getCanvasCoordinates(e)

    if (isResizing && resizeHandle && originalObject && selectedIds.length === 1) {
      const dx = point.x - dragStart!.x
      const dy = point.y - dragStart!.y
      const obj = originalObject
      
      const cos = Math.cos(-obj.rotation)
      const sin = Math.sin(-obj.rotation)
      const localDx = dx * cos - dy * sin
      const localDy = dx * sin + dy * cos

      let newX = obj.x
      let newY = obj.y
      let newWidth = obj.width
      let newHeight = obj.height

      switch (resizeHandle) {
        case 'br':
          newWidth = obj.width + localDx
          newHeight = obj.height + localDy
          break
        case 'bl':
          newX = obj.x + localDx
          newWidth = obj.width - localDx
          newHeight = obj.height + localDy
          break
        case 'tr':
          newY = obj.y + localDy
          newWidth = obj.width + localDx
          newHeight = obj.height - localDy
          break
        case 'tl':
          newX = obj.x + localDx
          newY = obj.y + localDy
          newWidth = obj.width - localDx
          newHeight = obj.height - localDy
          break
      }

      // Maintain center position when resizing rotated objects
      if (obj.rotation !== 0) {
          const oldCx = obj.x + obj.width / 2
          const oldCy = obj.y + obj.height / 2
          const newCx = newX + newWidth / 2
          const newCy = newY + newHeight / 2
          
          const shiftX = newCx - oldCx
          const shiftY = newCy - oldCy
          
          const rCos = Math.cos(obj.rotation)
          const rSin = Math.sin(obj.rotation)
          
          const globalShiftX = shiftX * rCos - shiftY * rSin
          const globalShiftY = shiftX * rSin + shiftY * rCos
          
          const finalCx = oldCx + globalShiftX
          const finalCy = oldCy + globalShiftY
          
          newX = finalCx - newWidth / 2
          newY = finalCy - newHeight / 2
      }

      updateObject(obj.id, { x: newX, y: newY, width: newWidth, height: newHeight })
    } else if (isDragging && dragStart) {
      const dx = point.x - dragStart.x
      const dy = point.y - dragStart.y

      // Move all selected objects
      for (const id of selectedIds) {
        const obj = objects.find((o) => o.id === id)
        if (obj) {
          updateObject(id, { x: obj.x + dx, y: obj.y + dy })
        }
      }

      setDragStart(point)
    }
  }, [currentTool, getCanvasCoordinates, isResizing, resizeHandle, originalObject, selectedIds, dragStart, updateObject, objects, isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
    setOriginalObject(null)
    setDragStart(null)
  }, [])

  const deleteSelected = useCallback(() => {
    if (selectedIds.length > 0) {
      const { deleteObjects } = useCanvasStore.getState()
      deleteObjects(selectedIds)
    }
  }, [selectedIds])

  const duplicateSelected = useCallback(() => {
    if (selectedIds.length > 0) {
      const { addObject } = useCanvasStore.getState()
      const objectsToDuplicate = objects.filter((obj) => selectedIds.includes(obj.id))
      
      for (const obj of objectsToDuplicate) {
        addObject({
          ...obj,
          id: `${obj.id}-copy`,
          x: obj.x + 20,
          y: obj.y + 20,
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
      }
    }
  }, [selectedIds, objects])

  const bringForward = useCallback(() => {
    if (selectedIds.length === 1) {
      const { setObjects } = useCanvasStore.getState()
      const id = selectedIds[0]
      const currentIndex = objects.findIndex((obj) => obj.id === id)
      if (currentIndex < objects.length - 1) {
        const newObjects = [...objects]
        const [obj] = newObjects.splice(currentIndex, 1)
        newObjects.push(obj)
        setObjects(newObjects)
      }
    }
  }, [selectedIds, objects])

  const sendBackward = useCallback(() => {
    if (selectedIds.length === 1) {
      const { setObjects } = useCanvasStore.getState()
      const id = selectedIds[0]
      const currentIndex = objects.findIndex((obj) => obj.id === id)
      if (currentIndex > 0) {
        const newObjects = [...objects]
        const [obj] = newObjects.splice(currentIndex, 1)
        newObjects.unshift(obj)
        setObjects(newObjects)
      }
    }
  }, [selectedIds, objects])

  return {
    isDragging,
    isResizing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    deleteSelected,
    duplicateSelected,
    bringForward,
    sendBackward
  }
}
