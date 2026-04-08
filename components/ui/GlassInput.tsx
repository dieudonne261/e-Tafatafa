'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  required?: boolean
  className?: string
  style?: React.CSSProperties
  icon?: ReactNode
  error?: string
}

export function GlassInput({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  required = false,
  className = '',
  style = {},
  icon,
  error
}: GlassInputProps) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {icon && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          {icon}
        </div>
      )}
      <motion.input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`glass-input w-full ${className}`}
        style={{
          paddingLeft: icon ? '2.5rem' : '1rem',
          borderColor: error ? 'var(--danger)' : undefined,
          ...style
        }}
        whileFocus={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--danger)'
          }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
