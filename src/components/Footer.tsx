interface FooterProps {
  author?: string
  githubUrl?: string
  version?: string
}

export function Footer({ author = 'Developer', githubUrl = '#', version = 'v1.0.0' }: FooterProps) {
  return (
    <footer style={{ borderTop: '1px solid var(--bg-border)' }}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
        <span>© {new Date().getFullYear()} ImageMap Editor · {author}</span>
        <div className="flex items-center gap-4">
          <a 
            href={githubUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="transition-colors hover:underline"
            style={{ color: 'var(--text-secondary)' }}
          >
            GitHub
          </a>
          <span style={{ opacity: 0.5 }}>{version}</span>
        </div>
      </div>
    </footer>
  )
}
