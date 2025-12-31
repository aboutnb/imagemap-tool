interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      </div>
      <span className="text-lg font-semibold text-white">ImageMap</span>
    </div>
  )
}
