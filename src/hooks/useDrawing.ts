import { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import type { CanvasObject, Point, ObjectType } from '@/types/canvas'
import { useCanvasStore } from '@/store/canvasStore'
import { useToolStore } from '@/store/toolStore'
import { useSocketStore } from '@/store/socketStore'
import { socketClient } from '@/socket/socketClient'
import { useHistoryStore } from '@/store/historyStore'

export const useDrawing = () => {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentObject, setCurrentObject] = useState<CanvasObject | null>(null)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [editingText, setEditingText] = useState<{ id: string; text: string; x: number; y: number } | null>(null)

  const addObject = useCanvasStore((state) => state.addObject)
  const updateObject = useCanvasStore((state) => state.updateObject)
  const currentTool = useToolStore((state) => state.currentTool)
  const strokeColor = useToolStore((state) => state.strokeColor)
  const fillColor = useToolStore((state) => state.fillColor)
  const strokeWidth = useToolStore((state) => state.strokeWidth)
  const opacity = useToolStore((state) => state.opacity)
  const socketId = useSocketStore((state) => state.socketId)

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const viewport = useCanvasStore.getState().viewport
    return {
      x: (e.clientX - rect.left - viewport.x) / viewport.zoom,
      y: (e.clientY - rect.top - viewport.y) / viewport.zoom
    }
  }, [])

  const createObject = useCallback((type: ObjectType, x: number, y: number): CanvasObject => {
    return {
      id: nanoid(),
      userId: socketId || 'local-user',
      type,
      x,
      y,
      width: 0,
      height: 0,
      rotation: 0,
      strokeColor,
      fillColor,
      strokeWidth,
      opacity,
      points: type === 'pencil' ? [{ x, y }] : undefined,
      text: type === 'text' ? '' : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }, [strokeColor, fillColor, strokeWidth, opacity, socketId])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'selection' || currentTool === 'pan' || currentTool === 'zoom') return
    
    const point = getCanvasCoordinates(e)
    
    // Text tool triggers on single click
    if (currentTool === 'text') {
      const newObj = createObject('text', point.x, point.y)
      newObj.text = ''
      newObj.width = 100
      newObj.height = 20
      addObject(newObj, false) // false = no history yet
      setEditingText({ id: newObj.id, text: '', x: e.clientX, y: e.clientY })
      return
    }

    setStartPoint(point)
    setIsDrawing(true)

    const type: ObjectType = currentTool === 'eraser' ? 'pencil' : currentTool as ObjectType
    const newObj = createObject(type, point.x, point.y)
    
    if (currentTool === 'eraser') {
      newObj.metadata = { isEraser: true }
      newObj.strokeWidth = Math.max(20, newObj.strokeWidth * 2) // Make eraser thicker
    }
    
    setCurrentObject(newObj)
    addObject(newObj, false)
    socketClient.emitDrawStart(newObj)
  }, [currentTool, getCanvasCoordinates, createObject, addObject])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentObject || !startPoint) return

    const point = getCanvasCoordinates(e)
    const dx = point.x - startPoint.x
    const dy = point.y - startPoint.y

    if (currentObject.type === 'pencil') {
      // Free drawing - add points
      const updatedPoints = [...(currentObject.points || []), point]
      const updates = {
        points: updatedPoints,
        width: Math.max(currentObject.width, dx),
        height: Math.max(currentObject.height, dy)
      }
      updateObject(currentObject.id, updates, false)
      setCurrentObject({ ...currentObject, points: updatedPoints })
      socketClient.emitDrawUpdate(currentObject.id, updates)
    } else {
      // Shape drawing - update dimensions
      const updates = { width: dx, height: dy }
      updateObject(currentObject.id, updates, false)
      setCurrentObject({ ...currentObject, width: dx, height: dy })
      socketClient.emitDrawUpdate(currentObject.id, updates)
    }
  }, [isDrawing, currentObject, startPoint, getCanvasCoordinates, updateObject])

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentObject) return

    // Finalize the object
    updateObject(currentObject.id, {
      updatedAt: Date.now()
    }, false)
    
    const finalObject = useCanvasStore.getState().objects.find(o => o.id === currentObject.id)
    if (finalObject) {
      useHistoryStore.getState().pushAction({ type: 'add', object: finalObject })
    }

    socketClient.emitDrawEnd(currentObject.id)

    setIsDrawing(false)
    setCurrentObject(null)
    setStartPoint(null)
  }, [isDrawing, currentObject, updateObject])

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Keep this for future if we want to double click to edit existing text
  }, [])

  const finalizeText = useCallback((text: string) => {
    if (!editingText) return
    if (text.trim()) {
      const finalObjectTemp = useCanvasStore.getState().objects.find(o => o.id === editingText.id)
      const strokeWidth = finalObjectTemp?.strokeWidth || 4
      const fontSize = Math.max(14, strokeWidth * 4)
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      let textWidth = Math.max(10, text.length * 10)
      if (ctx) {
        ctx.font = `${fontSize}px sans-serif`
        textWidth = ctx.measureText(text).width
      }
      
      updateObject(editingText.id, { text, width: textWidth, height: fontSize }, false)
      const finalObject = useCanvasStore.getState().objects.find(o => o.id === editingText.id)
      if (finalObject) {
         socketClient.emitDrawStart(finalObject)
         socketClient.emitDrawEnd(finalObject.id)
         useHistoryStore.getState().pushAction({ type: 'add', object: finalObject })
      }
    } else {
      useCanvasStore.getState().deleteObjects([editingText.id])
    }
    setEditingText(null)
  }, [editingText, updateObject])

  return {
    isDrawing,
    currentObject,
    editingText,
    setEditingText,
    finalizeText,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick
  }
}
