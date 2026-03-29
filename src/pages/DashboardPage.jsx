import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Sun, Moon, X, Star, LogOut } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getClips, subscribeToClips, signOut } from '../lib/supabase'
import ClipCard from '../components/ClipCard'
import SaveBar from '../components/SaveBar'

const TABS = ['All','Links','Notes','Images','Files','Favorites','Archive']

const PLATFORMS = [
  { id:'all',       label:'All',       match:()=>true },
  { id:'tiktok',    label:'TikTok',    match:url=>url?.includes('tiktok') },
  { id:'facebook',  label:'Facebook',  match:url=>url?.includes('facebook')||url?.includes('fb.com') },
  { id:'instagram', label:'Instagram', match:url=>url?.includes('instagram') },
  { id:'youtube',   label:'YouTube',   match:url=>url?.includes('youtube')||url?.includes('youtu.be') },
  { id:'twitter',   label:'Twitter',   match:url=>url?.includes('twitter')||url?.includes('x.com') },
  { id:'websites',  label:'Websites',  match:url=>{
    if (!url) return false
    const social=['tiktok','facebook','fb.com','instagram','youtube','youtu.be','twitter','x.com']
    return !social.some(s=>url.includes(s))
  }},
]

// Inline logo components using actual SVG paths
const LogoLight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 810.92 187.18" style={{ height:20, width:'auto' }}>
    <defs>
      <linearGradient id="lg-hd-l" x1="351.54" y1="93.59" x2="464.02" y2="93.59" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0c95a3"/>
        <stop offset="1" stopColor="#00c77f"/>
      </linearGradient>
    </defs>
    <path fill="var(--text1)" d="M93.59,187.18C41.88,187.18,0,145.3,0,93.59S41.88,0,93.59,0c35.42,0,65.41,19.65,81.18,47.83-15.77,8.27-17.06,9.05-34.65,17.58-9.05-15.77-26.63-26.63-46.54-26.63-30.25,0-54.81,24.82-54.81,54.81s24.56,54.81,54.81,54.81c20.68,0,38.78-11.12,48.09-28.7,17.58,9.05,18.1,10.08,34.64,17.58-15.77,29.73-46.28,49.9-82.73,49.9Z"/>
    <path fill="var(--text1)" d="M197.54,187.18V0h39.81v152.48h94.62v34.7h-134.44Z"/>
    <path fill="var(--text1)" d="M481.53,0h83.25c46.28,0,63.86,29.62,63.86,60.03s-17.58,60.04-63.86,60.04h-42.66v67.11h-40.59V0ZM522.12,88.08h31.54c18.61,0,35.68-4.19,35.68-28.05s-17.06-28.05-35.68-28.05h-31.54v56.1Z"/>
    <path fill="var(--text1)" d="M759.21,117.81l51.71,69.37h-49.64l-46.54-67.28h-19.91v67.28h-40.85V0h83.25c46.54,0,64.37,29.58,64.37,59.95,0,25.39-13.19,51.05-43.95,57.86h1.55ZM694.84,31.94v56.28h31.54c19.39,0,35.42-4.45,35.42-28.27s-16.03-28.01-35.42-28.01h-31.54Z"/>
    <path fill="url(#lg-hd-l)" d="M423.43,0h40.59l-71.89,187.18h-40.59L423.43,0Z"/>
  </svg>
)

const LogoDark = () => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 810.92 187.18" style={{ height:20, width:'auto' }}>
    <defs>
      <linearGradient id="lg-hd-d" x1="351.54" y1="93.59" x2="464.02" y2="93.59" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0c95a3"/>
        <stop offset="1" stopColor="#00c77f"/>
      </linearGradient>
    </defs>
    <path fill="#eaeaea" d="M93.59,187.18C41.88,187.18,0,145.3,0,93.59S41.88,0,93.59,0c35.42,0,65.41,19.65,81.18,47.83-15.77,8.27-17.06,9.05-34.65,17.58-9.05-15.77-26.63-26.63-46.54-26.63-30.25,0-54.81,24.82-54.81,54.81s24.56,54.81,54.81,54.81c20.68,0,38.78-11.12,48.09-28.7,17.58,9.05,18.1,10.08,34.64,17.58-15.77,29.73-46.28,49.9-82.73,49.9Z"/>
    <path fill="#eaeaea" d="M197.54,187.18V0h39.81v152.48h94.62v34.7h-134.44Z"/>
    <path fill="#eaeaea" d="M481.53,0h83.25c46.28,0,63.86,29.62,63.86,60.03s-17.58,60.04-63.86,60.04h-42.66v67.11h-40.59V0ZM522.12,88.08h31.54c18.61,0,35.68-4.19,35.68-28.05s-17.06-28.05-35.68-28.05h-31.54v56.1Z"/>
    <path fill="#eaeaea" d="M759.21,117.81l51.71,69.37h-49.64l-46.54-67.28h-19.91v67.28h-40.85V0h83.25c46.54,0,64.37,29.58,64.37,59.95,0,25.39-13.19,51.05-43.95,57.86h1.55ZM694.84,31.94v56.28h31.54c19.39,0,35.42-4.45,35.42-28.27s-16.03-28.01-35.42-28.01h-31.54Z"/>
    <path fill="url(#lg-hd-d)" d="M423.43,0h40.59l-71.89,187.18h-40.59L423.43,0Z"/>
  </svg>
)

