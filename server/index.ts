import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

// Socket.IO configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
})

// Room state management
interface Room {
  id: string
  users: Map<string, User>
  objects: any[]
  createdAt: number
}

interface User {
  id: string
  name: string
  color: string
  cursor?: { x: number; y: number }
}

const rooms = new Map<string, Room>()

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join room
  socket.on('join-room', ({ roomId, userName, userColor }) => {
    socket.join(roomId)

    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        objects: [],
        createdAt: Date.now()
      })
    }

    const room = rooms.get(roomId)!
    const user: User = {
      id: socket.id,
      name: userName || 'Anonymous',
      color: userColor || '#aa3bff'
    }

    room.users.set(socket.id, user)

    // Notify others in the room
    socket.to(roomId).emit('user-connected', {
      userId: socket.id,
      userName: user.name,
      userColor: user.color
    })

    // Send current room state to the new user
    socket.emit('room-joined', {
      roomId,
      users: Array.from(room.users.values()).map(u => ({
        id: u.id,
        name: u.name,
        color: u.color
      })),
      objects: room.objects
    })

    console.log(`User ${socket.id} joined room ${roomId}`)
  })

  // Leave room
  socket.on('leave-room', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (room) {
      room.users.delete(socket.id)
      
      socket.to(roomId).emit('user-disconnected', {
        userId: socket.id
      })

      // Clean up empty rooms
      if (room.users.size === 0) {
        rooms.delete(roomId)
        console.log(`Room ${roomId} deleted (empty)`)
      }

      socket.leave(roomId)
      console.log(`User ${socket.id} left room ${roomId}`)
    }
  })

  // Drawing events
  socket.on('draw-start', ({ roomId, object }) => {
    const room = rooms.get(roomId)
    if (room) {
      room.objects.push(object)
      socket.to(roomId).emit('draw-start', { object })
    }
  })

  socket.on('draw-update', ({ roomId, objectId, updates }) => {
    const room = rooms.get(roomId)
    if (room) {
      const objIndex = room.objects.findIndex((obj: any) => obj.id === objectId)
      if (objIndex !== -1) {
        room.objects[objIndex] = { ...room.objects[objIndex], ...updates }
        socket.to(roomId).emit('draw-update', { objectId, updates })
      }
    }
  })

  socket.on('draw-end', ({ roomId, objectId }) => {
    const room = rooms.get(roomId)
    if (room) {
      socket.to(roomId).emit('draw-end', { objectId })
    }
  })

  // Cursor movement
  socket.on('cursor-move', ({ roomId, x, y }) => {
    const room = rooms.get(roomId)
    if (room) {
      const user = room.users.get(socket.id)
      if (user) {
        user.cursor = { x, y }
        socket.to(roomId).emit('cursor-update', {
          userId: socket.id,
          userName: user.name,
          userColor: user.color,
          x,
          y
        })
      }
    }
  })

  // Object manipulation
  socket.on('object-update', ({ roomId, objectId, updates }) => {
    const room = rooms.get(roomId)
    if (room) {
      const objIndex = room.objects.findIndex((obj: any) => obj.id === objectId)
      if (objIndex !== -1) {
        room.objects[objIndex] = { ...room.objects[objIndex], ...updates }
        socket.to(roomId).emit('object-update', { objectId, updates })
      }
    }
  })

  socket.on('object-delete', ({ roomId, objectIds }) => {
    const room = rooms.get(roomId)
    if (room) {
      room.objects = room.objects.filter((obj: any) => !objectIds.includes(obj.id))
      socket.to(roomId).emit('object-delete', { objectIds })
    }
  })

  socket.on('object-clear', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (room) {
      room.objects = []
      socket.to(roomId).emit('object-clear')
    }
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    // Remove user from all rooms
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id)
        socket.to(roomId).emit('user-disconnected', {
          userId: socket.id
        })

        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(roomId)
          console.log(`Room ${roomId} deleted (empty)`)
        }
      }
    }
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
