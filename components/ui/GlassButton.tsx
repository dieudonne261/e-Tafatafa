'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

interface GlassButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  primary?: boolean
  className?: string
  style?: React.CSSProperties
  icon?: ReactNode
  type?: 'button' | 'submit' | 'reset'
  id?: string
  title?: string
  'aria-label'?: string
}

export function GlassButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  primary = false,
  className = '',
  style = {},
  icon,
  type = 'button',
  id,
  title,
  'aria-label': ariaLabel
}: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`glass-btn ${primary ? 'primary' : ''} ${className}`}
      style={style}
      id={id}
      title={title}
      aria-label={ariaLabel}
      whileHover={!disabled && !loading ? { scale: 1.05, y: -2 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </motion.button>
  )
}
