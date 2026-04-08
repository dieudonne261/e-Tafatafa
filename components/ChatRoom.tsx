'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageList } from './MessageList'
import { ChatInputWrapper } from './ChatInputWrapper'
import type { Message, UserProfile } from '@/lib/supabase/types'
import { X, CornerUpRight } from 'lucide-react'

interface ChatRoomProps {
  initialMessages: Message[]
  currentUserId: string
  userProfile: UserProfile
}

export function ChatRoom({ initialMessages, currentUserId, userProfile }: ChatRoomProps) {
  const [replyTo, setReplyTo] = useState<Message | null>(null)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
      <MessageList 
        initialMessages={initialMessages} 
        currentUserId={currentUserId} 
        onReply={setReplyTo}
      />
      <AnimatePresence>
        {replyTo && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ 
              padding: '12px 16px', 
              background: 'var(--glass-bg)', 
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid var(--border)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              zIndex: 10,
              position: 'relative',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{ width: 4, height: 36, background: 'var(--accent)', borderRadius: 'var(--radius-sm)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  RÉPONSE À {replyTo.users?.username || 'UTILISATEUR'}
                </span>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {replyTo.content ? replyTo.content : 
                   replyTo.image_url ? 'Pièce jointe : Image' : 
                   replyTo.gif_url ? 'Pièce jointe : GIF' : 'Contenu Média'}
                </div>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, background: 'var(--bg-tertiary)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setReplyTo(null)} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                color: 'var(--text-muted)',
                display: 'flex',
                padding: 8,
                borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition)'
              }}
            >
              <X size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <ChatInputWrapper user={userProfile} replyTo={replyTo} clearReply={() => setReplyTo(null)} />
    </div>
  )
}
