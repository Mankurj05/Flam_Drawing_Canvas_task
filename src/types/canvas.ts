export type ObjectType =
  | 'pencil'
  | 'rectangle'
  | 'circle'
  | 'ellipse'
  | 'arrow'
  | 'line'
  | 'text'

export type ToolType =
  | 'selection'
  | 'pencil'
  | 'rectangle'
  | 'circle'
  | 'ellipse'
  | 'arrow'
  | 'line'
  | 'text'
  | 'eraser'
  | 'pan'
  | 'zoom'

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface CanvasObject {
  id: string
  userId: string
  type: ObjectType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  strokeColor: string
  fillColor: string
  strokeWidth: number
  opacity: number
  createdAt: number
  updatedAt: number
  points?: Point[]
  text?: string
  fontSize?: number
  fontFamily?: string
  groupId?: string | null
  zIndex?: number
  locked?: boolean
  metadata?: Record<string, string | number | boolean | null>
}

export interface Participant {
  id: string
  name: string
  color: string
  cursor?: Point | null
  activeTool?: ToolType
  connectedAt: number
  updatedAt: number
}

export interface RoomSnapshot {
  roomId: string
  roomName: string
  objects: CanvasObject[]
  viewport: Viewport
  revision: number
  updatedAt: number
}

export interface CanvasSettings {
  backgroundColor: string
  gridColor: string
  snapToGrid: boolean
  showGrid: boolean
}

export interface CanvasMetrics {
  width: number
  height: number
  dpr: number
}

export interface CursorState {
  id: string
  name: string
  color: string
  x: number
  y: number
  lastSeen: number
}

export interface CanvasSnapshot {
  objects: CanvasObject[]
  selectedIds: string[]
  viewport: Viewport
}

export type HistoryAction = 
  | { type: 'add'; object: CanvasObject }
  | { type: 'update'; id: string; previous: Partial<CanvasObject>; current: Partial<CanvasObject> }
  | { type: 'delete'; objects: CanvasObject[] }
  | { type: 'reorder'; previousOrder: string[]; currentOrder: string[] }
