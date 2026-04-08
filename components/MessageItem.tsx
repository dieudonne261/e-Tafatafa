import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Pencil, Trash2, Check, X, Smile, MessageSquareReply, AlertCircle, Download, ExternalLink, Send } from 'lucide-react'
import type { Message } from '@/lib/supabase/types'
import { AudioPlayer } from './AudioPlayer'
import { ReactionPicker } from './ReactionPicker'

interface MessageItemProps {
  message: Message
  currentUserId: string
  onEdit: (id: string, newContent: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onReact: (messageId: string, emoji: string) => Promise<void>
  onReply: () => void
  replyToMessage?: Message
}

import { EmojiSvg } from '@/lib/emojis'

export function MessageItem({
  message,
  currentUserId,
  onEdit,
  onDelete,
  onReact,
  onReply,
  replyToMessage,
}: MessageItemProps) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(message.content ?? '')
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isOwn = message.user_id === currentUserId
  const user = message.users
  const displayName =
    user?.username || user?.email?.split('@')[0] || 'Inconnu'
  
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??'

  // Group reactions by emoji
  const reactionGroups = message.reactions.reduce<
    Record<string, { emoji: string; count: number; reacted: boolean }>
  >((acc, r) => {
    if (!acc[r.emoji]) {
      acc[r.emoji] = { emoji: r.emoji, count: 0, reacted: false }
    }
    acc[r.emoji].count++
    if (r.user_id === currentUserId) acc[r.emoji].reacted = true
    return acc
  }, {})

  async function handleSaveEdit() {
    if (!draft.trim() || draft === message.content) {
      setEditing(false)
      return
    }
    setSaving(true)
    await onEdit(message.id, draft.trim())
    setSaving(false)
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') setEditing(false)
  }

