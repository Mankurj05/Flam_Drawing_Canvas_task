import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

class SocketClient {
  private socket: Socket | null = null
  private currentRoom: string | null = null

  connect() {
    if (this.socket?.connected) return

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      console.log('Connected to socket server:', this.socket?.id)
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
  }

  disconnect() {
    if (this.currentRoom) {
      this.leaveRoom(this.currentRoom)
    }
    this.socket?.disconnect()
    this.socket = null
    this.currentRoom = null
  }

  joinRoom(roomId: string, userName: string, userColor: string) {
    if (!this.socket) this.connect()
    
    this.currentRoom = roomId
    this.socket?.emit('join-room', { roomId, userName, userColor })
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leave-room', { roomId })
    this.currentRoom = null
  }

  // Drawing events
  emitDrawStart(object: any) {
    if (this.currentRoom && this.socket) {
      this.socket.emit('draw-start', { roomId: this.currentRoom, object })
    }
  }

  emitDrawUpdate(objectId: string, updates: any) {
    if (this.currentRoom && this.socket) {
      this.socket.emit('draw-update', { roomId: this.currentRoom, objectId, updates })
    }
  }

  emitDrawEnd(objectId: string) {
    if (this.currentRoom && this.socket) {
      this.socket.emit('draw-end', { roomId: this.currentRoom, objectId })
    }
  }

  // Cursor events
  emitCursorMove(x: number, y: number) {
    if (this.currentRoom && this.socket) {
      this.socket.emit('cursor-move', { roomId: this.currentRoom, x, y })
    }
  }

  // Object manipulation events
  emitObjectUpdate(objectId: string, updates: any) {
    if (this.currentRoom && this.socket) {
      this.socket.emit('object-update', { roomId: this.currentRoom, objectId, updates })
    }
  }

  emitObjectDelete(objectIds: string[]) {
    if (this.currentRoom && this.socket) {
      this.socket.emit('object-delete', { roomId: this.currentRoom, objectIds })
    }
  }

  emitObjectClear() {
    if (this.currentRoom && this.socket) {
      this.socket.emit('object-clear', { roomId: this.currentRoom })
    }
  }

  // Event listeners
  onRoomJoined(callback: (data: { roomId: string; users: any[]; objects: any[] }) => void) {
    this.socket?.on('room-joined', callback)
  }

  onUserConnected(callback: (data: { userId: string; userName: string; userColor: string }) => void) {
    this.socket?.on('user-connected', callback)
  }

  onUserDisconnected(callback: (data: { userId: string }) => void) {
    this.socket?.on('user-disconnected', callback)
  }

  onDrawStart(callback: (data: { object: any }) => void) {
    this.socket?.on('draw-start', callback)
  }

  onDrawUpdate(callback: (data: { objectId: string; updates: any }) => void) {
    this.socket?.on('draw-update', callback)
  }

  onDrawEnd(callback: (data: { objectId: string }) => void) {
    this.socket?.on('draw-end', callback)
  }

  onCursorUpdate(callback: (data: { userId: string; userName: string; userColor: string; x: number; y: number }) => void) {
    this.socket?.on('cursor-update', callback)
  }

  onObjectUpdate(callback: (data: { objectId: string; updates: any }) => void) {
    this.socket?.on('object-update', callback)
  }

  onObjectDelete(callback: (data: { objectIds: string[] }) => void) {
    this.socket?.on('object-delete', callback)
  }

  onObjectClear(callback: () => void) {
    this.socket?.on('object-clear', callback)
  }

  // Remove event listeners
  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback)
    } else {
      this.socket?.off(event)
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  getSocketId(): string | undefined {
    return this.socket?.id
  }
}

export const socketClient = new SocketClient()
