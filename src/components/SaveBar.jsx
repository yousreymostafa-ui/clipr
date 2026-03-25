import { useState, useRef } from 'react'
import { Send, Paperclip, X, Image, FileText } from 'lucide-react'
import { detectType, fetchLinkMeta, isMobile, isImageFile, isPDF } from '../lib/utils'
import { saveClip, updateClip, uploadFile } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const CATEGORIES = ['General', 'Read Later', 'Work', 'Inspo', 'News', 'Personal', 'Research', 'Ideas', 'Media']

export default function SaveBar({ onSaved }) {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('General')
  const [note, setNote] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [showExtras, setShowExtras] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(false)
  const fileRef = useRef()
  const inputRef = useRef()

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setInput(file.name)
  }

  const clearFile = () => {
    setPendingFile(null)
    setInput('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSave = async () => {
    if ((!input.trim() && !pendingFile) || saving || !user) return
    setSaving(true)
    setError(null)

    try {
      let clipData = {
        user_id: user.id,
        category,
        tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        note: note.trim() || null,
        device: isMobile() ? 'mobile' : 'desktop',
        archived: false,
        favorited: false,
      }

      if (pendingFile) {
        // File upload
        setUploadProgress(true)
        const uploaded = await uploadFile(user.id, pendingFile)
        setUploadProgress(false)
        const isImg = isImageFile(pendingFile.type)
        clipData = {
          ...clipData,
          type: isImg ? 'image' : 'file',
          raw_input: pendingFile.name,
          title: pendingFile.name,
          file_url: uploaded.url,
          file_name: pendingFile.name,
          file_type: pendingFile.type,
        }
      } else {
        const type = detectType(input.trim())
        clipData = {
          ...clipData,
          type,
          raw_input: input.trim(),
          url: type === 'link' ? input.trim() : null,
          title: type === 'link'
            ? (() => { try { return new URL(input.trim()).hostname.replace('www.', '') } catch { return input.trim() } })()
            : input.trim().slice(0, 80),
          site_name: type === 'link'
            ? (() => { try { return new URL(input.trim()).hostname.replace('www.', '') } catch { return '' } })()
            : null,
        }
      }

      const saved = await saveClip(clipData)
      setInput(''); setNote(''); setTags(''); setPendingFile(null); setShowExtras(false)
      if (fileRef.current) fileRef.current.value = ''
      onSaved?.()

      // Background meta fetch for links
      if (clipData.type === 'link' && saved?.id) {
        fetchLinkMeta(input.trim()).then(async meta => {
          await updateClip(saved.id, {
            title: meta.title || input.trim(),
            description: meta.description || null,
            image_url: meta.image || null,
            site_name: meta.siteName || null,
          }).catch(() => {})
          onSaved?.()
        })
      }
    } catch (e) {
      setError('Save failed. Try again.')
      setUploadProgress(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: `linear-gradient(to top, var(--bg) 75%, transparent)`,
      padding: '16px 14px',
      paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
    }}>
      {/* Category pills */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 8,
        scrollbarWidth: 'none', paddingBottom: 2,
      }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '4px 12px',
            background: category === cat ? 'var(--teal)' : 'var(--surface)',
            border: `1px solid ${category === cat ? 'var(--teal)' : 'var(--border)'}`,
            borderRadius: 20, color: category === cat ? '#fff' : 'var(--text2)',
            fontSize: 12, fontWeight: category === cat ? 600 : 400,
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            transition: 'all 0.15s',
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Extra fields (note + tags) */}
      {showExtras && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Tags (comma-separated: work, ai, news)"
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '7px 12px', fontSize: 12,
              color: 'var(--text2)', outline: 'none',
            }}
          />
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '7px 12px', fontSize: 12,
              color: 'var(--text2)', outline: 'none', resize: 'none',
            }}
          />
        </div>
      )}

      {/* File pending indicator */}
      {pendingFile && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
          padding: '7px 12px', background: 'var(--mint)',
          borderRadius: 10, border: '1px solid var(--teal-border)',
        }}>
          {isImageFile(pendingFile.type) ? <Image size={14} color="var(--teal)"/> : <FileText size={14} color="var(--teal)"/>}
          <span style={{ fontSize: 12, color: 'var(--teal)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {pendingFile.name}
          </span>
          <button onClick={clearFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 0 }}>
            <X size={14}/>
          </button>
        </div>
      )}

      {/* Main input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface)',
        border: '1.5px solid var(--border2)',
        borderRadius: 'var(--radius-lg)',
        padding: '6px 6px 6px 14px',
        boxShadow: 'var(--shadow)',
        transition: 'border-color 0.2s',
      }}>
        {/* Attach file button */}
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text3)', padding: 4, display: 'flex',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--teal)'}
          onMouseLeave={e => e.target.style.color = 'var(--text3)'}
          title="Upload image or PDF"
        >
          <Paperclip size={16}/>
        </button>

        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSave()}
          placeholder={pendingFile ? pendingFile.name : 'Paste a link, type a note…'}
          disabled={!!pendingFile}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontSize: 14, color: 'var(--text1)', caretColor: 'var(--teal)',
          }}
        />

        {/* More options */}
        <button
          onClick={() => setShowExtras(x => !x)}
          style={{
            background: showExtras ? 'var(--mint)' : 'none',
            border: `1px solid ${showExtras ? 'var(--teal-border)' : 'transparent'}`,
            borderRadius: 8, cursor: 'pointer', color: showExtras ? 'var(--teal)' : 'var(--text3)',
            fontSize: 11, padding: '4px 8px', transition: 'all 0.15s',
          }}
        >
          ···
        </button>

        {/* Send */}
        <button
          onClick={handleSave}
          disabled={(!input.trim() && !pendingFile) || saving}
          style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: (input.trim() || pendingFile) && !saving ? 'var(--teal)' : 'var(--border)',
            border: 'none',
            cursor: (input.trim() || pendingFile) && !saving ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: (input.trim() || pendingFile) && !saving ? '#fff' : 'var(--text3)',
            transition: 'all 0.2s',
          }}
        >
          {saving || uploadProgress
            ? <div style={{ width: 16, height: 16, border: '2px solid #fff4', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
            : <Send size={16} style={{ marginLeft: 1 }}/>
          }
        </button>
      </div>

      {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 5, paddingLeft: 4 }}>⚠ {error}</div>}

      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileSelect}/>
    </div>
  )
}
