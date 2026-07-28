import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, ArrowRight, ArrowLeft, Trash2, Copy, ArrowUp, ArrowDown, Undo, Redo, ZoomIn, ZoomOut } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useCanvas } from '@/hooks/useCanvas'
import { useDrawing } from '@/hooks/useDrawing'
import { useSelection } from '@/hooks/useSelection'
import { useHistory } from '@/hooks/useHistory'
import { useSocket } from '@/hooks/useSocket'
import { useCanvasStore } from '@/store/canvasStore'
import { useToolStore } from '@/store/toolStore'
import { Toolbar } from '@/components/toolbar/Toolbar'
import { PropertyPanel } from '@/components/toolbar/PropertyPanel'
import { throttle } from '@/utils/throttle'
import { motion } from 'framer-motion'

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId?: string }>()
  const navigate = useNavigate()
  const [roomInput, setRoomInput] = useState('')
  const { canvasRef, handleWheel } = useCanvas()
  const { handleMouseDown: drawMouseDown, handleMouseMove: drawMouseMove, handleMouseUp: drawMouseUp, handleDoubleClick, editingText, setEditingText, finalizeText } = useDrawing()
  const { handleMouseDown: selectMouseDown, handleMouseMove: selectMouseMove, handleMouseUp: selectMouseUp, deleteSelected, duplicateSelected, bringForward, sendBackward } = useSelection()
  const { undo, redo, canUndo, canRedo } = useHistory()
  const { connect, disconnect, joinRoom, leaveRoom, isConnected, emitCursorMove } = useSocket()
  const selectedIds = useCanvasStore((state) => state.selectedIds)
  const setViewport = useCanvasStore((state) => state.setViewport)
  const viewport = useCanvasStore((state) => state.viewport)
  const currentTool = useToolStore((state) => state.currentTool)
  const [isPanning, setIsPanning] = useState(false)

  // Unified mouse handlers based on current tool
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editingText) {
      finalizeText(editingText.text)
      return
    }

    if (currentTool === 'pan') {
      setIsPanning(true)
      return
    }
    
    if (currentTool === 'selection') {
      selectMouseDown(e)
    } else {
      drawMouseDown(e)
    }
  }

  // Memoized throttled cursor emitter to limit network calls (Phase 12: Performance optimization)
  const throttledEmitCursorMove = React.useMemo(() => throttle((x: number, y: number) => {
    emitCursorMove(x, y)
  }, 50), [emitCursorMove])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'pan') {
      if (isPanning) {
        setViewport({
          x: viewport.x + e.movementX,
          y: viewport.y + e.movementY
        })
      }
      return
    }

    if (currentTool === 'selection') {
      selectMouseMove(e)
    } else {
      drawMouseMove(e)
    }
    const rect = e.currentTarget.getBoundingClientRect()
    throttledEmitCursorMove(e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleMouseUp = () => {
    if (currentTool === 'pan') {
      setIsPanning(false)
      return
    }

    if (currentTool === 'selection') {
      selectMouseUp()
    } else {
      drawMouseUp()
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected()
      } else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        duplicateSelected()
      } else if (e.ctrlKey && e.key === 'ArrowUp') {
        e.preventDefault()
        bringForward()
      } else if (e.ctrlKey && e.key === 'ArrowDown') {
        e.preventDefault()
        sendBackward()
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelected, duplicateSelected, bringForward, sendBackward, undo, redo])

  // Socket connection when entering a room
  useEffect(() => {
    if (roomId) {
      connect()
      joinRoom(roomId, 'User', '#aa3bff')

      return () => {
        leaveRoom(roomId)
        disconnect()
      }
    }
  }, [roomId, connect, disconnect, joinRoom, leaveRoom])

  const handleZoom = (direction: 'in' | 'out') => {
    const zoomFactor = direction === 'in' ? 1.25 : 0.8
    const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.1), 5)
    
    // Zoom towards center of screen
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    
    const newX = centerX - (centerX - viewport.x) * (newZoom / viewport.zoom)
    const newY = centerY - (centerY - viewport.y) * (newZoom / viewport.zoom)
    
    setViewport({ x: newX, y: newY, zoom: newZoom })
  }

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault()
    const id = nanoid(10)
    navigate(`/room/${id}`)
  }

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomInput.trim()) {
      navigate(`/room/${roomInput.trim()}`)
    }
  }

  // If roomId parameter is present, show canvas workspace layout
  if (roomId) {
    return (
      <div className="h-screen w-screen bg-[#0f1015] flex flex-col overflow-hidden text-gray-300 relative select-none">
        {/* Workspace Toolbar Header */}
        <header className="absolute top-4 left-4 right-4 h-14 bg-[#16171d]/90 border border-white/5 rounded-xl z-10 flex items-center justify-between px-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Go home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-white tracking-wide">Workspace: {roomId}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
              isConnected 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </header>

        {/* Canvas Renderer */}
        <canvas
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          className={`w-full h-full block bg-bg-light dark:bg-[#0f1015] ${currentTool === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`}
        />

        {/* Text Input Overlay */}
        {editingText && (
          <input
            autoFocus
            type="text"
            className="absolute bg-white/10 dark:bg-black/10 border-none outline-none text-black dark:text-white p-1 m-0 focus:ring-2 focus:ring-purple-500 rounded"
            style={{
              left: `${editingText.x}px`,
              top: `${editingText.y}px`,
              transform: 'translateY(-50%)',
              fontFamily: 'sans-serif',
              fontSize: '14px',
              minWidth: '100px'
            }}
            value={editingText.text}
            onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                finalizeText(editingText.text)
              } else if (e.key === 'Escape') {
                finalizeText('')
              }
            }}
          />
        )}

        {/* Drawing Tools */}
        <Toolbar />
        <PropertyPanel />

        {/* Selection Actions */}
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            className="fixed bottom-4 left-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 flex items-center gap-2 z-50"
          >
            <button
              onClick={duplicateSelected}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Duplicate (Ctrl+D)"
            >
              <Copy size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={bringForward}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Bring Forward (Ctrl+↑)"
            >
              <ArrowUp size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={sendBackward}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Send Backward (Ctrl+↓)"
            >
              <ArrowDown size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              onClick={deleteSelected}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              title="Delete"
            >
              <Trash2 size={20} className="text-red-500" />
            </button>
          </motion.div>
        )}

        {/* History Actions */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 flex items-center gap-2 z-50"
        >
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          >
            <Redo size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </motion.div>

        {/* Zoom Controls */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 flex items-center gap-2 z-50"
        >
          <button
            onClick={() => handleZoom('out')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-12 text-center">
            {Math.round(viewport.zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom('in')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </motion.div>
      </div>
    )
  }

  // Otherwise, show Create/Join Room form
  return (
    <div className="min-h-screen bg-bg-light dark:bg-[#0f1015] text-text-light dark:text-text-dark flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full p-8 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark shadow-xl">
        <h2 className="text-2xl font-bold text-heading-light dark:text-heading-dark text-center mb-6">Create or Join a Room</h2>
        
        {/* Create Room Form */}
        <form onSubmit={handleCreateRoom} className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Start a New Workspace</h3>
          <button 
            type="submit" 
            className="w-full bg-brand-primary text-white h-11 rounded-lg font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md shadow-brand-primary-light"
          >
            <Plus className="w-5 h-5" /> Create New Room
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase">Or</span>
          <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
        </div>

        {/* Join Room Form */}
        <form onSubmit={handleJoinRoom} className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Join Existing Workspace</h3>
          <div>
            <label className="block text-xs font-bold mb-1.5 text-gray-400 uppercase">Room ID</label>
            <input 
              type="text" 
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="e.g. j9x2-a8Lp"
              className="w-full h-11 px-4 rounded-lg border border-border-light dark:border-border-dark bg-transparent outline-none focus:border-brand-primary transition-all text-sm font-mono"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full border border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 h-11 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          >
            Join Workspace <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
