import { useState } from 'react'
import { signInWithGoogle } from '../lib/supabase'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try { await signInWithGoogle() } catch { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Teal glow bg */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 500, height: 500,
        background: 'radial-gradient(circle, var(--teal-dim) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 360, textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 68, height: 68,
            background: 'var(--teal)',
            borderRadius: 20, marginBottom: 20,
            boxShadow: '0 0 40px var(--teal-border)',
          }}>
            <span style={{ fontFamily: 'Georgia,serif', fontWeight: 900, fontSize: 36, color: '#fff', lineHeight: 1 }}>C</span>
          </div>
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: 40,
            fontWeight: 900, letterSpacing: '-0.04em',
            color: 'var(--text1)', marginBottom: 10,
          }}>
            CLiPR
          </div>
          <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.6 }}>
            Save anything on mobile.<br/>Find it on desktop. Instantly.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 24px',
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {[
              ['⚡', 'Real-time sync across all devices'],
              ['🔍', 'Search everything instantly'],
              ['📎', 'Links, notes, images & files'],
              ['⭐', 'Favorites, archive & categories'],
            ].map(([icon, text]) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', background: 'var(--mint)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13, color: 'var(--text2)', textAlign: 'left',
              }}>
                <span style={{ fontSize: 15 }}>{icon}</span>{text}
              </div>
            ))}
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '13px',
              background: loading ? 'var(--border)' : 'var(--surface)',
              border: '1.5px solid var(--border2)',
              borderRadius: 'var(--radius-md)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 15, fontWeight: 600, color: 'var(--text1)',
              transition: 'all 0.2s',
              boxShadow: 'var(--shadow)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          <p style={{ marginTop: 14, fontSize: 11, color: 'var(--text3)' }}>
            Free · Private · No ads
          </p>
        </div>
      </div>
    </div>
  )
}
