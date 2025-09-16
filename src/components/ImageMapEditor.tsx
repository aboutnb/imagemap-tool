import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AreaPropertiesEditor } from './AreaPropertiesEditor'
import { ImageMapPreview } from './ImageMapPreview'

interface Area {
  id: string
  shape: 'rect' | 'circle' | 'poly'
  coords: number[]
  href: string
  alt: string
  title: string
}

interface ImageMapEditorProps {
  className?: string
}

export function ImageMapEditor({ className }: ImageMapEditorProps) {
  const [image, setImage] = useState<string | null>(null)
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedTool, setSelectedTool] = useState<'rect' | 'circle'>('rect')
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentArea, setCurrentArea] = useState<Partial<Area> | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [showPropertiesEditor, setShowPropertiesEditor] = useState(false)
  const [imageName, setImageName] = useState('')
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setAreas([]) // 清除现有的区域
        setSelectedArea(null)
        setCurrentArea(null)
        setIsDrawing(false)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // 绘制所有区域到画布
  const drawAreas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 绘制现有区域
    areas.forEach((area, index) => {
      ctx.strokeStyle = selectedArea === area.id ? '#3b82f6' : '#10b981'
      ctx.fillStyle = selectedArea === area.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'
      ctx.lineWidth = 2
      
      if (area.shape === 'rect') {
        const [x1, y1, x2, y2] = area.coords
        const width = x2 - x1
        const height = y2 - y1
        ctx.fillRect(x1, y1, width, height)
        ctx.strokeRect(x1, y1, width, height)
        
        // 绘制区域编号
        ctx.fillStyle = '#fff'
        ctx.font = '14px sans-serif'
        ctx.fillText((index + 1).toString(), x1 + 5, y1 + 20)
      } else if (area.shape === 'circle') {
        const [centerX, centerY, radius] = area.coords
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
        
        // 绘制区域编号
        ctx.fillStyle = '#fff'
        ctx.font = '14px sans-serif'
        ctx.fillText((index + 1).toString(), centerX - 5, centerY + 5)
      }
    })
    
    // 绘制当前正在创建的区域
    if (currentArea && isDrawing) {
      ctx.strokeStyle = '#f59e0b'
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      if (currentArea.shape === 'rect') {
        const [x1, y1, x2, y2] = currentArea.coords!
        const width = x2 - x1
        const height = y2 - y1
        ctx.fillRect(x1, y1, width, height)
        ctx.strokeRect(x1, y1, width, height)
      } else if (currentArea.shape === 'circle') {
        const [centerX, centerY, radius] = currentArea.coords!
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
      }
      
      ctx.setLineDash([])
    }
  }, [areas, selectedArea, currentArea, isDrawing])

  useEffect(() => {
    drawAreas()
  }, [drawAreas])

  // 图片加载完成后同步画布尺寸
  useEffect(() => {
    const imageElement = imageRef.current
    const canvasElement = canvasRef.current
    
    if (imageElement && canvasElement && image) {
      const updateCanvasSize = () => {
        canvasElement.width = imageElement.offsetWidth
        canvasElement.height = imageElement.offsetHeight
        canvasElement.style.width = `${imageElement.offsetWidth}px`
        canvasElement.style.height = `${imageElement.offsetHeight}px`
        drawAreas() // 重新绘制区域
      }

      // 图片加载完成时更新画布尺寸
      if (imageElement.complete) {
        updateCanvasSize()
      } else {
        imageElement.addEventListener('load', updateCanvasSize)
      }

      // 窗口大小改变时也更新画布尺寸
      window.addEventListener('resize', updateCanvasSize)

      return () => {
        imageElement.removeEventListener('load', updateCanvasSize)
        window.removeEventListener('resize', updateCanvasSize)
      }
    }
  }, [image, drawAreas])

  // 视图模式切换时重新初始化画布
  useEffect(() => {
    if (viewMode === 'edit') {
      // 切换回编辑模式时，重新设置画布尺寸
      const imageElement = imageRef.current
      const canvasElement = canvasRef.current
      
      if (imageElement && canvasElement && image) {
        setTimeout(() => {
          canvasElement.width = imageElement.offsetWidth
          canvasElement.height = imageElement.offsetHeight
          canvasElement.style.width = `${imageElement.offsetWidth}px`
          canvasElement.style.height = `${imageElement.offsetHeight}px`
          drawAreas()
        }, 100) // 小延迟确保DOM更新完成
      }
    }
  }, [viewMode, image, drawAreas])

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || viewMode !== 'edit') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    setIsDrawing(true)
    setCurrentArea({
      id: Date.now().toString(),
      shape: selectedTool,
      coords: selectedTool === 'rect' ? [x, y, x, y] : [x, y, 0],
      href: '',
      alt: '',
      title: ''
    })
  }, [image, selectedTool, viewMode])

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentArea || viewMode !== 'edit') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    if (selectedTool === 'rect') {
      setCurrentArea(prev => ({
        ...prev,
        coords: [prev!.coords![0], prev!.coords![1], x, y]
      }))
    } else if (selectedTool === 'circle') {
      const centerX = currentArea.coords![0]
      const centerY = currentArea.coords![1]
      const radius = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
      setCurrentArea(prev => ({
        ...prev,
        coords: [centerX, centerY, Math.round(radius)]
      }))
    }
  }, [isDrawing, currentArea, selectedTool, viewMode])

  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentArea && viewMode === 'edit') {
      setAreas(prev => [...prev, currentArea as Area])
      setCurrentArea(null)
    }
    setIsDrawing(false)
  }, [isDrawing, currentArea, viewMode])

  const deleteArea = useCallback((id: string) => {
    setAreas(prev => prev.filter(area => area.id !== id))
    setSelectedArea(null)
  }, [])

  const updateAreaProperties = useCallback((id: string, updates: Partial<Area>) => {
    setAreas(prev => prev.map(area => 
      area.id === id ? { ...area, ...updates } : area
    ))
  }, [])

  const generateImageMapCode = useCallback(() => {
    if (!areas.length) return ''
    
    const mapName = 'imagemap'
    const fileName = imageName || 'your-image.jpg'
    let html = `<img src="${fileName}" alt="Image Map" usemap="#${mapName}" />\n`
    html += `<map name="${mapName}">\n`
    
    areas.forEach(area => {
      const coords = area.coords.join(',')
      html += `  <area shape="${area.shape}" coords="${coords}" href="${area.href || '#'}" alt="${area.alt}" title="${area.title}" />\n`
    })
    
    html += `</map>`
    return html
  }, [areas, imageName])

  const handleAreaDoubleClick = useCallback((areaId: string) => {
    setSelectedArea(areaId)
    setShowPropertiesEditor(true)
  }, [])

  const handleUpdateAreaProperties = useCallback((updates: Partial<Area>) => {
    if (selectedArea) {
      updateAreaProperties(selectedArea, updates)
    }
  }, [selectedArea, updateAreaProperties])

  const selectedAreaData = selectedArea ? areas.find(area => area.id === selectedArea) : null

  // 模式切换处理函数
  const handleViewModeChange = useCallback((mode: 'edit' | 'preview') => {
    // 重置绘制状态
    setIsDrawing(false)
    setCurrentArea(null)
    setViewMode(mode)
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 工具栏 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Editor Tools</h2>
          </div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Image
            </button>
          
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-700">
              <button
                onClick={() => setSelectedTool('rect')}
                className={`px-5 py-3 text-sm font-medium transition-all duration-200 ${
                  selectedTool === 'rect' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                } border-r border-gray-300 dark:border-gray-600`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                </svg>
                Rectangle
              </button>
              <button
                onClick={() => setSelectedTool('circle')}
                className={`px-5 py-3 text-sm font-medium transition-all duration-200 ${
                  selectedTool === 'circle' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                Circle
              </button>
            </div>
          
            <button
              onClick={() => setAreas([])}
              className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          
            <div className="flex items-center gap-4">
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-700">
                <button
                  onClick={() => handleViewModeChange('edit')}
                  className={`px-5 py-3 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'edit' 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  } border-r border-gray-300 dark:border-gray-600`}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleViewModeChange('preview')}
                  className={`px-5 py-3 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'preview' 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </button>
              </div>
            </div>
          </div>
          
          {/* 工具说明 */}
          {image && (
            <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Guide</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {viewMode === 'edit' && selectedTool === 'rect' && 'Click and drag on the image to create rectangular areas'}
                    {viewMode === 'edit' && selectedTool === 'circle' && 'Click and drag on the image to create circular areas'}
                    {viewMode === 'preview' && 'Test your image map by hovering and clicking on areas'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 主要编辑区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 图像编辑器/预览器 */}
        <div className="lg:col-span-2">
          {viewMode === 'edit' ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Image Editor</h3>
                </div>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800">
                {!image ? (
                  <div className="aspect-video bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No image uploaded</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click "Upload Image" to get started</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      ref={imageRef}
                      src={image}
                      alt="Upload"
                      className="max-w-full rounded-lg border border-gray-200 dark:border-gray-600"
                      style={{ display: 'block' }}
                    />
                    <canvas
                      ref={canvasRef}
                      key={`canvas-${viewMode}`}
                      className="absolute top-0 left-0 cursor-crosshair rounded-lg"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ImageMapPreview 
              image={image}
              areas={areas}
              imageName={imageName}
            />
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 区域列表 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Areas ({areas.length})</h3>
              </div>
            </div>
            <div className="p-6 dark:bg-gray-800">
              {areas.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3V1m0 20v-2m8-10a4 4 0 01-4-4V3a2 2 0 012-2h4a2 2 0 012 2v2a4 4 0 01-4 4z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No areas created yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Start by drawing on the image</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {areas.map((area, index) => (
                    <motion.div
                      key={area.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedArea === area.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedArea(area.id)}
                      onDoubleClick={() => handleAreaDoubleClick(area.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {area.shape === 'rect' ? (
                              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/>
                              </svg>
                            )}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Area {index + 1}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {area.shape}: {area.coords.join(', ')}
                          </p>
                          {area.href && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 truncate mt-1">
                              → {area.href}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAreaDoubleClick(area.id)
                            }}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Edit properties"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteArea(area.id)
                            }}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete area"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
            )}
            </div>
          </div>

          {/* 代码生成 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-900 dark:to-indigo-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Code</h3>
              </div>
            </div>
            <div className="p-6 dark:bg-gray-800">
              {areas.length > 0 ? (
                <div className="space-y-4">
                  <textarea
                    value={generateImageMapCode()}
                    readOnly
                    className="w-full h-32 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-xs p-3 rounded-md border border-gray-300 dark:border-gray-600 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Generated HTML will appear here..."
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(generateImageMapCode())}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No code generated yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Create areas to generate HTML code</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* 属性编辑器 */}
      {showPropertiesEditor && selectedAreaData && (
        <AreaPropertiesEditor
          area={selectedAreaData}
          onUpdate={handleUpdateAreaProperties}
          onClose={() => setShowPropertiesEditor(false)}
        />
      )}
    </div>
  )
}