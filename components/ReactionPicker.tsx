'use client'

import { useEffect, useRef } from 'react'
import { EmojiSvg, REACTION_LIST } from '@/lib/emojis'

interface ReactionPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function ReactionPicker({ onSelect, onClose }: ReactionPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      id="reaction-picker"
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 10px)',
        right: 'calc(100% - 76px)',
        padding: 8,
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 6,
        zIndex: 100,
        minWidth: 240,
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      {REACTION_LIST.map((emoji) => (
        <button
          key={emoji}
          id={`emoji-${emoji}`}
          onClick={() => onSelect(emoji)}
          style={{
            padding: '10px',
            border: 'none',
            background: 'transparent',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-soft)'
            e.currentTarget.style.transform = 'scale(1.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <EmojiSvg emoji={emoji} size={22} />
        </button>
      ))}
    </div>
  )
}
