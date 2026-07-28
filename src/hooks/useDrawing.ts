import { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import type { CanvasObject, Point, ObjectType } from '@/types/canvas'
import { useCanvasStore } from '@/store/canvasStore'
import { useToolStore } from '@/store/toolStore'

export const useDrawing = () => {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentObject, setCurrentObject] = useState<CanvasObject | null>(null)
  const [startPoint, setStartPoint] = useState<Point | null>(null)

  const addObject = useCanvasStore((state) => state.addObject)
  const updateObject = useCanvasStore((state) => state.updateObject)
  const currentTool = useToolStore((state) => state.currentTool)
  const strokeColor = useToolStore((state) => state.strokeColor)
  const fillColor = useToolStore((state) => state.fillColor)
  const strokeWidth = useToolStore((state) => state.strokeWidth)
  const opacity = useToolStore((state) => state.opacity)

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }, [])

  const createObject = useCallback((type: ObjectType, x: number, y: number): CanvasObject => {
    return {
      id: nanoid(),
      userId: 'local-user', // Will be replaced with actual user ID
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
  }, [strokeColor, fillColor, strokeWidth, opacity])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'selection' || currentTool === 'pan' || currentTool === 'zoom') return
    
    const point = getCanvasCoordinates(e)
    setStartPoint(point)
    setIsDrawing(true)

    const type: ObjectType = currentTool === 'eraser' ? 'pencil' : currentTool as ObjectType
    const newObj = createObject(type, point.x, point.y)
    
    setCurrentObject(newObj)
    addObject(newObj)
  }, [currentTool, getCanvasCoordinates, createObject, addObject])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentObject || !startPoint) return

    const point = getCanvasCoordinates(e)
    const dx = point.x - startPoint.x
    const dy = point.y - startPoint.y

    if (currentObject.type === 'pencil') {
      // Free drawing - add points
      const updatedPoints = [...(currentObject.points || []), point]
      updateObject(currentObject.id, {
        points: updatedPoints,
        width: Math.max(currentObject.width, dx),
        height: Math.max(currentObject.height, dy)
      })
      setCurrentObject({ ...currentObject, points: updatedPoints })
    } else {
      // Shape drawing - update dimensions
      updateObject(currentObject.id, {
        width: dx,
        height: dy
      })
      setCurrentObject({ ...currentObject, width: dx, height: dy })
    }
  }, [isDrawing, currentObject, startPoint, getCanvasCoordinates, updateObject])

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentObject) return

    // Finalize the object
    updateObject(currentObject.id, {
      updatedAt: Date.now()
    })

    setIsDrawing(false)
    setCurrentObject(null)
    setStartPoint(null)
  }, [isDrawing, currentObject, updateObject])

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool !== 'text') return

    const point = getCanvasCoordinates(e)
    const text = prompt('Enter text:', '')
    
    if (text && text.trim()) {
      const newObj = createObject('text', point.x, point.y)
      newObj.text = text
      newObj.width = text.length * 10 // Approximate width
      newObj.height = 20
      addObject(newObj)
    }
  }, [currentTool, getCanvasCoordinates, createObject, addObject])

  return {
    isDrawing,
    currentObject,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick
  }
}
