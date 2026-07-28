import type { CanvasObject } from '@/types/canvas'
import toast from 'react-hot-toast'

export const exportToJson = (objects: CanvasObject[], roomId: string) => {
  try {
    const data = JSON.stringify(objects, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `board-${roomId}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Workspace exported to JSON')
  } catch (error) {
    console.error('Export error:', error)
    toast.error('Failed to export workspace')
  }
}

export const importFromJson = (file: File): Promise<CanvasObject[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const objects = JSON.parse(e.target?.result as string)
        if (Array.isArray(objects)) {
          toast.success('Workspace imported successfully')
          resolve(objects)
        } else {
          toast.error('Invalid workspace file format')
          reject(new Error('Invalid JSON format for canvas objects'))
        }
      } catch (err) {
        toast.error('Failed to parse workspace file')
        reject(err)
      }
    }
    reader.onerror = () => {
      toast.error('Failed to read file')
      reject(new Error('Failed to read file'))
    }
    reader.readAsText(file)
  })
}

export const exportToImage = (canvas: HTMLCanvasElement | null, roomId: string, format: 'png' | 'svg' = 'png') => {
  if (!canvas) {
    toast.error('No canvas found to export')
    return
  }
  
  if (format === 'svg') {
    toast.error('SVG export is coming soon!')
    return
  }

  try {
    // Basic PNG export of the current canvas viewport
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `board-${roomId}-${new Date().toISOString().split('T')[0]}.png`
    a.click()
    toast.success('Workspace exported to PNG')
  } catch (error) {
    console.error('Export image error:', error)
    toast.error('Failed to export image')
  }
}