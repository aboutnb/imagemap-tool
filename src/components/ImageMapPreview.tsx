import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Area {
  id: string
  shape: 'rect' | 'circle' | 'poly'
  coords: number[]
  href: string
  alt: string
  title: string
}

interface ImageMapPreviewProps {
  image: string | null
  areas: Area[]
  imageName: string
  className?: string
}

export function ImageMapPreview({ image, areas, imageName, className }: ImageMapPreviewProps) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)
  const [clickedArea, setClickedArea] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // 检查点是否在矩形内
  const isPointInRect = (x: number, y: number, coords: number[]) => {
    const [x1, y1, x2, y2] = coords
    const left = Math.min(x1, x2)
    const right = Math.max(x1, x2)
    const top = Math.min(y1, y2)
    const bottom = Math.max(y1, y2)
    return x >= left && x <= right && y >= top && y <= bottom
  }

  // 检查点是否在圆形内
  const isPointInCircle = (x: number, y: number, coords: number[]) => {
    const [centerX, centerY, radius] = coords
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
    return distance <= radius
  }

  // 处理鼠标移动
  const handleMouseMove = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // 检查鼠标是否在任何区域内
    let foundArea: Area | null = null
    for (const area of areas) {
      let isInside = false
      
      if (area.shape === 'rect') {
        isInside = isPointInRect(x, y, area.coords)
      } else if (area.shape === 'circle') {
        isInside = isPointInCircle(x, y, area.coords)
      }

      if (isInside) {
        foundArea = area
        break
      }
    }

    if (foundArea) {
      setHoveredArea(foundArea.id)
      if (foundArea.title) {
        setTooltip({
          text: foundArea.title,
          x: event.clientX,
          y: event.clientY - 10
        })
      }
    } else {
      setHoveredArea(null)
      setTooltip(null)
    }
  }

  // 处理点击
  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // 检查点击的区域
    for (const area of areas) {
      let isInside = false
      
      if (area.shape === 'rect') {
        isInside = isPointInRect(x, y, area.coords)
      } else if (area.shape === 'circle') {
        isInside = isPointInCircle(x, y, area.coords)
      }

      if (isInside) {
        setClickedArea(area.id)
        // 模拟点击效果
        setTimeout(() => setClickedArea(null), 200)
        
        // 如果有链接，显示模拟跳转
        if (area.href && area.href !== '#') {
          alert(`模拟跳转到: ${area.href}\n\nAlt文本: ${area.alt}\nTitle: ${area.title}`)
        } else {
          alert(`点击了区域!\n\nAlt文本: ${area.alt}\nTitle: ${area.title}`)
        }
        break
      }
    }
  }

  // 生成区域覆盖层
  const renderAreaOverlays = () => {
    if (!image) return null

    return areas.map((area, index) => {
      const isHovered = hoveredArea === area.id
      const isClicked = clickedArea === area.id

      if (area.shape === 'rect') {
        const [x1, y1, x2, y2] = area.coords
        const left = Math.min(x1, x2)
        const top = Math.min(y1, y2)
        const width = Math.abs(x2 - x1)
        const height = Math.abs(y2 - y1)

        return (
          <motion.div
            key={area.id}
            className={`absolute border-2 pointer-events-none transition-all duration-200 ${
              isClicked 
                ? 'bg-red-500/40 border-red-400' 
                : isHovered 
                ? 'bg-blue-500/30 border-blue-400' 
                : 'bg-green-500/20 border-green-400'
            }`}
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* 区域编号 */}
            <div className="absolute top-1 left-1 bg-white text-black text-xs font-bold px-1 rounded">
              {index + 1}
            </div>
          </motion.div>
        )
      } else if (area.shape === 'circle') {
        const [centerX, centerY, radius] = area.coords

        return (
          <motion.div
            key={area.id}
            className={`absolute border-2 rounded-full pointer-events-none transition-all duration-200 ${
              isClicked 
                ? 'bg-red-500/40 border-red-400' 
                : isHovered 
                ? 'bg-blue-500/30 border-blue-400' 
                : 'bg-green-500/20 border-green-400'
            }`}
            style={{
              left: `${centerX - radius}px`,
              top: `${centerY - radius}px`,
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* 区域编号 */}
            <div className="absolute top-1 left-1 bg-white text-black text-xs font-bold px-1 rounded">
              {index + 1}
            </div>
          </motion.div>
        )
      }

      return null
    })
  }

  return (
    <div className={className}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Live Preview</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 border border-green-300 rounded-full shadow-sm"></div>
                <span className="text-white/90">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 border border-blue-300 rounded-full shadow-sm"></div>
                <span className="text-white/90">Hover</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 border border-red-300 rounded-full shadow-sm"></div>
                <span className="text-white/90">Click</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50 dark:bg-gray-800">
          {!image ? (
            <div className="aspect-video bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No preview available</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload an image to see the preview</p>
              </div>
            </div>
          ) : (
            <div ref={containerRef} className="relative inline-block">
              <img
                ref={imageRef}
                src={image}
                alt={`Preview of ${imageName}`}
                className="max-w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm cursor-pointer"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                  setHoveredArea(null)
                  setTooltip(null)
                }}
                onClick={handleClick}
              />
              
              {/* 区域覆盖层 */}
              {renderAreaOverlays()}
            </div>
          )}

          {areas.length > 0 && (
            <div className="mt-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Testing Guide</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Hover over colored areas for effects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Click areas to simulate navigation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Numbers show creation order</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Tooltips appear for titled areas</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    <strong>Statistics:</strong> {areas.length} areas total
                  </span>
                  <div className="flex gap-4">
                    <span className="text-green-600">
                      {areas.filter(a => a.href && a.href !== '#').length} with links
                    </span>
                    <span className="text-blue-600">
                      {areas.filter(a => a.title).length} with tooltips
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {areas.length === 0 && image && (
            <div className="mt-6 text-center bg-white border border-gray-200 rounded-lg p-8">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">No areas to preview</p>
              <p className="text-xs text-gray-400 mt-1">Switch to edit mode to create interactive areas</p>
            </div>
          )}
        </div>
      </div>

      {/* 工具提示 */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-gray-700 pointer-events-none z-50"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="relative">
              {tooltip.text}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}