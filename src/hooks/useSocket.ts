import { useEffect, useCallback } from 'react'
import { socketClient } from '@/socket/socketClient'
import { useSocketStore } from '@/store/socketStore'
import { useCanvasStore } from '@/store/canvasStore'

export const useSocket = () => {
  const isConnected = useSocketStore((state) => state.isConnected)
  const socketId = useSocketStore((state) => state.socketId)
  const currentRoom = useSocketStore((state) => state.currentRoom)
  const userName = useSocketStore((state) => state.userName)
  const userColor = useSocketStore((state) => state.userColor)
  
  const setConnected = useSocketStore((state) => state.setConnected)
  const setSocketId = useSocketStore((state) => state.setSocketId)
  const setCurrentRoom = useSocketStore((state) => state.setCurrentRoom)

  const connect = useCallback(() => {
    socketClient.connect()
    setConnected(true)
    setSocketId(socketClient.getSocketId() || null)
  }, [setConnected, setSocketId])

  const disconnect = useCallback(() => {
    socketClient.disconnect()
    setConnected(false)
    setSocketId(null)
    setCurrentRoom(null)
  }, [setConnected, setSocketId, setCurrentRoom])

  const joinRoom = useCallback((roomId: string, name: string = userName, color: string = userColor) => {
    socketClient.joinRoom(roomId, name, color)
    setCurrentRoom(roomId)
  }, [userName, userColor, setCurrentRoom])

  const leaveRoom = useCallback((roomId: string) => {
    socketClient.leaveRoom(roomId)
    setCurrentRoom(null)
  }, [setCurrentRoom])

  // Setup socket event listeners
  useEffect(() => {
    const handleRoomJoined = (data: { roomId: string; users: any[]; objects: any[] }) => {
      console.log('Room joined:', data)
      // Sync objects from server
      const { setObjects } = useCanvasStore.getState()
      setObjects(data.objects, false)
    }

    const handleUserConnected = (data: { userId: string; userName: string; userColor: string }) => {
      console.log('User connected:', data)
    }

    const handleUserDisconnected = (data: { userId: string }) => {
      console.log('User disconnected:', data)
    }

    const handleDrawStart = (data: { object: any }) => {
      const { addObject } = useCanvasStore.getState()
      addObject(data.object, false)
    }

    const handleDrawUpdate = (data: { objectId: string; updates: any }) => {
      const { updateObject } = useCanvasStore.getState()
      updateObject(data.objectId, data.updates, false)
    }

    const handleDrawEnd = (data: { objectId: string }) => {
      console.log('Draw ended:', data.objectId)
    }

    const handleObjectUpdate = (data: { objectId: string; updates: any }) => {
      const { updateObject } = useCanvasStore.getState()
      updateObject(data.objectId, data.updates, false)
    }

    const handleObjectDelete = (data: { objectIds: string[] }) => {
      const { deleteObjects } = useCanvasStore.getState()
      deleteObjects(data.objectIds, false)
    }

    const handleObjectClear = () => {
      const { clearCanvas } = useCanvasStore.getState()
      clearCanvas()
    }

    // Register event listeners
    socketClient.onRoomJoined(handleRoomJoined)
    socketClient.onUserConnected(handleUserConnected)
    socketClient.onUserDisconnected(handleUserDisconnected)
    socketClient.onDrawStart(handleDrawStart)
    socketClient.onDrawUpdate(handleDrawUpdate)
    socketClient.onDrawEnd(handleDrawEnd)
    socketClient.onObjectUpdate(handleObjectUpdate)
    socketClient.onObjectDelete(handleObjectDelete)
    socketClient.onObjectClear(handleObjectClear)

    // Cleanup
    return () => {
      socketClient.off('room-joined', handleRoomJoined)
      socketClient.off('user-connected', handleUserConnected)
      socketClient.off('user-disconnected', handleUserDisconnected)
      socketClient.off('draw-start', handleDrawStart)
      socketClient.off('draw-update', handleDrawUpdate)
      socketClient.off('draw-end', handleDrawEnd)
      socketClient.off('object-update', handleObjectUpdate)
      socketClient.off('object-delete', handleObjectDelete)
      socketClient.off('object-clear', handleObjectClear)
    }
  }, [])

  return {
    isConnected,
    socketId,
    currentRoom,
    userName,
    userColor,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    emitDrawStart: socketClient.emitDrawStart.bind(socketClient),
    emitDrawUpdate: socketClient.emitDrawUpdate.bind(socketClient),
    emitDrawEnd: socketClient.emitDrawEnd.bind(socketClient),
    emitCursorMove: socketClient.emitCursorMove.bind(socketClient),
    emitObjectUpdate: socketClient.emitObjectUpdate.bind(socketClient),
    emitObjectDelete: socketClient.emitObjectDelete.bind(socketClient),
    emitObjectClear: socketClient.emitObjectClear.bind(socketClient),
  }
}
