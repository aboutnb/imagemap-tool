import { useState, useRef } from 'react'

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
}

export function ImageMapPreview({ image, areas, imageName }: ImageMapPreviewProps) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const isPointInRect = (x: number, y: number, coords: number[]) => {
    const [x1, y1, x2, y2] = coords
    return x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1, y2) && y <= Math.max(y1, y2)
  }

  const isPointInCircle = (x: number, y: number, coords: number[]) => {
    const [cx, cy, r] = coords
    return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= r
  }

  // 射线法判断点是否在多边形内
  const isPointInPolygon = (x: number, y: number, coords: number[]) => {
    let inside = false
    const n = coords.length / 2
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = coords[i * 2], yi = coords[i * 2 + 1]
      const xj = coords[j * 2], yj = coords[j * 2 + 1]
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }
    return inside
  }

  const isPointInArea = (x: number, y: number, area: Area) => {
    if (area.shape === 'rect') return isPointInRect(x, y, area.coords)
    if (area.shape === 'circle') return isPointInCircle(x, y, area.coords)
    if (area.shape === 'poly') return isPointInPolygon(x, y, area.coords)
    return false
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let found: Area | null = null
    for (const area of areas) {
      if (isPointInArea(x, y, area)) {
        found = area
        break
      }
    }

    if (found) {
      setHoveredArea(found.id)
      if (found.title) setTooltip({ text: found.title, x: e.clientX, y: e.clientY - 10 })
    } else {
      setHoveredArea(null)
      setTooltip(null)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    for (const area of areas) {
      if (isPointInArea(x, y, area)) {
        if (area.href && area.href !== '#') {
          window.open(area.href, '_blank')
        }
        break
      }
    }
  }

  // 将坐标数组转换为 SVG polygon points 格式
  const coordsToPoints = (coords: number[]) => {
    const points: string[] = []
    for (let i = 0; i < coords.length; i += 2) {
      points.push(`${coords[i]},${coords[i + 1]}`)
    }
    return points.join(' ')
  }

  // 获取多边形的边界框
  const getPolygonBounds = (coords: number[]) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (let i = 0; i < coords.length; i += 2) {
      minX = Math.min(minX, coords[i])
      maxX = Math.max(maxX, coords[i])
      minY = Math.min(minY, coords[i + 1])
      maxY = Math.max(maxY, coords[i + 1])
    }
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
  }

  if (!image) {
    return (
      <div className="aspect-video flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
        No image to preview
      </div>
    )
  }

  return (
    <div className="relative">
      <img
        ref={imageRef}
        src={image}
        alt={imageName}
        className="w-full rounded-lg cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoveredArea(null); setTooltip(null) }}
        onClick={handleClick}
      />
      
      {areas.map((area, i) => {
        const isHovered = hoveredArea === area.id
        
        if (area.shape === 'rect') {
          const [x1, y1, x2, y2] = area.coords
          return (
            <div
              key={area.id}
              className="absolute pointer-events-none transition-all"
              style={{
                left: Math.min(x1, x2),
                top: Math.min(y1, y2),
                width: Math.abs(x2 - x1),
                height: Math.abs(y2 - y1),
                background: isHovered ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.1)',
                border: `2px solid ${isHovered ? '#22c55e' : 'rgba(34, 197, 94, 0.5)'}`,
              }}
            >
              <span 
                className="absolute top-1 left-1 text-white text-xs px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(0,0,0,0.8)' }}
              >
                {i + 1}
              </span>
            </div>
          )
        } else if (area.shape === 'circle') {
          const [cx, cy, r] = area.coords
          return (
            <div
              key={area.id}
              className="absolute rounded-full pointer-events-none transition-all"
              style={{
                left: cx - r,
                top: cy - r,
                width: r * 2,
                height: r * 2,
                background: isHovered ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.1)',
                border: `2px solid ${isHovered ? '#22c55e' : 'rgba(34, 197, 94, 0.5)'}`,
              }}
            >
              <span 
                className="absolute top-1 left-1 text-white text-xs px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(0,0,0,0.8)' }}
              >
                {i + 1}
              </span>
            </div>
          )
        } else if (area.shape === 'poly') {
          const bounds = getPolygonBounds(area.coords)
          // 调整坐标相对于 SVG 视口
          const adjustedCoords = area.coords.map((val, idx) => 
            idx % 2 === 0 ? val - bounds.minX : val - bounds.minY
          )
          return (
            <svg
              key={area.id}
              className="absolute pointer-events-none"
              style={{
                left: bounds.minX,
                top: bounds.minY,
                width: bounds.width,
                height: bounds.height,
                overflow: 'visible'
              }}
            >
              <polygon
                points={coordsToPoints(adjustedCoords)}
                fill={isHovered ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.1)'}
                stroke={isHovered ? '#22c55e' : 'rgba(34, 197, 94, 0.5)'}
                strokeWidth="2"
              />
              <text
                x="8"
                y="16"
                fill="white"
                fontSize="12"
                fontFamily="Inter, sans-serif"
              >
                <tspan
                  style={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)',
                  }}
                >
                  {i + 1}
                </tspan>
              </text>
              <rect
                x="2"
                y="2"
                width="18"
                height="18"
                rx="4"
                fill="rgba(0,0,0,0.8)"
              />
              <text
                x="11"
                y="15"
                fill="white"
                fontSize="11"
                fontFamily="Inter, sans-serif"
                textAnchor="middle"
              >
                {i + 1}
              </text>
            </svg>
          )
        }
        return null
      })}

      {tooltip && (
        <div
          className="fixed text-white text-sm px-3 py-1.5 rounded-lg pointer-events-none z-50"
          style={{ 
            left: tooltip.x, 
            top: tooltip.y, 
            transform: 'translate(-50%, -100%)',
            background: 'rgba(0,0,0,0.9)'
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
