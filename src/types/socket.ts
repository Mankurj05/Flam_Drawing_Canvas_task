import type { CanvasObject, CursorState, Participant, RoomSnapshot, ToolType } from './canvas'

export interface JoinRoomPayload {
  roomId: string
  userName: string
  userColor: string
}

export interface LeaveRoomPayload {
  roomId: string
}

export interface CursorPayload {
  roomId: string
  x: number
  y: number
}

export interface DrawPayload {
  roomId: string
  object: CanvasObject
}

export interface DrawUpdatePayload {
  roomId: string
  objectId: string
  updates: Partial<CanvasObject>
  revision?: number
}

export interface ObjectMutationPayload {
  roomId: string
  objectIds?: string[]
  objectId?: string
  updates?: Partial<CanvasObject>
}

export interface RoomJoinedPayload {
  room: RoomSnapshot
  participants: Participant[]
  cursors: CursorState[]
}

export interface CursorUpdatePayload {
  userId: string
  userName: string
  userColor: string
  x: number
  y: number
  activeTool?: ToolType
}

export interface PresenceEventPayload {
  userId: string
  userName: string
  userColor: string
}

export interface SyncStatePayload {
  room: RoomSnapshot
  participants: Participant[]
  cursors: CursorState[]
}