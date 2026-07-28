import { create } from 'zustand'

interface SocketState {
  isConnected: boolean
  socketId: string | null
  currentRoom: string | null
  userName: string
  userColor: string
  
  // Actions
  setConnected: (connected: boolean) => void
  setSocketId: (id: string | null) => void
  setCurrentRoom: (room: string | null) => void
  setUserName: (name: string) => void
  setUserColor: (color: string) => void
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  socketId: null,
  currentRoom: null,
  userName: 'Anonymous',
  userColor: '#aa3bff',

  setConnected: (connected) => set({ isConnected: connected }),
  
  setSocketId: (id) => set({ socketId: id }),
  
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  setUserName: (name) => set({ userName: name }),
  
  setUserColor: (color) => set({ userColor: color })
}))
