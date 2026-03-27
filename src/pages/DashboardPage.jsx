import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Sun, Moon, LogOut, Star, X } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getClips, subscribeToClips, signOut } from '../lib/supabase'
import ClipCard from '../components/ClipCard'
import SaveBar from '../components/SaveBar'

const VIEWS = ['All', 'Links', 'Notes', 'Images', 'Files', 'Favorites', 'Archive']

export default function DashboardPage() {
  const { user } = useAuth()
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [activeView, setActiveView] = useState('All')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [gridMode, setGridMode] = useState(false)
  const [syncPulse, setSyncPulse] = useState(false)
  const searchRef = useRef()

  useEffect(() => {
    const saved = localStorage.getItem('clipr-theme')
    if (saved === 'dark') { setIsDark(true); document.documentElement.setAttribute('data-theme', 'dark') }
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
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
    const channel = subscribeToClips(user.id, payload => {
      setSyncPulse(true); setTimeout(() => setSyncPulse(false), 800)
      if (payload.eventType === 'INSERT') setClips(p => [payload.new, ...p])
      else if (payload.eventType === 'DELETE') setClips(p => p.filter(c => c.id !== payload.old.id))
      else if (payload.eventType === 'UPDATE') setClips(p => p.map(c => c.id === payload.new.id ? payload.new : c))
    })
    return () => channel.unsubscribe()
  }, [loadClips, user.id])

  const openSearch = () => {
    setSearchOpen(true)
    setTimeout(() => searchRef.current?.focus(), 50)
  }
  const closeSearch = () => { setSearchOpen(false); setSearch('') }

  const filtered = useMemo(() => {
    return clips.filter(c => {
      const archived = Boolean(c.archived)
      if (activeView === 'Archive') return archived
      if (archived) return false
      if (activeView === 'Links') return c.type === 'link'
      if (activeView === 'Notes') return c.type === 'text'
      if (activeView === 'Images') return c.type === 'image'
      if (activeView === 'Files') return c.type === 'file'
      if (activeView === 'Favorites') return c.favorited
      if (search) {
        const q = search.toLowerCase()
        return [c.title, c.description, c.raw_input, c.content, c.url, c.site_name, c.note, ...(c.tags||[])]
          .filter(Boolean).some(s => s.toLowerCase().includes(q))
      }
      return true
    }).filter(c => {
      if (!search || activeView !== 'All') return true
      const q = search.toLowerCase()
      return [c.title, c.description, c.raw_input, c.content, c.url, c.site_name, c.note, ...(c.tags||[])]
        .filter(Boolean).some(s => s.toLowerCase().includes(q))
    })
  }, [clips, activeView, search])

  const countFor = v => ({
    All: clips.filter(c => !c.archived).length,
    Links: clips.filter(c => !c.archived && c.type==='link').length,
    Notes: clips.filter(c => !c.archived && c.type==='text').length,
    Images: clips.filter(c => !c.archived && c.type==='image').length,
    Files: clips.filter(c => !c.archived && c.type==='file').length,
    Favorites: clips.filter(c => !c.archived && c.favorited).length,
    Archive: clips.filter(c => c.archived).length,
  }[v] || 0)

  return (
    <div style={{ height: '100dvh', background: 'var(--bg)', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: '100%', maxWidth: 680,
        display: 'flex', flexDirection: 'column',
        height: '100dvh', background: 'var(--bg)',
        borderLeft: '.5px solid var(--border-card)',
        borderRight: '.5px solid var(--border-card)',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* ── HEADER ── */}
        {!searchOpen ? (
          <header style={{
            padding: '12px 18px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', background: 'var(--bg)',
            borderBottom: '.5px solid var(--border-card)', flexShrink: 0,
          }}>
            {/* CL/PR wordmark */}
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.03em', color: 'var(--text1)', lineHeight: 1 }}>
              CL<span style={{ color: 'var(--teal)' }}>/</span>PR
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Search icon — no search bar below */}
              <button onClick={openSearch} style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface2)', border: '.5px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text2)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
              {/* Theme toggle */}
              <button onClick={toggleTheme} style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface2)', border: '.5px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text2)' }}>
                {isDark ? <Sun size={14}/> : <Moon size={14}/>}
              </button>
              {/* Avatar */}
              {user?.user_metadata?.avatar_url
                ? <img src={user.user_metadata.avatar_url} alt="" onClick={signOut} title="Sign out" style={{ width: 32, height: 32, borderRadius: '50%', border: '.5px solid var(--border2)', cursor: 'pointer' }}/>
                : <button onClick={signOut} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--teal)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    {user?.user_metadata?.full_name?.[0] || 'M'}
                  </button>
              }
            </div>
          </header>
        ) : (
          /* Search active — replaces header */
          <div style={{
            padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg)', borderBottom: '.5px solid var(--border-card)',
            flexShrink: 0, animation: 'searchSlide .18s ease-out both',
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', border: '.5px solid var(--border-card)', borderRadius: 22, padding: '10px 14px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clips, notes, tags…"
                style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 15, color: 'var(--text1)', fontFamily: 'inherit' }}/>
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 0, display: 'flex' }}><X size={14}/></button>}
            </div>
            <button onClick={closeSearch} style={{ fontSize: 14, fontWeight: 500, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>Cancel</button>
          </div>
        )}

        {/* ── TABS + single view toggle ── */}
        <div style={{
          display: 'flex', gap: 5, padding: '8px 14px',
          overflowX: 'auto', scrollbarWidth: 'none',
          borderBottom: '.5px solid var(--border-card)', flexShrink: 0,
          background: 'var(--bg)', alignItems: 'center',
        }}>
          {VIEWS.map(v => {
            const count = countFor(v)
            return (
              <button key={v} onClick={() => setActiveView(v)} style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                background: activeView === v ? 'var(--teal)' : 'var(--surface)',
                border: `.5px solid ${activeView === v ? 'var(--teal)' : 'var(--border-card)'}`,
                color: activeView === v ? '#fff' : 'var(--text2)',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                fontFamily: 'inherit', transition: 'all .12s',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {v === 'Favorites' && <Star size={11} fill={activeView === v ? '#fff' : 'none'}/>}
                {v}
                {count > 0 && <span style={{ opacity: .6, fontSize: 11 }}>{count}</span>}
              </button>
            )
          })}
          {/* Single toggle icon — list/grid */}
          <button onClick={() => setGridMode(g => !g)} style={{
            marginLeft: 'auto', width: 32, height: 32, flexShrink: 0,
            borderRadius: 9, border: `.5px solid ${gridMode ? 'var(--teal)' : 'var(--border-card)'}`,
            background: gridMode ? 'var(--teal)' : 'var(--surface2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: gridMode ? '#fff' : 'var(--text2)',
          }}>
            {gridMode
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            }
          </button>
        </div>

        {/* ── FEED ── */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: gridMode ? '10px 14px 180px' : '10px 14px 180px',
          background: 'var(--bg)',
          scrollbarWidth: 'thin', scrollbarColor: 'var(--teal-border) transparent',
          ...(gridMode ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignContent: 'start' } : {}),
        }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)', gridColumn: '1/-1' }}>
              <div style={{ width: 28, height: 28, border: '2px solid var(--border-card)', borderTopColor: 'var(--teal)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 10px' }}/>
              <div style={{ fontSize: 14 }}>Loading…</div>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--text3)', gridColumn: '1/-1' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{search ? '🔍' : activeView === 'Archive' ? '📦' : activeView === 'Favorites' ? '⭐' : '✨'}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>
                {search ? 'No results' : activeView === 'Archive' ? 'Archive empty' : 'Nothing here yet'}
              </div>
              <div style={{ fontSize: 14 }}>{search ? 'Try different keywords' : 'Paste a link or note below'}</div>
            </div>
          )}

          {!loading && filtered.map((clip, i) => (
            gridMode ? (
              <div key={clip.id} style={{ background: 'var(--surface)', border: '.5px solid var(--border-card)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', animation: 'cardIn .2s ease-out both', animationDelay: `${i * .04}s` }}>
                {clip.image_url && <img src={clip.image_url} alt="" style={{ width: '100%', height: 72, objectFit: 'cover', display: 'block', borderBottom: '.5px solid var(--border-card)' }}/>}
                {!clip.image_url && (
                  <div style={{ height: 60, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {clip.type === 'link' && clip.site_name && (
                      <img src={`https://www.google.com/s2/favicons?domain=${clip.site_name}&sz=64`} alt="" style={{ width: 24, height: 24, borderRadius: 6 }} onError={e => e.target.style.display='none'}/>
                    )}
                    {clip.type !== 'link' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                  </div>
                )}
                <div style={{ padding: '8px 10px 9px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)', lineHeight: 1.35, marginBottom: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {clip.title || clip.raw_input?.slice(0,60) || 'Clip'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {clip.site_name || clip.category || clip.type} · {new Date(clip.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                  </div>
                </div>
              </div>
            ) : (
              <div key={clip.id} style={{ marginBottom: 8 }}>
                <ClipCard
                  clip={clip}
                  onDeleted={id => setClips(p => p.filter(c => c.id !== id))}
                  onUpdated={updated => setClips(p => p.map(c => c.id === updated.id ? updated : c))}
                />
              </div>
            )
          ))}
        </div>

        {/* ── SAVE BAR ── */}
        <SaveBar onSaved={loadClips}/>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cardIn { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:translateY(0); } }
        @keyframes searchSlide { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUpSheet { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
