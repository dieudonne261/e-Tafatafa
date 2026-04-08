'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  hover?: boolean
  initialScale?: number
  delay?: number
}

export function GlassCard({ 
  children, 
  className = '', 
  style = {}, 
  hover = true,
  initialScale = 0.95,
  delay = 0
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.8, 0.25, 1] }}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      className={`glass-panel ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  )
}
