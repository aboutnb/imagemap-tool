import { useState, useRef, useCallback, useEffect } from 'react'
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
  const [selectedTool, setSelectedTool] = useState<'rect' | 'circle' | 'poly'>('rect')
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentArea, setCurrentArea] = useState<Partial<Area> | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [showPropertiesEditor, setShowPropertiesEditor] = useState(false)
  const [imageName, setImageName] = useState('')
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [polyPoints, setPolyPoints] = useState<number[]>([])
  
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
        setAreas([])
        setSelectedArea(null)
        setCurrentArea(null)
        setIsDrawing(false)
        setPolyPoints([])
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const drawAreas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 绘制已完成的区域
    areas.forEach((area, index) => {
      const isSelected = selectedArea === area.id
      ctx.strokeStyle = '#22c55e'
      ctx.fillStyle = isSelected ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.1)'
      ctx.lineWidth = 2
      
      if (area.shape === 'rect') {
        const [x1, y1, x2, y2] = area.coords
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
        ctx.fillStyle = '#fff'
        ctx.font = '12px Inter, sans-serif'
        ctx.fillText(`${index + 1}`, x1 + 6, y1 + 16)
      } else if (area.shape === 'circle') {
        const [cx, cy, r] = area.coords
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#fff'
        ctx.font = '12px Inter, sans-serif'
        ctx.fillText(`${index + 1}`, cx - 4, cy + 4)
      } else if (area.shape === 'poly') {
        const coords = area.coords
        if (coords.length >= 4) {
          ctx.beginPath()
          ctx.moveTo(coords[0], coords[1])
          for (let i = 2; i < coords.length; i += 2) {
            ctx.lineTo(coords[i], coords[i + 1])
          }
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          ctx.fillStyle = '#fff'
          ctx.font = '12px Inter, sans-serif'
          ctx.fillText(`${index + 1}`, coords[0] + 6, coords[1] + 16)
        }
      }
    })
    
    // 绘制正在创建的矩形或圆形
    if (currentArea && isDrawing && currentArea.shape !== 'poly') {
      ctx.strokeStyle = '#f59e0b'
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      
      if (currentArea.shape === 'rect') {
        const [x1, y1, x2, y2] = currentArea.coords!
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
      } else if (currentArea.shape === 'circle') {
        const [cx, cy, r] = currentArea.coords!
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
      }
      ctx.setLineDash([])
    }
    
    // 绘制正在创建的多边形
    if (polyPoints.length >= 2) {
      ctx.strokeStyle = '#f59e0b'
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      
      ctx.beginPath()
      ctx.moveTo(polyPoints[0], polyPoints[1])
      for (let i = 2; i < polyPoints.length; i += 2) {
        ctx.lineTo(polyPoints[i], polyPoints[i + 1])
      }
      ctx.stroke()
      ctx.setLineDash([])
      
      // 绘制点
      for (let i = 0; i < polyPoints.length; i += 2) {
        ctx.beginPath()
        ctx.arc(polyPoints[i], polyPoints[i + 1], 5, 0, 2 * Math.PI)
        ctx.fillStyle = i === 0 ? '#22c55e' : '#f59e0b'
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }
  }, [areas, selectedArea, currentArea, isDrawing, polyPoints])

  useEffect(() => { drawAreas() }, [drawAreas])

  useEffect(() => {
    const img = imageRef.current
    const canvas = canvasRef.current
    if (img && canvas && image) {
      const sync = () => {
        canvas.width = img.offsetWidth
        canvas.height = img.offsetHeight
        drawAreas()
      }
      if (img.complete) sync()
      else img.addEventListener('load', sync)
      window.addEventListener('resize', sync)
      return () => {
        img.removeEventListener('load', sync)
        window.removeEventListener('resize', sync)
      }
    }
  }, [image, drawAreas])

  useEffect(() => {
    if (viewMode === 'edit' && imageRef.current && canvasRef.current && image) {
      setTimeout(() => {
        canvasRef.current!.width = imageRef.current!.offsetWidth
        canvasRef.current!.height = imageRef.current!.offsetHeight
        drawAreas()
      }, 100)
    }
  }, [viewMode, image, drawAreas])

  // 完成多边形
  const finishPolygon = useCallback(() => {
    if (polyPoints.length >= 6) { // 至少3个点
      const newArea: Area = {
        id: Date.now().toString(),
        shape: 'poly',
        coords: [...polyPoints],
        href: '', alt: '', title: ''
      }
      setAreas(p => [...p, newArea])
    }
    setPolyPoints([])
    setIsDrawing(false)
  }, [polyPoints])

  // 键盘事件 - Enter 完成多边形，Escape 取消
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedTool === 'poly' && polyPoints.length > 0) {
        if (e.key === 'Enter') {
          finishPolygon()
        } else if (e.key === 'Escape') {
          setPolyPoints([])
          setIsDrawing(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedTool, polyPoints, finishPolygon])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || viewMode !== 'edit') return
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)

    if (selectedTool === 'poly') {
      // 检查是否点击了第一个点（闭合多边形）
      if (polyPoints.length >= 6) {
        const firstX = polyPoints[0]
        const firstY = polyPoints[1]
        const dist = Math.sqrt((x - firstX) ** 2 + (y - firstY) ** 2)
        if (dist < 15) {
          finishPolygon()
          return
        }
      }
      // 添加新点
      setPolyPoints(p => [...p, x, y])
      setIsDrawing(true)
    }
  }, [image, viewMode, selectedTool, polyPoints, finishPolygon])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || viewMode !== 'edit' || selectedTool === 'poly') return
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setIsDrawing(true)
    setCurrentArea({
      id: Date.now().toString(),
      shape: selectedTool,
      coords: selectedTool === 'rect' ? [x, y, x, y] : [x, y, 0],
      href: '', alt: '', title: ''
    })
  }, [image, selectedTool, viewMode])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentArea || viewMode !== 'edit' || selectedTool === 'poly') return
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (selectedTool === 'rect') {
      setCurrentArea(p => ({ ...p, coords: [p!.coords![0], p!.coords![1], x, y] }))
    } else if (selectedTool === 'circle') {
      const [cx, cy] = currentArea.coords!
      const r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      setCurrentArea(p => ({ ...p, coords: [cx, cy, Math.round(r)] }))
    }
  }, [isDrawing, currentArea, selectedTool, viewMode])

  const handleMouseUp = useCallback(() => {
    if (selectedTool === 'poly') return
    if (isDrawing && currentArea && viewMode === 'edit') {
      setAreas(p => [...p, currentArea as Area])
      setCurrentArea(null)
    }
    setIsDrawing(false)
  }, [isDrawing, currentArea, viewMode, selectedTool])

  const handleDoubleClick = useCallback(() => {
    if (selectedTool === 'poly' && polyPoints.length >= 6) {
      finishPolygon()
    }
  }, [selectedTool, polyPoints, finishPolygon])

  const deleteArea = useCallback((id: string) => {
    setAreas(p => p.filter(a => a.id !== id))
    setSelectedArea(null)
  }, [])

  const updateAreaProperties = useCallback((id: string, updates: Partial<Area>) => {
    setAreas(p => p.map(a => a.id === id ? { ...a, ...updates } : a))
  }, [])

  const generateCode = useCallback(() => {
    if (!areas.length) return ''
    const name = 'imagemap'
    const file = imageName || 'image.jpg'
    let html = `<img src="${file}" alt="Image Map" usemap="#${name}" />\n<map name="${name}">\n`
    areas.forEach(a => {
      html += `  <area shape="${a.shape}" coords="${a.coords.join(',')}" href="${a.href || '#'}" alt="${a.alt}" title="${a.title}" />\n`
    })
    return html + '</map>'
  }, [areas, imageName])

  const selectedAreaData = selectedArea ? areas.find(a => a.id === selectedArea) : null

  // 切换工具时清除未完成的多边形
  const handleToolChange = (tool: 'rect' | 'circle' | 'poly') => {
    if (polyPoints.length > 0) {
      setPolyPoints([])
    }
    setIsDrawing(false)
    setCurrentArea(null)
    setSelectedTool(tool)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upload Image
        </button>

        <div className="h-6 w-px" style={{ background: 'var(--bg-border)' }} />

        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--bg-border)' }}>
          <button
            onClick={() => handleToolChange('rect')}
            className="px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            style={{ 
              background: selectedTool === 'rect' ? 'var(--accent)' : 'var(--bg-card)',
              color: selectedTool === 'rect' ? '#000' : 'var(--text-secondary)'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
            </svg>
            Rectangle
          </button>
          <button
            onClick={() => handleToolChange('circle')}
            className="px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            style={{ 
              background: selectedTool === 'circle' ? 'var(--accent)' : 'var(--bg-card)',
              color: selectedTool === 'circle' ? '#000' : 'var(--text-secondary)'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
            </svg>
            Circle
          </button>
          <button
            onClick={() => handleToolChange('poly')}
            className="px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            style={{ 
              background: selectedTool === 'poly' ? 'var(--accent)' : 'var(--bg-card)',
              color: selectedTool === 'poly' ? '#000' : 'var(--text-secondary)'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4l8 6-3 8H7l-3-8z" />
            </svg>
            Polygon
          </button>
        </div>

        <div className="h-6 w-px" style={{ background: 'var(--bg-border)' }} />

        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--bg-border)' }}>
          <button
            onClick={() => { setIsDrawing(false); setCurrentArea(null); setPolyPoints([]); setViewMode('edit') }}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{ 
              background: viewMode === 'edit' ? 'var(--text-primary)' : 'var(--bg-card)',
              color: viewMode === 'edit' ? 'var(--bg)' : 'var(--text-secondary)'
            }}
          >
            Edit
          </button>
          <button
            onClick={() => { setIsDrawing(false); setCurrentArea(null); setPolyPoints([]); setViewMode('preview') }}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{ 
              background: viewMode === 'preview' ? 'var(--text-primary)' : 'var(--bg-card)',
              color: viewMode === 'preview' ? 'var(--bg)' : 'var(--text-secondary)'
            }}
          >
            Preview
          </button>
        </div>

        {areas.length > 0 && (
          <>
            <div className="h-6 w-px" style={{ background: 'var(--bg-border)' }} />
            <button 
              onClick={() => setAreas([])} 
              className="btn"
              style={{ color: '#ef4444' }}
            >
              Clear All
            </button>
          </>
        )}
      </div>

      {/* 多边形提示 */}
      {selectedTool === 'poly' && image && viewMode === 'edit' && (
        <div 
          className="px-4 py-3 rounded-lg text-sm flex items-center gap-3"
          style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Polygon Mode:</strong> Click to add points. 
            {polyPoints.length >= 6 ? ' Click the first point (green) or double-click to finish.' : ' Add at least 3 points.'}
            {polyPoints.length > 0 && ' Press Escape to cancel.'}
          </span>
          {polyPoints.length > 0 && (
            <span className="ml-auto text-xs" style={{ color: '#f59e0b' }}>
              {polyPoints.length / 2} points
            </span>
          )}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <div className="card p-1">
            {viewMode === 'edit' ? (
              !image ? (
                <div 
                  className="aspect-video flex items-center justify-center cursor-pointer rounded-lg transition-colors"
                  style={{ background: 'var(--bg-hover)' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--bg-border)' }}
                    >
                      <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>Click to upload an image</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>or drag and drop</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img ref={imageRef} src={image} alt="Editor" className="w-full rounded-lg" />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 cursor-crosshair rounded-lg"
                    onClick={handleCanvasClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onDoubleClick={handleDoubleClick}
                  />
                </div>
              )
            ) : (
              <ImageMapPreview image={image} areas={areas} imageName={imageName} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Areas */}
          <div className="card">
            <div 
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--bg-border)' }}
            >
              <span className="font-medium">Areas</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{areas.length}</span>
            </div>
            <div className="p-2 max-h-64 overflow-auto">
              {areas.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No areas yet</p>
              ) : (
                <div className="space-y-1">
                  {areas.map((area, i) => (
                    <div
                      key={area.id}
                      onClick={() => setSelectedArea(area.id)}
                      onDoubleClick={() => { setSelectedArea(area.id); setShowPropertiesEditor(true) }}
                      className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors"
                      style={{ 
                        background: selectedArea === area.id ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                        color: selectedArea === area.id ? 'var(--accent)' : 'var(--text-primary)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium"
                          style={{ background: 'var(--bg-hover)' }}
                        >
                          {i + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          {area.shape === 'rect' && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
                            </svg>
                          )}
                          {area.shape === 'circle' && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" strokeWidth={2} />
                            </svg>
                          )}
                          {area.shape === 'poly' && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4l8 6-3 8H7l-3-8z" />
                            </svg>
                          )}
                          <span className="text-sm capitalize">{area.shape === 'poly' ? 'Polygon' : area.shape}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedArea(area.id); setShowPropertiesEditor(true) }}
                          className="p-1.5 rounded transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteArea(area.id) }}
                          className="p-1.5 rounded transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Code Output */}
          <div className="card">
            <div 
              className="px-4 py-3"
              style={{ borderBottom: '1px solid var(--bg-border)' }}
            >
              <span className="font-medium">Generated Code</span>
            </div>
            <div className="p-4">
              {areas.length > 0 ? (
                <div className="space-y-3">
                  <pre 
                    className="p-3 rounded-lg text-xs overflow-auto max-h-40 font-mono"
                    style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}
                  >
                    {generateCode()}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(generateCode())}
                    className="btn btn-primary w-full"
                  >
                    Copy Code
                  </button>
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  Draw areas to generate code
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {showPropertiesEditor && selectedAreaData && (
        <AreaPropertiesEditor
          area={selectedAreaData}
          onUpdate={(updates) => updateAreaProperties(selectedAreaData.id, updates)}
          onClose={() => setShowPropertiesEditor(false)}
        />
      )}
    </div>
  )
}
