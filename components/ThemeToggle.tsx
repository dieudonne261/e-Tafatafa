'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div style={{ width: 36, height: 36 }} />

  const next =
    theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'

  const Icon =
    theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  const label =
    theme === 'light'
      ? 'Switch to dark mode'
      : theme === 'dark'
      ? 'Switch to system mode'
      : 'Switch to light mode'

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setTheme(next)}
      title={label}
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        background: 'var(--bg-tertiary)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'var(--transition)',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget
        btn.style.background = 'var(--accent)'
        btn.style.color = 'var(--bg-primary)'
        btn.style.borderColor = 'var(--accent)'
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget
        btn.style.background = 'var(--bg-tertiary)'
        btn.style.color = 'var(--text-secondary)'
        btn.style.borderColor = 'var(--border)'
      }}
    >
      <Icon size={16} strokeWidth={2.5} />
    </button>
  )
}
