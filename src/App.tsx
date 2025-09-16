import { ImageMapEditor, ThemeToggle, Logo, Footer } from './components'
import { APP_CONFIG } from './config/app'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Logo />
                <div className="border-l border-gray-200 dark:border-gray-600 pl-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Create interactive HTML image maps
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6">
            <ImageMapEditor />
          </main>
        </div>
      </div>
      
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
