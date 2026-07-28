import type { CanvasObject, Point, Viewport } from '@/types/canvas'

const MIN_SIZE = 8

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function normalizeRect(start: Point, end: Point) {
  const x = Math.min(start.x, end.x)
  const y = Math.min(start.y, end.y)
  const width = Math.max(MIN_SIZE, Math.abs(end.x - start.x))
  const height = Math.max(MIN_SIZE, Math.abs(end.y - start.y))

  return { x, y, width, height }
}

export function getCanvasPoint(
  event: Pick<MouseEvent, 'clientX' | 'clientY'>,
  element: HTMLCanvasElement,
  viewport: Viewport,
): Point {
  const rect = element.getBoundingClientRect()
  const scale = viewport.zoom || 1

  return {
    x: (event.clientX - rect.left - viewport.x) / scale,
    y: (event.clientY - rect.top - viewport.y) / scale,
  }
}

export function applyViewportDelta(viewport: Viewport, screenDelta: Point): Viewport {
  return {
    ...viewport,
    x: viewport.x + screenDelta.x,
    y: viewport.y + screenDelta.y,
  }
}

export function getObjectBounds(object: CanvasObject) {
  const x1 = Math.min(object.x, object.x + object.width)
  const y1 = Math.min(object.y, object.y + object.height)
  const x2 = Math.max(object.x, object.x + object.width)
  const y2 = Math.max(object.y, object.y + object.height)

  return { x1, y1, x2, y2, width: x2 - x1, height: y2 - y1 }
}

export function isPointInObject(point: Point, object: CanvasObject): boolean {
  if (object.type === 'pencil' && object.points?.length) {
    const bounds = object.points.reduce(
      (acc, current) => ({
        x1: Math.min(acc.x1, current.x),
        y1: Math.min(acc.y1, current.y),
        x2: Math.max(acc.x2, current.x),
        y2: Math.max(acc.y2, current.y),
      }),
      { x1: object.points[0].x, y1: object.points[0].y, x2: object.points[0].x, y2: object.points[0].y },
    )

    return point.x >= bounds.x1 && point.x <= bounds.x2 && point.y >= bounds.y1 && point.y <= bounds.y2
  }

  const bounds = getObjectBounds(object)
  return point.x >= bounds.x1 && point.x <= bounds.x2 && point.y >= bounds.y1 && point.y <= bounds.y2
}

export function cloneObjects(objects: CanvasObject[]): CanvasObject[] {
  return objects.map((object) => ({
    ...object,
    points: object.points?.map((point) => ({ ...point })),
  }))
}