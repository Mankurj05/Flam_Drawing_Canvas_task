import { create } from 'zustand'
import type { CursorState, Participant } from '@/types/canvas'

interface SocketState {
  isConnected: boolean
  isReconnecting: boolean
  latency: number
  socketId: string | null
  currentRoom: string | null
  connectionError: string | null
  userName: string
  userColor: string
  participants: Participant[]
  cursors: CursorState[]
  
  // Actions
  setConnected: (connected: boolean) => void
  setReconnecting: (reconnecting: boolean) => void
  setLatency: (latency: number) => void
  setSocketId: (id: string | null) => void
  setCurrentRoom: (room: string | null) => void
  setConnectionError: (error: string | null) => void
  setUserName: (name: string) => void
  setUserColor: (color: string) => void
  setParticipants: (participants: Participant[]) => void
  setCursors: (cursors: CursorState[]) => void
  upsertCursor: (cursor: CursorState) => void
  removeCursor: (userId: string) => void
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  isReconnecting: false,
  latency: 0,
  socketId: null,
  currentRoom: null,
  connectionError: null,
  userName: 'Anonymous',
  userColor: '#7c3aed',
  participants: [],
  cursors: [],

  setConnected: (connected) => set({ isConnected: connected }),

  setReconnecting: (isReconnecting) => set({ isReconnecting }),

  setLatency: (latency) => set({ latency }),
  
  setSocketId: (id) => set({ socketId: id }),
  
  setCurrentRoom: (room) => set({ currentRoom: room }),

  setConnectionError: (connectionError) => set({ connectionError }),
  
  setUserName: (name) => set({ userName: name }),
  
  setUserColor: (color) => set({ userColor: color }),

  setParticipants: (participants) => set({ participants }),

  setCursors: (cursors) => set({ cursors }),

  upsertCursor: (cursor) => set((state) => ({
    cursors: [...state.cursors.filter((item) => item.id !== cursor.id), cursor],
  })),

  removeCursor: (userId) => set((state) => ({
    cursors: state.cursors.filter((cursor) => cursor.id !== userId),
  })),
}))
