import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageItem } from './MessageItem'
import { ArrowDown } from 'lucide-react'
import type { Message, Reaction } from '@/lib/supabase/types'

interface MessageListProps {
  initialMessages: Message[]
  currentUserId: string
  onReply: (m: Message) => void
}

export function MessageList({ initialMessages, currentUserId, onReply }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)

  const supabase = createClient()

  /* ── Scroll helpers ── */
  const scrollToBottom = useCallback((force = false) => {
    if (force || atBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setUnread(0)
    }
  }, [])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    atBottomRef.current = nearBottom
    if (nearBottom) setUnread(0)
  }

  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | null>(null)

  /* ── Notifications & Connectivity ── */
  useEffect(() => {
    // Request permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const handleOnline = () => {
      setConnectionStatus('online')
      setTimeout(() => setConnectionStatus(null), 4000)

      if (document.visibilityState !== 'visible') {
        new Notification('Connexion rétablie', {
          body: 'Vous êtes de nouveau en ligne.',
          icon: '/favicon.ico'
        })
      }
    }

    const handleOffline = () => {
      setConnectionStatus('offline')

      if (document.visibilityState !== 'visible') {
        new Notification('Connexion perdue', {
          body: 'Vous êtes hors ligne. Les messages pourraient ne pas s\'envoyer.',
          icon: '/favicon.ico'
        })
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const playNotifSound = useCallback(() => {
    const audio = new Audio('/notif.mp3')
    audio.play().catch(e => console.log('Audio play failed:', e))
  }, [])

  const showMessageNotification = useCallback((msg: Message) => {
    if (document.visibilityState === 'visible') return
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = msg.users?.username || 'Nouveau message'
      const body = msg.content || (msg.image_url ? 'Image received' : 'Média')
      new Notification(title, { body, icon: msg.users?.avatar_url || '/favicon.ico' })
    }
  }, [])

  /* ── Realtime subscriptions ── */
  useEffect(() => {
    scrollToBottom(true)

    const channel = supabase
      .channel('global-chat')
      // New message
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newRow = payload.new as Message
          // Fetch user info + reactions
          const { data } = await supabase
            .from('messages')
            .select('*, users(*), reactions(*)')
            .eq('id', newRow.id)
            .single()

          if (data) {
            const isFromOthers = data.user_id !== currentUserId

            if (isFromOthers) {
              playNotifSound()
              showMessageNotification(data as Message)
            }

            setMessages((prev) => {
              const exists = prev.some((m) => m.id === data.id)
              if (exists) return prev
              return [...prev, data as Message]
            })
            if (!atBottomRef.current) {
              setUnread((u) => u + 1)
            } else {
              setTimeout(() => scrollToBottom(true), 50)
            }
          }
        }
      )
      // Message updated
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          const updated = payload.new as Message
          setMessages((prev) =>
            prev.map((m) =>
              m.id === updated.id ? { ...m, ...updated } : m
            )
          )
        }
      )
      // Message deleted
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          const { id } = payload.old as { id: string }
          setMessages((prev) => prev.filter((m) => m.id !== id))
        }
      )
      // Reaction added
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reactions' },
        (payload) => {
          const reaction = payload.new as Reaction
          setMessages((prev) =>
            prev.map((m) =>
              m.id === reaction.message_id
                ? {
                  ...m,
                  reactions: m.reactions.some((r) => r.id === reaction.id)
                    ? m.reactions
                    : [...m.reactions, reaction],
                }
                : m
            )
          )
        }
      )
      // Reaction removed
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'reactions' },
        (payload) => {
          const { id } = payload.old as { id: string }
          setMessages((prev) =>
            prev.map((m) => ({
              ...m,
              reactions: m.reactions.filter((r) => r.id !== id),
            }))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, scrollToBottom])

  /* ── Message actions ── */
  async function handleEdit(id: string, newContent: string) {
    await supabase
      .from('messages')
      .update({ content: newContent, is_edited: true })
      .eq('id', id)
  }

  async function handleDelete(id: string) {
    await supabase.from('messages').delete().eq('id', id)
  }

  async function handleReact(messageId: string, emoji: string) {
    const existing = messages
      .find((m) => m.id === messageId)
      ?.reactions.find((r) => r.emoji === emoji && r.user_id === currentUserId)

    if (existing) {
      await supabase.from('reactions').delete().eq('id', existing.id)
    } else {
      await supabase.from('reactions').insert({
        message_id: messageId,
        user_id: currentUserId,
        emoji,
      })
    }
  }

  /* ── Date separators ── */
  function isSameDay(a: string, b: string) {
    return new Date(a).toDateString() === new Date(b).toDateString()
  }

  function formatDateLabel(dateStr: string) {
    const d = new Date(dateStr)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === now.toDateString()) return "Aujourd'hui"
    if (d.toDateString() === yesterday.toDateString()) return 'Hier'
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Connection Status Toast */}
      <AnimatePresence>
        {connectionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              padding: '10px 20px',
              borderRadius: 'var(--radius)',
              background: connectionStatus === 'online' ? '#10b981' : '#ef4444',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 700,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
            {connectionStatus === 'online' ? 'Connexion rétablie' : 'Connexion perdue'}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        id="message-list"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem 0',
          display: 'flex',
          flexDirection: 'column',
          scrollBehavior: 'smooth'
        }}
      >
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              gap: 16,
              padding: '4rem 2rem',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>
              Le salon est tout neuf...
              <br />
              <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Dites bonjour à tout le monde !</span>
            </p>
          </motion.div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence initial={false} mode="popLayout">
            {messages.map((msg, i) => {
              const showDateSep =
                i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at)
              return (
                <div key={msg.id}>
                  {showDateSep && (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '1rem 1.5rem',
                        margin: '8px 0',
                      }}
                    >
                      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--border))' }} />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatDateLabel(msg.created_at)}
                      </span>
                      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--border), transparent)' }} />
                    </motion.div>
                  )}
                  <MessageItem
                    message={msg}
                    currentUserId={currentUserId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReact={handleReact}
                    onReply={() => onReply(msg)}
                    replyToMessage={msg.reply_to_id ? messages.find(m => m.id === msg.reply_to_id) : undefined}
                  />
                </div>
              )
            })}
          </AnimatePresence>
        </div>
        <div ref={bottomRef} style={{ height: 1 }} />
      </div>

      {/* Scroll-to-bottom indicator */}
      <AnimatePresence>
        {unread > 0 && (
          <motion.button
            id="scroll-to-bottom-btn"
            initial={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToBottom(true)}
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 99,
              border: 'none',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 25px var(--glass-shadow)',
              zIndex: 30,
            }}
          >
            <ArrowDown size={14} strokeWidth={3} />
            {unread} nouveau{unread > 1 ? 'x' : ''} message{unread > 1 ? 's' : ''}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
