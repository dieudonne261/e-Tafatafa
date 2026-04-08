'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, MessageCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard, GlassButton, GlassInput, FadeIn, LiquidBackground } from '@/components/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState<'google' | 'magic' | null>(null)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleGoogle() {
    setLoading('google')
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(null)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading('magic')
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(null)
  }

  return (
    <>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Blobs (Dynamic but subtle) */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)', zIndex: 0 }} />

        <GlassCard
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            maxWidth: 920,
            minHeight: 560,
            overflow: 'hidden',
            borderRadius: 'var(--radius-xl)',
            border: 'none',
            boxShadow: 'var(--glass-shadow)',
            position: 'relative',
            zIndex: 1,
          }}
          hover={false}
          className="login-card"
        >
          {/* LEFT – Form Side */}
          <div
            style={{
              flex: 1.2,
              padding: 'clamp(1.5rem, 4vw, 3rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: 'var(--bg-primary)',
            }}
          >
            <FadeIn delay={0}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                <span className="playwrite-ie-brand" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                  e-Tafatafa
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.15} direction="left">
              <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
                Rejoignez le <span style={{ color: 'var(--accent)' }}>Flux.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.25}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 340, marginBottom: '2rem', opacity: 0.85 }}>
                Découvrez la conversation en temps réel sous sa forme la plus pure. Minimaliste, rapide et unifiée.
              </p>
            </FadeIn>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '1.5rem', border: '1px solid var(--accent)', borderRadius: 'var(--radius)' }}
              >
                <Sparkles size={32} style={{ color: 'var(--accent)', marginBottom: '0.75rem' }} />
                <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Lien magique envoyé</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Consulte <strong>{email}</strong> pour te connecter.
                </p>
                <GlassButton onClick={() => setSent(false)} style={{ borderRadius: 'var(--radius-sm)', padding: '0.4rem 1rem' }}>
                  Changer d'email
                </GlassButton>
              </motion.div>
            ) : (
              <FadeIn delay={0.35}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <GlassButton
                    onClick={handleGoogle}
                    disabled={loading !== null}
                    loading={loading === 'google'}
                    style={{ height: 52, width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontWeight: 600, fontSize: '0.95rem' }}
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    }
                  >
                    Continuer avec Google
                  </GlassButton>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ou avec Email</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  </div>

                  <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <GlassInput
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="nom@mail.com"
                      required
                      icon={<Mail size={18} />}
                      style={{ height: 52, borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                    />
                    <GlassButton
                      type="submit"
                      primary
                      disabled={loading !== null}
                      loading={loading === 'magic'}
                      style={{ height: 52, width: '100%', borderRadius: 'var(--radius)', background: 'var(--accent)', color: '#fff', fontSize: '1rem', fontWeight: 700 }}
                    >
                      Se connecter
                    </GlassButton>
                  </form>
                </div>
              </FadeIn>
            )}
          </div>

          {/* RIGHT – Visual Side */}
          <div
            className="login-image-panel"
            style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0a0a0b',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/login_modern_chat.png"
              alt="Global Network"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,11,0.95) 0%, transparent 70%)' }} />

            <div style={{ position: 'relative', zIndex: 2, padding: '2rem', width: '100%', marginTop: 'auto' }}>
              <FadeIn delay={0.5} direction="up">
                <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: 'var(--radius)' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>Temps réel global</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 400 }}>
                    "Le moyen le plus simple de se connecter avec tout le monde, partout, en même temps."
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </GlassCard>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 900px) {
              .login-image-panel { display: none !important; }
              .login-card { max-width: 500px !important; min-height: auto !important; }
            }
          `,
        }}
      />
    </>
  )
}
