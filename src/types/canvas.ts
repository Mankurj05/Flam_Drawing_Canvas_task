export type ObjectType = 
  | 'pencil' 
  | 'rectangle' 
  | 'circle' 
  | 'ellipse' 
  | 'arrow' 
  | 'line' 
  | 'text'

export interface Point {
  x: number
  y: number
}

export interface CanvasObject {
  id: string
  userId: string
  type: ObjectType
  x: number
  y: number
  width: number
  height: number
  rotation: number // In radians or degrees (we'll standardize on radians)
  strokeColor: string
  fillColor: string
  strokeWidth: number
  opacity: number
  points?: Point[] // For pencil free-drawing
  text?: string // For text nodes
  createdAt: number
  updatedAt: number
}

export interface Viewport {
  x: number // Pan horizontal offset
  y: number // Pan vertical offset
  zoom: number
}
