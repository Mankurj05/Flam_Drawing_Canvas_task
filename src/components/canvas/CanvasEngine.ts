import type { CanvasObject, Viewport } from '@/types/canvas'

export class CanvasEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private getObjects: () => CanvasObject[]
  private getSelectedIds: () => string[]
  private getViewport: () => Viewport
  private isDark: boolean = false
  private animationFrameId: number | null = null

  constructor(
    canvas: HTMLCanvasElement,
    getObjects: () => CanvasObject[],
    getSelectedIds: () => string[],
    getViewport: () => Viewport
  ) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not obtain 2D rendering context from canvas element.')
    }
    this.ctx = context
    this.getObjects = getObjects
    this.getSelectedIds = getSelectedIds
    this.getViewport = getViewport
    this.updateTheme()
  }

  public updateTheme(): void {
    this.isDark = document.documentElement.classList.contains('dark')
  }

  public startRenderLoop(): void {
    const loop = () => {
      this.render()
      this.animationFrameId = requestAnimationFrame(loop)
    }
    this.animationFrameId = requestAnimationFrame(loop)
  }

  public stopRenderLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  public render(): void {
    const ctx = this.ctx
    const width = this.canvas.width
    const height = this.canvas.height
    const viewport = this.getViewport()
    const objects = this.getObjects()
    const selectedIds = this.getSelectedIds()

    // 1. Clear Canvas
    ctx.clearRect(0, 0, width, height)

    // 2. Save context state before zoom/pan transformations
    ctx.save()

    // 3. Apply Camera viewport Zoom and Pan offsets
    ctx.translate(viewport.x, viewport.y)
    ctx.scale(viewport.zoom, viewport.zoom)

    // 4. Draw infinite background grid
    this.drawGrid(ctx, viewport, width, height)

    // 5. Draw all vector canvas objects
    for (const obj of objects) {
      this.drawObject(ctx, obj)
    }

    // 6. Draw Selected shapes outlines & control bounding boxes
    for (const obj of objects) {
      if (selectedIds.includes(obj.id)) {
        this.drawSelectionOutline(ctx, obj)
      }
    }

    // 7. Restore base context settings
    ctx.restore()
  }

  private drawGrid(
    ctx: CanvasRenderingContext2D,
    viewport: Viewport,
    width: number,
    height: number
  ): void {
    const gridSize = 40
    const zoom = viewport.zoom

    // Calculate grid lines relative to current screen space boundaries
    const startX = -viewport.x / zoom
    const startY = -viewport.y / zoom
    const endX = startX + width / zoom
    const endY = startY + height / zoom

    // Align grid coordinate snapping
    const firstLineX = Math.floor(startX / gridSize) * gridSize
    const firstLineY = Math.floor(startY / gridSize) * gridSize

    ctx.strokeStyle = this.isDark ? '#22242b' : '#e5e4e7'
    ctx.lineWidth = 1 / zoom // Keep grid lines 1 physical pixel thin regardless of zoom level
    ctx.beginPath()

    // Draw vertical lines
    for (let x = firstLineX; x < endX; x += gridSize) {
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
    }

    // Draw horizontal lines
    for (let y = firstLineY; y < endY; y += gridSize) {
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
    }

    ctx.stroke()
  }

  private drawObject(ctx: CanvasRenderingContext2D, obj: CanvasObject): void {
    ctx.save()
    if (obj.metadata?.isEraser) {
      ctx.globalCompositeOperation = 'destination-out'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.globalAlpha = obj.opacity
    ctx.strokeStyle = obj.strokeColor
    ctx.fillStyle = obj.fillColor
    ctx.lineWidth = obj.strokeWidth

    // Apply object rotation about its center
    const cx = obj.x + obj.width / 2
    const cy = obj.y + obj.height / 2
    ctx.translate(cx, cy)
    ctx.rotate(obj.rotation)
    ctx.translate(-cx, -cy)

    ctx.beginPath()
    switch (obj.type) {
      case 'rectangle':
        ctx.rect(obj.x, obj.y, obj.width, obj.height)
        break
      case 'circle': {
        const radius = Math.min(Math.abs(obj.width), Math.abs(obj.height)) / 2
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
        break
      }
      case 'ellipse': {
        const rx = Math.abs(obj.width) / 2
        const ry = Math.abs(obj.height) / 2
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI)
        break
      }
      case 'line':
        ctx.moveTo(obj.x, obj.y)
        ctx.lineTo(obj.x + obj.width, obj.y + obj.height)
        break
      case 'arrow':
        this.drawArrowShape(ctx, obj.x, obj.y, obj.x + obj.width, obj.y + obj.height, obj.strokeWidth)
        break
      case 'pencil':
        if (obj.points && obj.points.length > 0) {
          ctx.moveTo(obj.points[0].x, obj.points[0].y)
          for (let i = 1; i < obj.points.length; i++) {
            ctx.lineTo(obj.points[i].x, obj.points[i].y)
          }
        }
        break
      case 'text':
        if (obj.text) {
          ctx.fillStyle = obj.strokeColor // Text nodes prioritize strokeColor for layout readability
          ctx.font = `${Math.max(14, obj.strokeWidth * 4)}px sans-serif`
          ctx.textBaseline = 'top'
          ctx.fillText(obj.text, obj.x, obj.y)
        }
        break
    }

    if (obj.type !== 'pencil' && obj.type !== 'text') {
      if (obj.fillColor && obj.fillColor !== 'transparent') {
        ctx.fill()
      }
    }
    ctx.stroke()
    ctx.restore()
  }

  private drawArrowShape(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    strokeWidth: number
  ): void {
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)

    // Arrow Head coordinates calculation
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const headLength = Math.max(10, strokeWidth * 3)

    ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    )
  }

  private drawSelectionOutline(ctx: CanvasRenderingContext2D, obj: CanvasObject): void {
    ctx.save()
    ctx.strokeStyle = '#aa3bff'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])

    const cx = obj.x + obj.width / 2
    const cy = obj.y + obj.height / 2
    ctx.translate(cx, cy)
    ctx.rotate(obj.rotation)
    ctx.translate(-cx, -cy)

    // Draw dashing selection bounding box
    ctx.strokeRect(obj.x - 4, obj.y - 4, obj.width + 8, obj.height + 8)

    // Draw handles (resize anchors)
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#aa3bff'
    ctx.lineWidth = 1.5
    ctx.setLineDash([]) // Solid handles

    const handleSize = 6
    const handles = [
      { x: obj.x - 4, y: obj.y - 4 }, // Top-Left
      { x: obj.x + obj.width + 4, y: obj.y - 4 }, // Top-Right
      { x: obj.x - 4, y: obj.y + obj.height + 4 }, // Bottom-Left
      { x: obj.x + obj.width + 4, y: obj.y + obj.height + 4 }, // Bottom-Right
    ]

    for (const h of handles) {
      ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize)
      ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize)
    }

    ctx.restore()
  }
}
