import { useEffect, useRef } from 'react'
import { CanvasEngine } from '@/components/canvas/CanvasEngine'
import { useCanvasStore } from '@/store/canvasStore'
import { useUIStore } from '@/store/uiStore'

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<CanvasEngine | null>(null)

  const objects = useCanvasStore((state) => state.objects)
  const selectedIds = useCanvasStore((state) => state.selectedIds)
  const viewport = useCanvasStore((state) => state.viewport)
  const setViewport = useCanvasStore((state) => state.setViewport)
  const theme = useUIStore((state) => state.theme)

  // Initialize Canvas Engine & Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Setup Canvas dimension resize logic matching device pixel ratio
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }

      if (engineRef.current) {
        engineRef.current.render()
      }
    }

    // Bind engine context access getters
    const engine = new CanvasEngine(
      canvas,
      () => useCanvasStore.getState().objects,
      () => useCanvasStore.getState().selectedIds,
      () => useCanvasStore.getState().viewport
    )
    engineRef.current = engine

    resizeCanvas()
    engine.startRenderLoop()

    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      engine.stopRenderLoop()
      engineRef.current = null
    }
  }, [])

  // Sync theme changes inside the engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateTheme()
      engineRef.current.render()
    }
  }, [theme])

  // Trigger redraw if objects, selection, or viewport properties change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.render()
    }
  }, [objects, selectedIds, viewport])

  // Mouse wheel zoom and drag panning events
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (e.ctrlKey) {
      // Zoom logic centered on cursor pointer coordinates
      const zoomFactor = 1.1
      const nextZoom = e.deltaY < 0 
        ? Math.min(10, viewport.zoom * zoomFactor) 
        : Math.max(0.1, viewport.zoom / zoomFactor)

      const rect = e.currentTarget.getBoundingClientRect()
      const cursorX = e.clientX - rect.left
      const cursorY = e.clientY - rect.top

      // Align pan offsets so scaling remains anchored to the cursor
      const dx = cursorX - viewport.x
      const dy = cursorY - viewport.y

      setViewport({
        zoom: nextZoom,
        x: cursorX - dx * (nextZoom / viewport.zoom),
        y: cursorY - dy * (nextZoom / viewport.zoom),
      })
    } else {
      // Direct scroll panning
      setViewport({
        x: viewport.x - e.deltaX,
        y: viewport.y - e.deltaY,
      })
    }
  }

  return {
    canvasRef,
    handleWheel,
  }
}
