import React, { useRef } from 'react'
import { Pencil, Square, Circle, Minus, Type, Eraser, Hand, ZoomIn, MousePointer2, Download, Upload, Image as ImageIcon } from 'lucide-react'
import { useToolStore } from '@/store/toolStore'
import { useCanvasStore } from '@/store/canvasStore'
import { exportToJson, importFromJson, exportToImage } from '@/utils/exportImport'
import type { ToolType } from '@/types/canvas'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'

const tools: { type: ToolType; icon: any; label: string }[] = [
  { type: 'selection', icon: MousePointer2, label: 'Selection' },
  { type: 'pencil', icon: Pencil, label: 'Pencil' },
  { type: 'rectangle', icon: Square, label: 'Rectangle' },
  { type: 'circle', icon: Circle, label: 'Circle' },
  { type: 'ellipse', icon: Circle, label: 'Ellipse' },
  { type: 'line', icon: Minus, label: 'Line' },
  { type: 'arrow', icon: Minus, label: 'Arrow' },
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'eraser', icon: Eraser, label: 'Eraser' },
  { type: 'pan', icon: Hand, label: 'Pan' },
]

export const Toolbar = () => {
  const currentTool = useToolStore((state) => state.currentTool)
  const setCurrentTool = useToolStore((state) => state.setCurrentTool)
  const objects = useCanvasStore((state) => state.objects)
  const setObjects = useCanvasStore((state) => state.setObjects)
  const { roomId } = useParams<{ roomId: string }>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const importedObjects = await importFromJson(file)
        setObjects(importedObjects, true)
      } catch (err) {
        // Error handled in util
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <motion.div 
      initial={{ x: -50, opacity: 0, y: '-50%' }}
      animate={{ x: 0, opacity: 1, y: '-50%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed left-4 top-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-2 flex flex-col gap-2 z-50 border border-gray-200 dark:border-gray-700"
      role="toolbar"
      aria-label="Drawing Tools"
    >
      {tools.map((tool) => {
        const Icon = tool.icon
        return (
          <button
            key={tool.type}
            onClick={() => setCurrentTool(tool.type)}
            className={cn(
              'p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
              currentTool === tool.type
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30 scale-105'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
            )}
            title={tool.label}
            aria-label={tool.label}
            aria-pressed={currentTool === tool.type}
          >
            <Icon size={20} />
          </button>
        )
      })}

      <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-1" />

      <button
        onClick={() => exportToJson(objects, roomId || 'export')}
        className="p-2.5 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        title="Export to JSON"
        aria-label="Export to JSON"
      >
        <Download size={20} />
      </button>

      <button
        onClick={() => {
          const canvas = document.querySelector('canvas')
          exportToImage(canvas, roomId || 'export', 'png')
        }}
        className="p-2.5 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        title="Export to PNG"
        aria-label="Export to PNG"
      >
        <ImageIcon size={20} />
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2.5 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        title="Import JSON"
        aria-label="Import JSON"
      >
        <Upload size={20} />
      </button>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        accept=".json" 
        className="hidden" 
        aria-hidden="true"
      />
    </motion.div>
  )
}
