'use client'

import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from './ThemeToggle'
import { MessageCircle, LogOut, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GlassButton } from './ui'
import type { UserProfile } from '@/lib/supabase/types'

interface TopbarProps {
  user: UserProfile
  onlineCount?: number
}

export function Topbar({ user, onlineCount = 0 }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName =
    user.username ||
    user.email?.split('@')[0] ||
    'Utilisateur'

  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <motion.header
      id="topbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="glass-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 12px',
        height: 60,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      <div className="container-responsive" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 0 }}>
        {/* Brand */}
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, cursor: 'pointer' }}
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push('/')}
        >
          <div
            className="playwrite-ie-brand"
            style={{
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              color: 'var(--accent)'
            }}
          >
            e-Tafatafa
          </div>
        </motion.div>

        {/* Global info - hidden on very small screens */}
        <div
          className="hidden-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flex: 1,
            minWidth: 0,
            paddingLeft: '1rem',
          }}
        >
        </div>

        <div style={{ flex: 1 }} className="hidden md:block" />

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <ThemeToggle />

          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4 }}>
            <div
              title={displayName}
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--border)',
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
            </div>
          </div>

          <GlassButton
            id="signout-btn"
            onClick={handleSignOut}
            title="Déconnexion"
            aria-label="Déconnexion"
            style={{
              width: 36,
              height: 36,
              padding: 0,
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              minWidth: 'auto',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <LogOut size={18} />
          </GlassButton>
        </div>
      </div>
    </motion.header>
  )
}
