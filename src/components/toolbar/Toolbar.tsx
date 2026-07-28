import { Pencil, Square, Circle, Minus, Type, Eraser, Hand, ZoomIn, MousePointer2 } from 'lucide-react'
import { useToolStore } from '@/store/toolStore'
import type { ToolType } from '@/types/canvas'
import { cn } from '@/utils/cn'

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
  { type: 'zoom', icon: ZoomIn, label: 'Zoom' },
]

export const Toolbar = () => {
  const currentTool = useToolStore((state) => state.currentTool)
  const setCurrentTool = useToolStore((state) => state.setCurrentTool)

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 flex flex-col gap-2 z-50">
      {tools.map((tool) => {
        const Icon = tool.icon
        return (
          <button
            key={tool.type}
            onClick={() => setCurrentTool(tool.type)}
            className={cn(
              'p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700',
              currentTool === tool.type
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'text-gray-600 dark:text-gray-300'
            )}
            title={tool.label}
          >
            <Icon size={20} />
          </button>
        )
      })}
    </div>
  )
}
