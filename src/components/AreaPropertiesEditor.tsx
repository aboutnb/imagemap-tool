import { useState, useEffect } from 'react'

interface Area {
  id: string
  shape: 'rect' | 'circle' | 'poly'
  coords: number[]
  href: string
  alt: string
  title: string
}

interface AreaPropertiesEditorProps {
  area: Area
  onUpdate: (updates: Partial<Area>) => void
  onClose: () => void
}

export function AreaPropertiesEditor({ area, onUpdate, onClose }: AreaPropertiesEditorProps) {
  const [formData, setFormData] = useState({ href: '', alt: '', title: '' })

  useEffect(() => {
    setFormData({ href: area.href, alt: area.alt, title: area.title })
  }, [area])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div className="card w-full max-w-md">
        <div 
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--bg-border)' }}
        >
          <span className="font-medium">Edit Area</span>
          <button 
            onClick={onClose} 
            className="p-1 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Link URL</label>
            <input
              type="text"
              value={formData.href}
              onChange={(e) => setFormData(p => ({ ...p, href: e.target.value }))}
              className="input"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Alt Text</label>
            <input
              type="text"
              value={formData.alt}
              onChange={(e) => setFormData(p => ({ ...p, alt: e.target.value }))}
              className="input"
              placeholder="Description"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tooltip</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              className="input"
              placeholder="Hover text"
            />
          </div>

          <div className="pt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <p><span style={{ color: 'var(--text-secondary)' }}>Shape:</span> {area.shape}</p>
            <p><span style={{ color: 'var(--text-secondary)' }}>Coords:</span> {area.coords.join(', ')}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn btn-primary flex-1">Save</button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
