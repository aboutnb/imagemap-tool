import { motion } from 'framer-motion'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
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
      {/* Logo Icon */}
      <motion.div 
        className={`${sizeClasses[size]} relative bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden`}
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        
        {/* Custom ImageMap Icon */}
        <svg 
          className="w-6 h-6 text-white relative z-10" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {/* Image Frame */}
          <rect 
            x="3" 
            y="4" 
            width="18" 
            height="14" 
            rx="2" 
            ry="2" 
            strokeWidth={1.5}
          />
          
          {/* Mountain/Image Content */}
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M3 16l4-4 4 4 6-6 4 4"
          />
          
          {/* Interactive Dots/Areas */}
          <motion.circle 
            cx="7" 
            cy="9" 
            r="1.5" 
            fill="rgba(255,255,255,0.8)" 
            stroke="currentColor" 
            strokeWidth={0.5}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: 0 
            }}
          />
          <motion.circle 
            cx="15" 
            cy="11" 
            r="1.5" 
            fill="rgba(255,255,255,0.8)" 
            stroke="currentColor" 
            strokeWidth={0.5}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: 0.7 
            }}
          />
          <motion.circle 
            cx="11" 
            cy="7" 
            r="1.5" 
            fill="rgba(255,255,255,0.8)" 
            stroke="currentColor" 
            strokeWidth={0.5}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: 1.4 
            }}
          />
        </svg>
        
        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Logo Text */}
      <div className="flex flex-col gap-0.5">
        <motion.h1 
          className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
        >
          ImageMap
        </motion.h1>
        <motion.span 
          className="text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          Editor
        </motion.span>
      </div>
    </motion.div>
  )
}
