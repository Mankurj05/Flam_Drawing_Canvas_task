import { Palette, Droplets, Minus } from 'lucide-react'
import { useToolStore } from '@/store/toolStore'
import { cn } from '@/utils/cn'

const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
]

const STROKE_WIDTHS = [1, 2, 4, 6, 8, 12, 16, 20]

export const PropertyPanel = () => {
  const strokeColor = useToolStore((state) => state.strokeColor)
  const fillColor = useToolStore((state) => state.fillColor)
  const strokeWidth = useToolStore((state) => state.strokeWidth)
  const opacity = useToolStore((state) => state.opacity)
  
  const setStrokeColor = useToolStore((state) => state.setStrokeColor)
  const setFillColor = useToolStore((state) => state.setFillColor)
  const setStrokeWidth = useToolStore((state) => state.setStrokeWidth)
  const setOpacity = useToolStore((state) => state.setOpacity)

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex items-center gap-6 z-50">
      {/* Stroke Color */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Palette size={16} />
          <span>Stroke</span>
        </div>
        <div className="flex gap-1">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setStrokeColor(color)}
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                strokeColor === color ? 'border-purple-500 scale-110' : 'border-gray-300 dark:border-gray-600'
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-6 h-6 rounded-full overflow-hidden cursor-pointer"
            title="Custom color"
          />
        </div>
      </div>

      {/* Fill Color */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Droplets size={16} />
          <span>Fill</span>
        </div>
        <div className="flex gap-1">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setFillColor(color)}
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                fillColor === color ? 'border-purple-500 scale-110' : 'border-gray-300 dark:border-gray-600'
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          <button
            onClick={() => setFillColor('transparent')}
            className={cn(
              'w-6 h-6 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center',
              fillColor === 'transparent' ? 'border-purple-500 scale-110' : 'border-gray-300 dark:border-gray-600'
            )}
            title="Transparent"
          >
            <Minus size={12} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Stroke Width */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Minus size={16} />
          <span>Width</span>
        </div>
        <div className="flex gap-1">
          {STROKE_WIDTHS.map((width) => (
            <button
              key={width}
              onClick={() => setStrokeWidth(width)}
              className={cn(
                'w-8 h-8 rounded-lg border-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center',
                strokeWidth === width ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-600'
              )}
              title={`${width}px`}
            >
              <div
                className="bg-gray-700 dark:bg-gray-300 rounded-full"
                style={{ width: Math.min(width, 12), height: Math.min(width, 12) }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">Opacity</span>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-24 accent-purple-500"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(opacity * 100)}%</span>
      </div>
    </div>
  )
}
