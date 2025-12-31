import { ImageMapEditor, ThemeToggle, Footer } from './components'
import { APP_CONFIG } from './config/app'

function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--bg-border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <span className="text-lg font-semibold">ImageMap</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <div style={{ borderBottom: '1px solid var(--bg-border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Create Image Maps
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Draw interactive areas on images and generate HTML code instantly.
          </p>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <ImageMapEditor />
        </div>
      </main>

      {/* Footer */}
      <Footer 
        author={APP_CONFIG.author.name}
        githubUrl={APP_CONFIG.project.repository.url}
        version={`v${APP_CONFIG.project.version}`}
      />
    </div>
  )
}

export default App
