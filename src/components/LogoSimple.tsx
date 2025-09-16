import { motion } from 'framer-motion'

interface LogoSimpleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LogoSimple({ className = '', size = 'md' }: LogoSimpleProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <motion.div 
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Simple Logo Icon */}
      <motion.div 
        className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg 
          className="w-5 h-5 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="14" rx="2" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16l4-4 4 4 6-6 4 4" />
          <circle cx="8" cy="10" r="1" fill="currentColor" opacity="0.8" />
          <circle cx="16" cy="12" r="1" fill="currentColor" opacity="0.8" />
        </svg>
      </motion.div>

      {/* Simple Logo Text */}
      <div className="flex flex-col gap-0.5">
        <h1 className={`${textSizeClasses[size]} font-bold text-gray-900 dark:text-white leading-tight`}>
          ImageMap
        </h1>
        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          Editor
        </span>
      </div>
    </motion.div>
  )
}
