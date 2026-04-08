'use client'

import { useRef, useState, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'

interface AudioPlayerProps {
  src: string
}

export function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
    setPlaying(!playing)
  }

  function handleTimeUpdate() {
    const audio = audioRef.current
    if (!audio) return
    setProgress(audio.currentTime / (audio.duration || 1))
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current
    if (!audio) return
    setDuration(audio.duration)
  }

  function handleEnded() {
    setPlaying(false)
    setProgress(0)
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * audio.duration
    setProgress(ratio)
  }

  const [waveform, setWaveform] = useState<number[]>([])

  useEffect(() => {
    setWaveform(Array.from({ length: 20 }).map(() => Math.random() * 12 + 4))
  }, [])

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 12px',
        borderRadius: 99,
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        marginTop: 4,
        maxWidth: 260,
        width: '100%',
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Play/Pause button */}
      <button
        id="audio-play-btn"
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Lecture'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
      </button>

      {/* Waveform / progress bar area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Progress bar */}
        <div
          onClick={handleSeek}
          style={{
            height: 4,
            borderRadius: 99,
            background: 'var(--border)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${progress * 100}%`,
              background: 'var(--accent)',
              borderRadius: 99,
              transition: 'width .1s linear',
            }}
          />
        </div>

        {/* Waveform decoration (visual only) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            marginTop: 4,
            height: 16,
            overflow: 'hidden',
          }}
        >
          {waveform.map((h, i) => (
            <div
              key={i}
              style={{
                width: 2,
                height: `${h}px`,
                borderRadius: 99,
                background:
                  i / 20 <= progress
                    ? 'var(--accent)'
                    : 'var(--border)',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Duration */}
      <span
        style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {formatTime(playing ? (audioRef.current?.currentTime ?? 0) : duration)}
      </span>
    </div>
  )
}
