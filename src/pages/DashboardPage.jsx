import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Search, Sun, Moon, LogOut, Star, X, ChevronDown } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getClips, subscribeToClips, signOut } from '../lib/supabase'
import ClipCard from '../components/ClipCard'
import SaveBar from '../components/SaveBar'

const VIEWS = ['All', 'Links', 'Notes', 'Images', 'Files', 'Favorites', 'Archive']
const CATEGORIES = ['All', 'General', 'Read Later', 'Work', 'Inspo', 'News', 'Personal', 'Research', 'Ideas', 'Media']

export default function DashboardPage() {
  const { user } = useAuth()
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [view, setView] = useState('All')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [syncPulse, setSyncPulse] = useState(false)
  const [showCatFilter, setShowCatFilter] = useState(false)
  const searchRef = useRef()

  // Theme
  useEffect(() => {
    const saved = localStorage.getItem('clipr-theme-v3')
    if (saved === 'dark') { setIsDark(true); document.documentElement.setAttribute('data-theme', 'dark') }
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '')
    localStorage.setItem('clipr-theme-v3', next ? 'dark' : 'light')
  }

  const loadClips = useCallback(async () => {
    try { const data = await getClips(user.id); setClips(data) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [user.id])

  useEffect(() => {
    loadClips()
    const channel = subscribeToClips(user.id, payload => {
      setSyncPulse(true)
      setTimeout(() => setSyncPulse(false), 800)
      if (payload.eventType === 'INSERT') setClips(p => [payload.new, ...p])
      else if (payload.eventType === 'DELETE') setClips(p => p.filter(c => c.id !== payload.old.id))
      else if (payload.eventType === 'UPDATE') setClips(p => p.map(c => c.id === payload.new.id ? payload.new : c))
    })
    return () => channel.unsubscribe()
  }, [loadClips, user.id])

  const filtered = useMemo(() => {
    return clips.filter(c => {
      const archived = Boolean(c.archived)
      if (view === 'Archive') return archived
      if (archived) return false
      if (view === 'Links') return c.type === 'link'
      if (view === 'Notes') return c.type === 'text'
      if (view === 'Images') return c.type === 'image'
      if (view === 'Files') return c.type === 'file'
      if (view === 'Favorites') return c.favorited

      if (activeCategory !== 'All' && c.category !== activeCategory) return false

      if (search) {
        const q = search.toLowerCase()
        return [c.title, c.description, c.raw_input, c.content, c.url, c.site_name, c.note, c.file_name, ...(c.tags || [])]
          .filter(Boolean).some(s => s.toLowerCase().includes(q))
      }
      return true
    })
  }, [clips, view, search, activeCategory])

  const counts = useMemo(() => ({
    all: clips.filter(c => !c.archived).length,
    links: clips.filter(c => !c.archived && c.type === 'link').length,
    notes: clips.filter(c => !c.archived && c.type === 'text').length,
    images: clips.filter(c => !c.archived && c.type === 'image').length,
    files: clips.filter(c => !c.archived && c.type === 'file').length,
    favorites: clips.filter(c => !c.archived && c.favorited).length,
    archive: clips.filter(c => c.archived).length,
  }), [clips])

  const countFor = v => ({
    All: counts.all, Links: counts.links, Notes: counts.notes,
    Images: counts.images, Files: counts.files, Favorites: counts.favorites, Archive: counts.archive
  }[v] || 0)

  return (
    <div style={{
      height: '100dvh', background: 'var(--bg)',
      display: 'flex', justifyContent: 'center',
      transition: 'background 0.3s',
    }}>
      <div style={{
        width: '100%', maxWidth: 680,
        display: 'flex', flexDirection: 'column',
        height: '100dvh',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s, border-color 0.3s',
      }}>

        {/* ── HEADER ── */}
        <header style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)',
          flexShrink: 0,
          position: 'relative', zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: 'var(--teal)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Georgia,serif', fontWeight: 900, fontSize: 17, color: '#fff' }}>C</span>
            </div>
            <span style={{ fontFamily: 'Georgia,serif', fontWeight: 900, fontSize: 22, letterSpacing: '-0.04em', color: 'var(--text1)' }}>
              CLiPR
            </span>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>
              {counts.all} clips
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Live sync dot */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', background: 'var(--mint)',
              border: '1px solid var(--teal-border)', borderRadius: 20,
            }}>
              <div style={{ position: 'relative', width: 7, height: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', boxShadow: syncPulse ? '0 0 0 4px var(--teal-dim)' : 'none', transition: 'box-shadow 0.3s' }}/>
                {syncPulse && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--teal)', animation: 'ping 0.8s ease-out' }}/>}
              </div>
              <span style={{ fontSize: 10, color: 'var(--teal)', fontFamily: 'monospace', fontWeight: 700 }}>Live</span>
            </div>

            {/* Theme */}
            <button onClick={toggleTheme} style={{
              width: 32, height: 32, borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--surface2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text2)',
            }}>
              {isDark ? <Sun size={14}/> : <Moon size={14}/>}
            </button>

            {/* Avatar */}
            {user?.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url} alt="" onClick={signOut} title="Sign out"
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--border2)', cursor: 'pointer' }}/>
              : <button onClick={signOut} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 10, cursor: 'pointer', padding: '6px 10px',
                  fontSize: 11, color: 'var(--text2)',
                }}>
                  <LogOut size={13}/>
                </button>
            }
          </div>
        </header>

        {/* ── SEARCH + CATEGORY FILTER ── */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '8px 12px',
            transition: 'border-color 0.2s',
          }}>
            <Search size={14} style={{ color: 'var(--text3)', flexShrink: 0 }}/>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clips, tags, links…"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 13, color: 'var(--text1)',
              }}
            />

            {/* Category filter inside search bar */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowCatFilter(x => !x)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: activeCategory !== 'All' ? 'var(--teal)' : 'var(--border)',
                  border: 'none', borderRadius: 8, padding: '3px 8px',
                  cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  color: activeCategory !== 'All' ? '#fff' : 'var(--text2)',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {activeCategory} <ChevronDown size={10}/>
              </button>
              {showCatFilter && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: 6,
                  boxShadow: 'var(--shadow-lg)', zIndex: 100,
                  display: 'flex', flexDirection: 'column', gap: 2,
                  minWidth: 130,
                }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => { setActiveCategory(cat); setShowCatFilter(false) }} style={{
                      background: activeCategory === cat ? 'var(--mint)' : 'none',
                      border: 'none', borderRadius: 8, padding: '6px 10px',
                      cursor: 'pointer', fontSize: 12, textAlign: 'left',
                      color: activeCategory === cat ? 'var(--teal)' : 'var(--text1)',
                      fontWeight: activeCategory === cat ? 600 : 400,
                    }}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 0 }}>
                <X size={13}/>
              </button>
            )}
          </div>
        </div>

        {/* ── VIEW TABS ── */}
        <div style={{
          display: 'flex', gap: 5, padding: '8px 14px',
          overflowX: 'auto', scrollbarWidth: 'none',
          borderBottom: '1px solid var(--border)', flexShrink: 0,
          background: 'var(--surface)',
        }}>
          {VIEWS.map(v => {
            const count = countFor(v)
            const active = view === v
            return (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '5px 12px', borderRadius: 20, flexShrink: 0,
                background: active ? 'var(--teal)' : 'var(--surface2)',
                border: `1px solid ${active ? 'var(--teal)' : 'var(--border)'}`,
                color: active ? '#fff' : 'var(--text2)',
                fontSize: 12, fontWeight: active ? 600 : 400,
                cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.15s',
              }}>
                {v === 'Favorites' && <Star size={11} fill={active ? '#fff' : 'none'}/>}
                {v}
                {count > 0 && (
                  <span style={{
                    fontSize: 10, fontFamily: 'monospace',
                    opacity: 0.7,
                  }}>{count}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── FEED ── */}
        <div
          onClick={() => setShowCatFilter(false)}
          style={{
            flex: 1, overflowY: 'auto', padding: '10px 14px 220px',
            scrollbarWidth: 'thin',
          }}
        >
          {/* Search/filter info */}
          {(search || activeCategory !== 'All') && !loading && (
            <div style={{
              fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace',
              marginBottom: 10,
            }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              {search && ` for "${search}"`}
              {activeCategory !== 'All' && ` in ${activeCategory}`}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
              <div style={{
                width: 28, height: 28, border: '2px solid var(--border)',
                borderTopColor: 'var(--teal)', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite', margin: '0 auto 10px',
              }}/>
              <div style={{ fontSize: 13 }}>Loading your clips…</div>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--text3)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>
                {search ? '🔍' : view === 'Archive' ? '📦' : view === 'Favorites' ? '⭐' : '✨'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>
                {search ? 'No results' : view === 'Archive' ? 'Archive empty' : view === 'Favorites' ? 'No favorites yet' : 'Nothing here yet'}
              </div>
              <div style={{ fontSize: 13 }}>
                {search ? `Try different keywords` : 'Paste a link or note below'}
              </div>
            </div>
          )}

          {!loading && filtered.map(clip => (
            <div key={clip.id} style={{ marginBottom: 8 }}>
              <ClipCard
                clip={clip}
                onDeleted={id => setClips(p => p.filter(c => c.id !== id))}
                onUpdated={updated => setClips(p => p.map(c => c.id === updated.id ? updated : c))}
              />
            </div>
          ))}
        </div>

        {/* ── SAVE BAR ── */}
        <SaveBar onSaved={loadClips}/>
      </div>
    </div>
  )
}
