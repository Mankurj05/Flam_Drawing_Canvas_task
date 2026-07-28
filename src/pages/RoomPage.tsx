import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, ArrowRight, ArrowLeft } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useCanvas } from '@/hooks/useCanvas'
import { useDrawing } from '@/hooks/useDrawing'
import { Toolbar } from '@/components/toolbar/Toolbar'
import { PropertyPanel } from '@/components/toolbar/PropertyPanel'

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId?: string }>()
  const navigate = useNavigate()
  const [roomInput, setRoomInput] = useState('')
  const { canvasRef, handleWheel } = useCanvas()
  const { handleMouseDown, handleMouseMove, handleMouseUp, handleDoubleClick } = useDrawing()

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
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Offline
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
          className="w-full h-full block bg-[#0f1015] cursor-default"
        />

        {/* Drawing Tools */}
        <Toolbar />
        <PropertyPanel />
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
