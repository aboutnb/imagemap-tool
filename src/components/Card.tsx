import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl',
        'border border-white/20 hover:border-white/30 transition-all duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ className, children }: CardProps) {
  return (
    <div className={cn('pb-4 border-b border-white/10', className)}>
      {children}
    </div>
  )
}

export function CardContent({ className, children }: CardProps) {
  return (
    <div className={cn('pt-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children }: CardProps) {
  return (
    <h3 className={cn('text-xl font-semibold text-white', className)}>
      {children}
    </h3>
  )
}