function HBtn({ onClick, children, title }) {
  return (
    <button onClick={onClick} title={title} style={{ width:34, height:34, borderRadius:10, background:'var(--surface2)', border:'.5px solid var(--border-card)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text2)', flexShrink:0, transition:'all .12s' }}>
      {children}
    </button>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [platform, setPlatform] = useState('all')
  const [gridMode, setGridMode] = useState(false)
  const searchRef = useRef()

  useEffect(() => {
    const saved = localStorage.getItem('clipr-theme')
    if (saved === 'dark') { setIsDark(true); document.documentElement.setAttribute('data-theme','dark') }
  }, [])

  const toggleTheme = () => {
    const next = !isDark; setIsDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '')
    localStorage.setItem('clipr-theme', next ? 'dark' : 'light')
  }

  const loadClips = useCallback(async () => {
    try { const data = await getClips(user.id); setClips(data) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [user.id])

  useEffect(() => {
    loadClips()
    const ch = subscribeToClips(user.id, payload => {
      if (payload.eventType === 'INSERT') setClips(p => [payload.new, ...p])
      else if (payload.eventType === 'DELETE') setClips(p => p.filter(c => c.id !== payload.old.id))
      else if (payload.eventType === 'UPDATE') setClips(p => p.map(c => c.id === payload.new.id ? payload.new : c))
    })
    return () => ch.unsubscribe()
  }, [loadClips, user.id])

  const openSearch = () => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 60) }
  const closeSearch = () => { setSearchOpen(false); setSearch(''); setPlatform('all'); searchRef.current?.blur() }

  const filtered = useMemo(() => {
    const pFn = PLATFORMS.find(p => p.id === platform)?.match || (() => true)
    return clips.filter(c => {
      const arch = Boolean(c.archived)
      if (activeTab === 'Archive') return arch
      if (arch) return false
      if (activeTab === 'Links' && c.type !== 'link') return false
      if (activeTab === 'Notes' && c.type !== 'text') return false
      if (activeTab === 'Images' && c.type !== 'image') return false
      if (activeTab === 'Files' && c.type !== 'file') return false
      if (activeTab === 'Favorites' && !c.favorited) return false
      if (platform !== 'all' && c.type === 'link' && !pFn(c.url)) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const fields = [c.title, c.description, c.raw_input, c.content, c.url, c.site_name, c.note, ...(c.tags||[])]
        if (!fields.filter(Boolean).some(s => s.toLowerCase().includes(q))) return false
      }
      return true
    })
  }, [clips, activeTab, search, platform])

  const count = v => ({ All:clips.filter(c=>!c.archived).length, Links:clips.filter(c=>!c.archived&&c.type==='link').length, Notes:clips.filter(c=>!c.archived&&c.type==='text').length, Images:clips.filter(c=>!c.archived&&c.type==='image').length, Files:clips.filter(c=>!c.archived&&c.type==='file').length, Favorites:clips.filter(c=>!c.archived&&c.favorited).length, Archive:clips.filter(c=>c.archived).length }[v]||0)

  const hStyle = { padding:'8px 18px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--glass-hd)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderBottom:'.5px solid var(--border-card)', flexShrink:0 }
  const tabStyle = { display:'flex', gap:5, padding:'8px 14px', overflowX:'auto', scrollbarWidth:'none', borderBottom:'.5px solid var(--border-card)', flexShrink:0, background:'var(--glass-tab)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', alignItems:'center' }

  return (
    <div style={{ height:'100dvh', background:'var(--bg-grad)', display:'flex', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:680, display:'flex', flexDirection:'column', height:'100dvh', position:'relative', overflow:'hidden' }}>

        {/* HEADER */}
        {!searchOpen ? (
          <header style={hStyle}>
            {isDark ? <LogoDark/> : <LogoLight/>}
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <HBtn onClick={openSearch} title="Search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></HBtn>
              <HBtn onClick={toggleTheme} title="Toggle theme">{isDark ? <Sun size={14}/> : <Moon size={14}/>}</HBtn>
              {user?.user_metadata?.avatar_url
                ? <img src={user.user_metadata.avatar_url} alt="" onClick={() => confirm('Sign out?') && signOut()} title="Sign out" style={{ width:32, height:32, borderRadius:'50%', border:'.5px solid var(--border-card)', cursor:'pointer', objectFit:'cover', flexShrink:0 }}/>
                : <HBtn onClick={() => confirm('Sign out?') && signOut()} title="Sign out"><LogOut size={14}/></HBtn>
              }
            </div>
          </header>
        ) : (
          <div style={{ ...hStyle, gap:10, animation:'searchSlide .18s ease-out both' }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:'var(--surface2)', border:'.5px solid var(--border-card)', borderRadius:22, padding:'10px 14px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clips, notes, tags…" style={{ flex:1, border:'none', background:'none', outline:'none', fontSize:'16px', color:'var(--text1)', fontFamily:'inherit' }}/>
              {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:0, display:'flex' }}><X size={14}/></button>}
            </div>
            <button onClick={closeSearch} style={{ fontSize:14, fontWeight:500, color:'var(--teal)', background:'none', border:'none', cursor:'pointer', padding:0, flexShrink:0, fontFamily:'inherit' }}>Cancel</button>
          </div>
        )}

        {/* Platform filters — only when search open */}
        {searchOpen && (
          <div style={{ display:'flex', gap:7, padding:'8px 14px', overflowX:'auto', scrollbarWidth:'none', flexShrink:0, background:'var(--glass-tab)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', borderBottom:'.5px solid var(--border-card)' }}>
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)} style={{ padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:500, background:platform===p.id?'var(--teal)':'var(--surface2)', border:`.5px solid ${platform===p.id?'var(--teal)':'var(--border-card)'}`, color:platform===p.id?'#fff':'var(--text2)', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, fontFamily:'inherit', transition:'all .12s' }}>
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* TABS */}
        <div style={tabStyle}>
          {TABS.map(v => {
            const n = count(v)
            return (
              <button key={v} onClick={() => setActiveTab(v)} style={{ padding:'5px 13px', borderRadius:20, fontSize:12, fontWeight:500, background:activeTab===v?'var(--teal)':'var(--surface)', border:`.5px solid ${activeTab===v?'var(--teal)':'var(--border-card)'}`, color:activeTab===v?'#fff':'var(--text2)', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, fontFamily:'inherit', transition:'all .12s', display:'flex', alignItems:'center', gap:4 }}>
                {v==='Favorites' && <Star size={10} fill={activeTab===v?'#fff':'none'}/>}
                {v}{n>0 && <span style={{ opacity:.6, fontSize:11 }}>{n}</span>}
              </button>
            )
          })}
          <button onClick={() => setGridMode(g => !g)} style={{ marginLeft:'auto', width:32, height:32, flexShrink:0, borderRadius:9, border:`.5px solid ${gridMode?'var(--teal)':'var(--border-card)'}`, background:gridMode?'var(--teal)':'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:gridMode?'#fff':'var(--text2)' }}>
            {gridMode
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            }
          </button>
        </div>

        {/* FEED */}
        <div style={{ flex:1, overflowY:'auto', padding:'10px 14px 180px', scrollbarWidth:'none', ...(gridMode ? { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, alignContent:'start' } : {}) }}>
          {loading && (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text3)', gridColumn:'1/-1' }}>
              <div style={{ width:24, height:24, border:'2px solid var(--border-card)', borderTopColor:'var(--teal)', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 10px' }}/>
              <div style={{ fontSize:14 }}>Loading…</div>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'70px 20px', color:'var(--text3)', gridColumn:'1/-1' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>{search?'🔍':activeTab==='Archive'?'📦':activeTab==='Favorites'?'⭐':'✨'}</div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--text2)', marginBottom:6 }}>{search?'No results':activeTab==='Archive'?'Archive empty':'Nothing here yet'}</div>
              <div style={{ fontSize:14 }}>{search?'Try different keywords':'Paste a link or note below'}</div>
            </div>
          )}

          {!loading && filtered.map((clip, i) =>
            gridMode ? (
              <div key={clip.id} onClick={() => {}} style={{ background:'var(--surface)', border:'.5px solid var(--border-card)', borderRadius:12, overflow:'hidden', animation:'cardIn .2s ease-out both', animationDelay:`${i*.04}s`, cursor:'pointer' }}>
                {clip.image_url
                  ? <img src={clip.image_url} alt="" style={{ width:'100%', height:70, objectFit:'cover', display:'block' }}/>
                  : <div style={{ height:70, background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <img src={`https://www.google.com/s2/favicons?domain=${clip.site_name}&sz=64`} alt="" style={{ width:24, height:24, borderRadius:5 }} onError={e => e.target.style.display='none'}/>
                    </div>
                }
                <div style={{ padding:'8px 10px 9px' }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text1)', lineHeight:1.3, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {clip.title || clip.site_name || clip.raw_input?.slice(0,40) || 'Clip'}
                  </div>
                  <div style={{ fontSize:10, color:'var(--text3)' }}>{clip.site_name||clip.type} · {new Date(clip.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
                </div>
              </div>
            ) : (
              <div key={clip.id} style={{ animationDelay:`${i*.04}s` }}>
                <ClipCard clip={clip} onDeleted={id => setClips(p => p.filter(c => c.id !== id))} onUpdated={updated => setClips(p => p.map(c => c.id === updated.id ? updated : c))}/>
              </div>
            )
          )}
        </div>

        <SaveBar onSaved={loadClips}/>
      </div>

      <style>{`
        *{-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{display:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes cardIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
        @keyframes searchSlide{from{opacity:0;transform:translateY(-5px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideUp{from{opacity:0;transform:translateY(100%);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      `}</style>
    </div>
  )
}
