import { useState, useRef } from 'react'
import { Send, Paperclip, Tag, Grid, Sun, List, X, Image, FileText } from 'lucide-react'
import { detectType, fetchLinkMeta, isMobile, isImageFile, isPDF } from '../lib/utils'
import { saveClip, updateClip, uploadFile } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const CATEGORIES = ['General','Read Later','Work','AI','Design','Inspo','News','Personal','Research','Ideas','Media']

export default function SaveBar({ onSaved }) {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('General')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [trayOpen, setTrayOpen] = useState(false)
  const fileRef = useRef()
  const inputRef = useRef()

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setInput(file.name)
    setTrayOpen(false)
  }

  const clearFile = () => {
    setPendingFile(null)
    setInput('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSave = async () => {
    if ((!input.trim() && !pendingFile) || saving || !user) return
    setSaving(true); setError(null)
    try {
      let clipData = {
        user_id: user.id, category,
        tags: [], note: null,
        device: isMobile() ? 'mobile' : 'desktop',
        archived: false, favorited: false,
      }

      if (pendingFile) {
        setUploading(true)
        const uploaded = await uploadFile(user.id, pendingFile)
        setUploading(false)
        const isImg = isImageFile(pendingFile.type)
        clipData = { ...clipData, type: isImg ? 'image' : 'file', raw_input: pendingFile.name, title: pendingFile.name, file_url: uploaded.url, file_name: pendingFile.name, file_type: pendingFile.type }
      } else {
        const type = detectType(input.trim())
        const hostname = type === 'link' ? (() => { try { return new URL(input.trim()).hostname.replace('www.','') } catch { return '' } })() : null
        clipData = { ...clipData, type, raw_input: input.trim(), url: type === 'link' ? input.trim() : null, title: type === 'link' ? (hostname || input.trim()) : input.trim().slice(0,80), site_name: hostname }
      }

      const saved = await saveClip(clipData)
      setInput(''); setPendingFile(null); setTrayOpen(false)
      if (fileRef.current) fileRef.current.value = ''
      onSaved?.()

      if (clipData.type === 'link' && saved?.id) {
        fetchLinkMeta(input.trim()).then(async meta => {
          await updateClip(saved.id, { title: meta.title || input.trim(), description: meta.description || null, image_url: meta.image || null, site_name: meta.siteName || null }).catch(() => {})
          onSaved?.()
        })
      }
    } catch { setError('Save failed. Try again.'); setUploading(false) }
    finally { setSaving(false) }
  }

  const trayItems = [
    { icon: <Paperclip size={22}/>, label: 'File', action: () => { fileRef.current?.click() } },
    { icon: <Image size={22}/>, label: 'Photo', action: () => { fileRef.current?.click() } },
    { icon: <Tag size={22}/>, label: 'Tag', action: () => { setTrayOpen(false); inputRef.current?.focus() } },
    { icon: <Grid size={22}/>, label: 'Category', action: () => setTrayOpen(false) },
    { icon: <Sun size={22}/>, label: 'Color', action: () => setTrayOpen(false) },
    { icon: <List size={22}/>, label: 'Bullets', action: () => setTrayOpen(false) },
  ]

  return (
    <>
      {/* Tray backdrop + sheet */}
      {trayOpen && (
        <>
          <div onClick={() => setTrayOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 200 }}/>
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--surface)', borderRadius: '22px 22px 0 0',
            padding: '14px 20px 36px', zIndex: 201,
            animation: 'slideUpSheet .22s cubic-bezier(.4,0,.2,1) both',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-card)', margin: '0 auto 18px' }}/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {trayItems.map(({ icon, label, action }) => (
                <button key={label} onClick={action} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>
                  <div style={{ width: 58, height: 58, borderRadius: 16, background: 'var(--surface2)', border: '.5px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text1)' }}>
                    {icon}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
                </button>
              ))}
            </div>
            {/* Category pills in tray */}
            <div style={{ marginTop: 18, display: 'flex', gap: 7, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setCategory(cat); setTrayOpen(false) }} style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                  background: category === cat ? 'var(--teal)' : 'var(--surface2)',
                  border: `.5px solid ${category === cat ? 'var(--teal)' : 'var(--border-card)'}`,
                  color: category === cat ? '#fff' : 'var(--text2)',
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  fontFamily: 'inherit', transition: 'all .12s',
                }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Save bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'var(--bg)',
        borderTop: '.5px solid var(--border-card)',
        padding: '12px 14px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      }}>
        {pendingFile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 12px', background: 'var(--teal-dim)', borderRadius: 10, border: '.5px solid var(--teal-border)' }}>
            <FileText size={14} color="var(--teal)"/>
            <span style={{ fontSize: 13, color: 'var(--teal)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingFile.name}</span>
            <button onClick={clearFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 0, display: 'flex' }}><X size={14}/></button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* + button */}
          <button onClick={() => setTrayOpen(true)} style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--surface2)', border: '.5px solid var(--border-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text1)', flexShrink: 0,
            transition: 'transform .15s',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>

          {/* Taller input bubble */}
          <div style={{
            flex: 1, height: 48,
            background: 'var(--surface2)',
            border: '.5px solid var(--border-card)',
            borderRadius: 24, padding: '0 16px',
            display: 'flex', alignItems: 'center',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSave()}
              onFocus={() => {}}
              placeholder={pendingFile ? pendingFile.name : 'Paste a link or type a note…'}
              disabled={!!pendingFile}
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 15, color: 'var(--text1)', fontFamily: 'inherit' }}
            />
          </div>

          {/* Send */}
          <button onClick={handleSave} disabled={(!input.trim() && !pendingFile) || saving}
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: (input.trim() || pendingFile) && !saving ? 'var(--teal)' : 'var(--surface2)',
              border: 'none', cursor: (input.trim() || pendingFile) ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all .2s',
              color: (input.trim() || pendingFile) && !saving ? '#fff' : 'var(--text3)',
            }}>
            {saving || uploading
              ? <div style={{ width: 18, height: 18, border: '2px solid #fff4', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/>
              : <Send size={17} style={{ marginLeft: 1 }}/>
            }
          </button>
        </div>

        {error && <div style={{ fontSize: 13, color: 'var(--danger)', marginTop: 5, paddingLeft: 4 }}>⚠ {error}</div>}
      </div>

      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileSelect}/>
    </>
  )
}