  const timestamp = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
    locale: fr,
  })

  const [imgError, setImgError] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      id={`msg-${message.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        if (!showPicker && !showDeleteConfirm) {
          setHovered(false)
        }
      }}
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 20px',
        margin: '12px 5px',
        borderRadius: 'var(--radius)',
        background: hovered ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
        position: 'relative',
        width: '99%',
        maxWidth: '99%',
      }}
    >
      {/* Avatar */}
      <div
        title={displayName}
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-sm)',
          flexShrink: 0,
          overflow: 'hidden',
          background: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginTop: 2,
          border: '1px solid var(--border)',
        }}
      >
        {user?.avatar_url && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt={displayName}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          initials
        )}
      </div>

      {/* Content Container */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Reply Context */}
        <AnimatePresence>
          {replyToMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                marginBottom: 8, 
                padding: '6px 12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid var(--accent)',
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)',
                overflow: 'hidden'
              }}
            >
              <MessageSquareReply size={14} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{replyToMessage.users?.username || 'Utilisateur'}</strong> : {replyToMessage.content ? (replyToMessage.content.length > 50 ? replyToMessage.content.slice(0, 50) + '...' : replyToMessage.content) : 'Média'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sender Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
            }}
          >
            {displayName}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {timestamp}
          </span>
          {message.is_edited && (
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                opacity: 0.7,
              }}
            >
              (modifié)
            </span>
          )}
        </div>

        {/* Message Content */}
        <div style={{ position: 'relative' }}>
          {editing ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, width: '100%' }}
            >
              <textarea
                ref={inputRef as any}
                id={`edit-input-${message.id}`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown as any}
                autoFocus
                className="glass-input"
                rows={Math.min(3, draft.split('\n').length || 1)}
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  resize: 'none',
                  minHeight: '40px',
                  display: 'block'
                }}
              />
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="glass-btn primary"
                style={{ width: 36, height: 36, padding: 0, borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Send size={18} />
              </button>
              <button
                onClick={() => setEditing(false)}
                className="glass-btn"
                style={{ width: 36, height: 36, padding: 0, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Annuler"
              >
                <X size={18} />
              </button>
            </motion.div>
          ) : (
            <div style={{ marginTop: 2 }}>
              {message.content && (
                <div
                  style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {message.content}
                </div>
              )}
              {message.audio_url && (
                <div style={{ marginTop: 10 }}>
                  <AudioPlayer src={message.audio_url} />
                </div>
              )}
               {message.file_url && (
                <motion.a
                  whileHover={{ y: -2, boxShadow: '0 4px 12px var(--accent-soft)' }}
                  href={message.file_url}
                  download={message.file_name || 'file'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    marginTop: 10, textDecoration: 'none', color: 'var(--text-primary)',
                    width: 'max-content', maxWidth: '100%',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ background: 'var(--accent)', padding: 10, borderRadius: 'var(--radius-sm)', display: 'flex', color: '#fff' }}>
                    <Download size={18} strokeWidth={2.5} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {message.file_name || 'Pièce jointe'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Télécharger le document</div>
                  </div>
                </motion.a>
              )}
              
              {/* Media Previews */}
              {message.image_url && (
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowImageModal(true)}
                  style={{ 
                    marginTop: 10, borderRadius: 'var(--radius)', overflow: 'hidden', 
                    maxWidth: '100%', width: 'fit-content', border: '1px solid var(--border)', cursor: 'pointer',
                    background: 'var(--bg-elevated)' 
                  }}
                >
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img 
                    src={message.image_url} 
                    alt="media" 
                    style={{ 
                      maxHeight: 'min(450px, 50vh)', 
                      width: 'auto', 
                      maxWidth: '100%', 
                      objectFit: 'contain', 
                      display: 'block' 
                    }} 
                  />
                </motion.div>
              )}
              {message.gif_url && (
                <div style={{ marginTop: 10, borderRadius: 'var(--radius)', overflow: 'hidden', maxWidth: '100%', width: 'fit-content', border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={message.gif_url} alt="gif" style={{ maxHeight: 'min(350px, 40vh)', maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
                </div>
              )}
            </div>
          )}

          {/* Reactions */}
          <AnimatePresence>
            {Object.values(reactionGroups).length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 12,
                }}
              >
                {Object.values(reactionGroups).map(({ emoji, count, reacted }) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onReact(message.id, emoji)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: reacted ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: reacted ? 'var(--accent)' : 'var(--bg-tertiary)',
                      transition: 'var(--transition)',
                      color: reacted ? '#fff' : 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <EmojiSvg emoji={emoji} size={14} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{count}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Toolbar */}
      <AnimatePresence>
        {(hovered || showPicker) && !editing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              position: 'absolute',
              top: -16,
              right: 16,
              display: 'flex',
              gap: 4,
              zIndex: 10,
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            {/* Emoji react */}
            <div style={{ position: 'relative' }}>
              <ActionBtn
                id={`react-btn-${message.id}`}
                title="Réagir"
                onClick={() => setShowPicker((v) => !v)}
              >
                <Smile size={16} />
              </ActionBtn>
              {showPicker && (
                <div style={{ position: 'absolute', bottom: '100%', right: 0 }}>
                  <ReactionPicker
                    onSelect={(emoji) => {
                      onReact(message.id, emoji)
                      setShowPicker(false)
                    }}
                    onClose={() => setShowPicker(false)}
                  />
                </div>
              )}
            </div>

            <ActionBtn
              id={`reply-btn-${message.id}`}
              title="Répondre"
              onClick={onReply}
            >
              <MessageSquareReply size={16} />
            </ActionBtn>

            {isOwn && message.content && (
              <ActionBtn
                id={`edit-btn-${message.id}`}
                title="Modifier"
                onClick={() => {
                  setDraft(message.content ?? '')
                  setEditing(true)
                }}
              >
                <Pencil size={16} />
              </ActionBtn>
            )}

             {isOwn && (
              <div style={{ position: 'relative', display: 'flex' }}>
                <ActionBtn
                  id={`delete-btn-${message.id}`}
                  title="Supprimer"
                  danger
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={16} />
                </ActionBtn>

                <AnimatePresence>
                  {showDeleteConfirm && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: 20 }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        background: 'var(--bg-primary)',
                        padding: '0 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--accent)',
                        zIndex: 20,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)' }}>SÛR ?</span>
                      <button 
                        onClick={() => { onDelete(message.id); setShowDeleteConfirm(false); }}
                        style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        OUI
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', padding: 2 }}
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal Overlay */}
      <AnimatePresence>
        {showImageModal && message.image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(10px)', zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20, cursor: 'zoom-out'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              <img src={message.image_url} alt="full-size" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 'var(--radius)', boxShadow: '0 20px 80px rgba(0,0,0,0.8)' }} />
              <div style={{ position: 'absolute', top: -50, right: 0, display: 'flex', gap: 16 }}>
                <a 
                   href={message.image_url} 
                   target="_blank" 
                   rel="noreferrer" 
                   style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: '50%', display: 'flex' }}
                   title="Ouvrir l'original"
                >
                  <ExternalLink size={20} />
                </a>
                <button 
                  onClick={() => setShowImageModal(false)}
                  style={{ color: '#fff', background: 'var(--accent)', border: 'none', padding: 10, borderRadius: '50%', display: 'flex', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ActionBtn({
  children,
  title,
  danger,
  onClick,
  id,
}: {
  children: React.ReactNode
  title: string
  danger?: boolean
  onClick: () => void
  id: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, backgroundColor: danger ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)' }}
      whileTap={{ scale: 0.95 }}
      id={id}
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 8,
        border: 'none',
        background: 'transparent',
        color: danger ? '#ef4444' : 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'color .2s ease',
      }}
    >
      {children}
    </motion.button>
  )
}
