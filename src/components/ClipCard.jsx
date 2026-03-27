import { useState } from 'react'
import { Trash2, Copy, CheckCheck, Archive, ArchiveRestore, ExternalLink, Share2, FileText, Smartphone, Monitor, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { deleteClip, updateClip } from '../lib/supabase'
import { timeAgo, formatDate, isImageFile, isPDF } from '../lib/utils'

const CAT_COLORS = {
  'Read Later':'#3b82f6','Work':'#f59e0b','Inspo':'#a78bfa',
  'News':'#ef4444','Personal':'#10b981','Research':'#06b6d4',
  'General':'#9ab8b3','Ideas':'#f97316','Media':'#ec4899',
  'AI':'#6366f1','Design':'#8b5cf6',
}

export default function ClipCard({ clip, onDeleted, onUpdated }) {
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showDate, setShowDate] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [starAnim, setStarAnim] = useState(false)
  const [swiped, setSwiped] = useState(false)
  const [touchStartX, setTouchStartX] = useState(null)

  const isLink = clip.type === 'link'
  const isImage = clip.type === 'image' || isImageFile(clip.file_type)
  const isFile = clip.type === 'file' || isPDF(clip.file_type)
  const catColor = CAT_COLORS[clip.category] || '#9ab8b3'
  const isArchived = Boolean(clip.archived)
  const isFav = Boolean(clip.favorited)
  const content = clip.raw_input || clip.content || ''

  const domain = clip.site_name || (clip.url ? (() => {
    try { return new URL(clip.url).hostname.replace('www.', '') } catch { return '' }
  })() : '')

  // Clean title — never raw URL
  const title = (() => {
    if (!isLink) return content.slice(0, 200)
    if (clip.title && clip.title !== clip.url && clip.title !== clip.raw_input) return clip.title
    if (domain) return domain
    return 'Saved link'
  })()

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX)
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return
    const dx = touchStartX - e.changedTouches[0].clientX
    if (dx > 60) setSwiped(true)
    else if (dx < -20) setSwiped(false)
    setTouchStartX(null)
  }

  const handleCopy = async (e) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(clip.url || content || '')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    const url = clip.url || window.location.origin
    try {
      if (navigator.share) await navigator.share({ title, url })
      else { await navigator.clipboard.writeText(url); setSharing(true); setTimeout(() => setSharing(false), 2000) }
    } catch {}
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this clip?')) return
    setDeleting(true)
    try { await deleteClip(clip.id); onDeleted?.(clip.id) } catch { setDeleting(false) }
  }

  const handleArchive = async (e) => {
    e.stopPropagation()
    try { const u = await updateClip(clip.id, { archived: !isArchived }); onUpdated?.(u) } catch {}
  }

  const handleFav = async (e) => {
    e.stopPropagation()
    setStarAnim(true); setTimeout(() => setStarAnim(false), 350)
    try { const u = await updateClip(clip.id, { favorited: !isFav }); onUpdated?.(u) } catch {}
  }

  const handleOpen = () => {
    if (isLink && clip.url) window.open(clip.url, '_blank', 'noopener,noreferrer')
    else if (clip.file_url) window.open(clip.file_url, '_blank', 'noopener,noreferrer')
  }

  const isLong = content.length > 200
  const displayContent = isLong && !expanded ? content.slice(0, 200) + '…' : content

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        background: 'var(--surface)',
        border: '.5px solid var(--border-card)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        opacity: deleting ? 0.4 : 1,
        animation: 'cardIn 0.22s ease-out both',
        display: 'flex',
        position: 'relative',
        transition: 'transform 0.15s',
      }}
    >
      {/* Main card content */}
      <div
        onClick={(isLink || clip.file_url) ? handleOpen : undefined}
        style={{
          flex: 1, minWidth: 0,
          cursor: (isLink || clip.file_url) ? 'pointer' : 'default',
          transform: swiped ? 'translateX(-120px)' : 'translateX(0)',
          transition: 'transform 0.22s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* Image clip preview */}
        {isImage && clip.file_url && (
          <img src={clip.file_url} alt=""
            style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block', borderBottom: '.5px solid var(--border-card)' }}/>
        )}

        {/* PDF strip */}
        {isFile && clip.file_url && (
          <div style={{ padding: '10px 14px', borderBottom: '.5px solid var(--border-card)', background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'var(--teal)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={15} color="#fff"/>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text1)' }}>{clip.file_name || 'File'}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>PDF</div>
            </div>
          </div>
        )}

        <div style={{ padding: '12px 14px' }}>
          {/* TOP ROW: favicon inline + title + star */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 5 }}>

            {/* Inline favicon — small, no big thumbnail box */}
            {isLink && domain && (
              <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: 'var(--surface2)', border: '.5px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: 2 }}>
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                  alt="" style={{ width: 14, height: 14 }}
                  onError={e => e.target.style.display = 'none'}
                />
              </div>
            )}

            {/* Note/file icon inline */}
            {!isLink && !isImage && !isFile && (
              <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* TITLE FIRST */}
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text1)', lineHeight: 1.4, wordBreak: 'break-word', marginBottom: 3 }}>
                {isLink ? title : displayContent}
              </div>

              {/* DOMAIN SECOND */}
              {isLink && domain && (
                <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500, marginBottom: 4 }}>
                  {domain}
                </div>
              )}

              {isLink && clip.description && (
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 4 }}>
                  {clip.description}
                </div>
              )}
            </div>

            {/* Star — bigger, bounce */}
            <button onClick={handleFav} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 3, flexShrink: 0,
              color: isFav ? 'var(--gold)' : 'var(--border2)',
              transform: starAnim ? 'scale(1.5)' : 'scale(1)',
              transition: 'transform 0.25s cubic-bezier(.4,2,.6,1), color 0.15s',
            }}>
              <Star size={20} fill={isFav ? 'var(--gold)' : 'none'} strokeWidth={1.8}/>
            </button>
          </div>

          {/* Note expansion */}
          {!isLink && isLong && (
            <button onClick={e => { e.stopPropagation(); setExpanded(x => !x) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 3, marginBottom: 6, padding: 0 }}>
              {expanded ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
              {expanded ? 'Less' : 'More'}
            </button>
          )}

          {/* Note bar */}
          {clip.note && (
            <div style={{ fontSize: 13, color: 'var(--teal)', fontStyle: 'italic', padding: '4px 9px', background: 'var(--teal-dim)', borderRadius: 6, borderLeft: '2px solid var(--teal)', marginBottom: 8 }}>
              {clip.note}
            </div>
          )}

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
            {clip.category && clip.category !== 'General' && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${catColor}18`, color: catColor }}>
                {clip.category}
              </span>
            )}
            {clip.tags?.filter(Boolean).map(tag => (
              <span key={tag} style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--surface2)', borderRadius: 20, padding: '1px 7px' }}>#{tag}</span>
            ))}
            <span onClick={e => { e.stopPropagation(); setShowDate(s => !s) }}
              style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', flexShrink: 0 }}>
              {clip.device === 'mobile' ? <Smartphone size={10}/> : <Monitor size={10}/>}
              {showDate ? formatDate(clip.created_at) : timeAgo(clip.created_at)}
            </span>
          </div>

          {/* Action icons */}
          <div style={{ display: 'flex', gap: 6, paddingTop: 10, borderTop: '.5px solid var(--border-card)' }}>
            {(isLink || clip.file_url) && <IBtn icon={<ExternalLink size={15}/>} title="Open" onClick={handleOpen}/>}
            <IBtn icon={copied ? <CheckCheck size={15}/> : <Copy size={15}/>} title="Copy" onClick={handleCopy} active={copied}/>
            <IBtn icon={sharing ? <CheckCheck size={15}/> : <Share2 size={15}/>} title="Share" onClick={handleShare} teal active={sharing}/>
            <IBtn icon={isArchived ? <ArchiveRestore size={15}/> : <Archive size={15}/>} title={isArchived ? 'Restore' : 'Archive'} onClick={handleArchive}/>
            {isArchived && <IBtn icon={<Trash2 size={15}/>} title="Delete" onClick={handleDelete} danger/>}
          </div>
        </div>
      </div>

      {/* Swipe actions — revealed on left swipe */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        display: 'flex', overflow: 'hidden',
        transform: swiped ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.22s cubic-bezier(.4,0,.2,1)',
        borderRadius: `0 var(--radius) var(--radius) 0`,
      }}>
        <button onClick={handleShare} style={{ width: 60, height: '100%', background: 'var(--teal)', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#fff', fontSize: 11, fontWeight: 600 }}>
          <Share2 size={16}/>Share
        </button>
        <button onClick={handleDelete} style={{ width: 60, height: '100%', background: 'var(--danger)', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#fff', fontSize: 11, fontWeight: 600, borderRadius: `0 var(--radius) var(--radius) 0` }}>
          <Trash2 size={16}/>Delete
        </button>
      </div>
    </div>
  )
}

function IBtn({ icon, title, onClick, teal, danger, active }) {
  const [h, setH] = useState(false)
  const bg = danger ? (h ? '#fee2e2' : '#fef2f2')
    : teal ? (h || active ? 'var(--teal)' : 'var(--teal-dim)')
    : h ? 'var(--mint)' : 'var(--surface2)'
  const color = danger ? 'var(--danger)'
    : teal ? (h || active ? '#fff' : 'var(--teal)')
    : active ? 'var(--teal)' : 'var(--text2)'
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} title={title}
      style={{ width: 36, height: 36, border: 'none', borderRadius: 9, background: bg, cursor: 'pointer', color, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}>
      {icon}
    </button>
  )
}
