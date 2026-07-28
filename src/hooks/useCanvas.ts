import { useEffect, useRef, useState } from 'react'
import { CanvasEngine } from '@/components/canvas/CanvasEngine'
import { useCanvasStore } from '@/store/canvasStore'
import { useUIStore } from '@/store/uiStore'

export const useCanvas = () => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const engineRef = useRef<CanvasEngine | null>(null)

  const objects = useCanvasStore((state) => state.objects)
  const selectedIds = useCanvasStore((state) => state.selectedIds)
  const viewport = useCanvasStore((state) => state.viewport)
  const setViewport = useCanvasStore((state) => state.setViewport)
  const theme = useUIStore((state) => state.theme)

  // Initialize Canvas Engine & Rendering Loop
  useEffect(() => {
    if (!canvas) return

    // Setup Canvas dimension resize logic matching device pixel ratio
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return // Skip if hidden or unmounted
      
      const dpr = window.devicePixelRatio || 1
      const newWidth = Math.round(rect.width * dpr)
      const newHeight = Math.round(rect.height * dpr)

      // Only resize if actually changed to prevent canvas clearing on identical resizes
      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth
        canvas.height = newHeight
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0) // Explicitly reset transform before scale just in case
          ctx.scale(dpr, dpr)
        }

        if (engineRef.current) {
          engineRef.current.render()
        }
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

    // Use ResizeObserver for robust tracking (handles flexbox changes, layout shifts, etc.)
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })
    resizeObserver.observe(canvas)
    
    // Initial resize
    resizeCanvas()
    engine.startRenderLoop()

    return () => {
      resizeObserver.disconnect()
      engine.stopRenderLoop()
      engineRef.current = null
    }
  }, [canvas])

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
    canvasRef: setCanvas,
    handleWheel,
  }
}
