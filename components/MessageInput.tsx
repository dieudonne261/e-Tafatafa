'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Mic, MicOff, Loader2, Square, Image as ImageIcon, SmilePlus, Paperclip, Camera, X, File as FileIcon, Plus } from 'lucide-react'
import { Grid } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'

// Initialize GiphyFetch (Consider moving this to a config or .env)
const gf = new GiphyFetch('YEi0Ubh8wBZxDU1JYPmjk5tP5tYzNv8L') // Development key fallback or placeholder

interface MessageInputProps {
  onSendMessage: (payload: { text: string; image?: File; file?: File; gifUrl?: string }) => Promise<void>
  onSendAudio: (blob: Blob, mimeType: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({ onSendMessage, onSendAudio, disabled }: MessageInputProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedGif, setSelectedGif] = useState<string | null>(null)

  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showMobileActions, setShowMobileActions] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0])
      setSelectedFile(null)
      setSelectedGif(null)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setSelectedImage(null)
      setSelectedGif(null)
    }
  }

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if ((!text.trim() && !selectedImage && !selectedFile && !selectedGif) || sending) return

    setSending(true)
    await onSendMessage({
      text: text.trim(),
      image: selectedImage || undefined,
      file: selectedFile || undefined,
      gifUrl: selectedGif || undefined
    })

    setText('')
    setSelectedImage(null)
    setSelectedFile(null)
    setSelectedGif(null)
    setSending(false)
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        if (blob.size > 0) {
          setSending(true)
          await onSendAudio(blob, mimeType)
          setSending(false)
        }
        setRecordingTime(0)
      }

      recorder.start(100)
      mediaRecorderRef.current = recorder
      setRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1)
      }, 1000)
    } catch (err) {
      console.error('Failed to start recording:', err)
      alert("Microphone non accessible.")
    }
  }, [onSendAudio])

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }, [])

  const cancelRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop())
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current!.onstop = null
      mediaRecorderRef.current?.stop()
    }
    chunksRef.current = []
    setRecording(false)
    setRecordingTime(0)
  }, [])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div
      id="message-input-bar"
      style={{
        padding: '1rem',
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 20
      }}
    >
      {/* GIF Picker */}
      <AnimatePresence>
        {showGifPicker && (
          <GifPicker
            onSelect={(url) => {
              setSelectedGif(url)
              setSelectedImage(null)
              setSelectedFile(null)
              setShowGifPicker(false)
            }}
            onClose={() => setShowGifPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Media Previews */}
      <AnimatePresence>
        {(selectedImage || selectedFile || selectedGif) && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
              padding: '12px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              overflow: 'hidden'
            }}
          >
            {selectedImage && (
              <div style={{ position: 'relative', flexShrink: 0, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(selectedImage)} alt="Preview" style={{ width: 60, height: 60, objectFit: 'cover' }} />
                <button
                  onClick={() => setSelectedImage(null)}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedGif && (
              <div style={{ position: 'relative', flexShrink: 0, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedGif} alt="Gif" style={{ height: 60, objectFit: 'cover' }} />
                <button
                  onClick={() => setSelectedGif(null)}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-primary)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', flex: 1, maxWidth: '300px' }}>
                <div style={{ background: 'var(--accent)', padding: 8, borderRadius: 'var(--radius-sm)', display: 'flex' }}>
                  <FileIcon size={18} color="#fff" />
                </div>
                <span style={{ fontSize: '0.85rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedFile.name}
                </span>
                <button
                  onClick={() => setSelectedFile(null)}
                  style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <X size={16} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {recording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div style={{ position: 'relative' }}>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: 'var(--accent)' }}
              />
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
                <Mic size={20} />
              </div>
            </div>

            <div style={{ flex: 1, fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(recordingTime)}
            </div>

            <motion.button
              whileHover={{ scale: 1.02, background: 'var(--bg-tertiary)' }}
              whileTap={{ scale: 0.98 }}
              onClick={cancelRecording}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}
            >
              Annuler
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, background: 'var(--accent)' }}
              whileTap={{ scale: 0.98 }}
              onClick={stopRecording}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Send size={16} />
              Envoyer
            </motion.button>
          </motion.div>
        ) : (
          <motion.form
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSend}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
            <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

            {/* Attach Actions */}
            <AnimatePresence>
              {!text.trim() && (
                <motion.div
                  initial={{ width: 0, opacity: 0, scale: 0.8 }}
                  animate={{ width: 'auto', opacity: 1, scale: 1 }}
                  exit={{ width: 0, opacity: 0, scale: 0.8, overflow: 'hidden' }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
                >
                  {/* Mobile Toggle - Only show if NOT desktop */}
                  {!isDesktop && (
                    <IconButton
                      icon={showMobileActions ? <X size={20} /> : <Plus size={20} />}
                      onClick={() => setShowMobileActions(!showMobileActions)}
                      title="Plus d'actions"
                      style={{ background: showMobileActions ? 'var(--accent-soft)' : 'transparent', color: showMobileActions ? 'var(--accent)' : 'var(--text-secondary)' }}
                    />
                  )}

                  {/* Action Buttons */}
                  <AnimatePresence>
                    {(showMobileActions || isDesktop) && (
                      <motion.div
                        initial={isDesktop ? false : { opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -10 }}
                        className="action-buttons-container"
                        style={{
                          position: isDesktop ? 'static' : 'absolute',
                          bottom: isDesktop ? 'auto' : '100%',
                          left: isDesktop ? 'auto' : 10,
                          marginBottom: isDesktop ? 0 : 12,
                          padding: isDesktop ? 0 : '8px',
                          background: isDesktop ? 'transparent' : 'var(--bg-secondary)',
                          borderRadius: isDesktop ? 0 : 'var(--radius)',
                          border: isDesktop ? 'none' : '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 4px 15px var(--glass-shadow)',
                          zIndex: 100
                        }}
                      >
                        <IconButton icon={<ImageIcon size={20} />} onClick={() => { imageInputRef.current?.click(); setShowMobileActions(false); }} title="Image" disabled={disabled || sending} />
                        <IconButton icon={<Camera size={20} />} onClick={() => { cameraInputRef.current?.click(); setShowMobileActions(false); }} title="Appareil photo" disabled={disabled || sending} className="hidden md:flex" />
                        <IconButton icon={<SmilePlus size={20} />} onClick={() => { setShowGifPicker(!showGifPicker); setShowMobileActions(false); }} title="GIF" disabled={disabled || sending} />
                        <IconButton icon={<Paperclip size={20} />} onClick={() => { fileInputRef.current?.click(); setShowMobileActions(false); }} title="Fichier" disabled={disabled || sending} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Wrapper */}
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Votre message..."
                disabled={disabled || sending}
                className="glass-input"
                rows={Math.min(3, text.split('\n').length || 1)}
                style={{
                  padding: '0.8rem 1.25rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '1rem',
                  border: '1px solid var(--border)',
                  width: '100%',
                  resize: 'none',
                  maxHeight: '100px',
                  display: 'block'
                }}
              />
            </div>

            {/* Voice / Send Action */}
            {!text.trim() && !selectedImage && !selectedFile && !selectedGif ? (
              <IconButton
                icon={<Mic size={20} />}
                onClick={startRecording}
                disabled={disabled || sending}
                style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', width: 48, height: 48, border: '1px solid var(--border)' }}
              />
            ) : (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                type="submit"
                disabled={disabled || sending}
                style={{
                  width: 48, height: 48, borderRadius: 'var(--radius)', border: 'none',
                  background: 'var(--accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 15px var(--accent-soft)',
                  flexShrink: 0
                }}
              >
                {sending ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
              </motion.button>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function IconButton({ icon, onClick, title, disabled, style = {}, className = '' }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, background: 'var(--bg-tertiary)', color: 'var(--accent)' }}
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 44, height: 44, borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent',
        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'var(--transition)', ...style
      }}
      className={className}
    >
      {icon}
    </motion.button>
  )
}

function GifPicker({ onSelect, onClose }: { onSelect: (url: string) => void, onClose: () => void }) {
  const [query, setQuery] = useState('')

  const fetchGifs = (offset: number) => {
    if (query.trim()) {
      return gf.search(query, { offset, limit: 10 })
    }
    return gf.trending({ offset, limit: 10 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.98 }}
      style={{
        position: 'absolute', bottom: '100%', left: 16, width: 340, height: 420,
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        boxShadow: 'var(--glass-shadow)', borderRadius: 'var(--radius-lg)',
        display: 'flex', flexDirection: 'column', zIndex: 50, overflow: 'hidden',
        marginBottom: 16
      }}
    >
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher des GIFs..."
          className="glass-input"
          style={{ flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', border: '1px solid var(--border)', background: 'var(--bg-tertiary)' }}
        />
        <IconButton icon={<X size={20} />} onClick={onClose} style={{ width: 36, height: 36 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
        <Grid
          width={320}
          columns={2}
          fetchGifs={fetchGifs}
          key={query}
          onGifClick={(gif, e) => {
            e.preventDefault()
            onSelect(gif.images.original.url)
          }}
          noLink={true}
          hideAttribution={true}
        />
      </div>
    </motion.div>
  )
}
