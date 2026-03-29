import { useState } from 'react'
import { signInWithGoogle } from '../lib/supabase'

// Inline SVG logos — exact from uploaded files
const LogoLight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 810.92 187.18" style={{ height:42, width:'auto' }}>
    <defs>
      <linearGradient id="lg-login" x1="351.54" y1="93.59" x2="464.02" y2="93.59" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0c95a3"/>
        <stop offset="1" stopColor="#00c77f"/>
      </linearGradient>
    </defs>
    <path fill="currentColor" d="M93.59,187.18C41.88,187.18,0,145.3,0,93.59S41.88,0,93.59,0c35.42,0,65.41,19.65,81.18,47.83-15.77,8.27-17.06,9.05-34.65,17.58-9.05-15.77-26.63-26.63-46.54-26.63-30.25,0-54.81,24.82-54.81,54.81s24.56,54.81,54.81,54.81c20.68,0,38.78-11.12,48.09-28.7,17.58,9.05,18.1,10.08,34.64,17.58-15.77,29.73-46.28,49.9-82.73,49.9Z"/>
    <path fill="currentColor" d="M197.54,187.18V0h39.81v152.48h94.62v34.7h-134.44Z"/>
    <path fill="currentColor" d="M481.53,0h83.25c46.28,0,63.86,29.62,63.86,60.03s-17.58,60.04-63.86,60.04h-42.66v67.11h-40.59V0ZM522.12,88.08h31.54c18.61,0,35.68-4.19,35.68-28.05s-17.06-28.05-35.68-28.05h-31.54v56.1Z"/>
    <path fill="currentColor" d="M759.21,117.81l51.71,69.37h-49.64l-46.54-67.28h-19.91v67.28h-40.85V0h83.25c46.54,0,64.37,29.58,64.37,59.95,0,25.39-13.19,51.05-43.95,57.86h1.55ZM694.84,31.94v56.28h31.54c19.39,0,35.42-4.45,35.42-28.27s-16.03-28.01-35.42-28.01h-31.54Z"/>
    <path fill="url(#lg-login)" d="M423.43,0h40.59l-71.89,187.18h-40.59L423.43,0Z"/>
  </svg>
)

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    setLoading(true); setError(null)
    try { await signInWithGoogle() }
    catch { setError('Sign in failed. Try again.'); setLoading(false) }
  }

  return (
    <div style={{
      height: '100dvh',
      background: 'linear-gradient(160deg, #f0faf9 0%, #ffffff 45%, #fafffe 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 32px', fontFamily: "'DM Sans', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle gradient orbs */}
      <div style={{ position:'absolute', top:'-80px', right:'-60px', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(42,157,143,.08) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'-60px', left:'-40px', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(12,149,163,.06) 0%, transparent 70%)', pointerEvents:'none' }}/>

      {/* Logo */}
      <div style={{ color:'#111918', marginBottom:16 }}>
        <LogoLight/>
      </div>

      <p style={{ fontSize:16, color:'#486662', textAlign:'center', marginBottom:52, lineHeight:1.6, maxWidth:260 }}>
        Save anything.<br/>Find it anywhere.
      </p>

      {/* Sign in button */}
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width:'100%', maxWidth:320, height:54, borderRadius:16,
          background: loading ? '#edf0ef' : '#111918',
          border: 'none', cursor: loading ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          fontSize: 16, fontWeight: 700, color: loading ? '#90aeaa' : '#fff',
          fontFamily: 'inherit', transition: 'all .2s',
          boxShadow: loading ? 'none' : '0 4px 24px rgba(17,25,24,.2)',
        }}
      >
        {loading ? (
          <div style={{ width:20, height:20, border:'2px solid #90aeaa', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </>
        )}
      </button>

      {error && <p style={{ color:'#e03c31', fontSize:13, marginTop:14, textAlign:'center' }}>{error}</p>}

      <p style={{ fontSize:12, color:'#90aeaa', textAlign:'center', marginTop:32, lineHeight:1.7, maxWidth:280 }}>
        By continuing you agree to our Terms of Service and Privacy Policy
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
