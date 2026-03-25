import { useState } from 'react'
import { Star, Trash2, Copy, CheckCheck, Archive, ArchiveRestore, ExternalLink, Share2, FileText, Smartphone, Monitor, ChevronDown, ChevronUp, X } from 'lucide-react'
import { deleteClip, updateClip } from '../lib/supabase'
import { timeAgo, formatDate, isImageFile, isPDF } from '../lib/utils'

const CAT_COLORS = {
  'Read Later': '#3b82f6', 'Work': '#f59e0b', 'Inspo': '#a78bfa',
  'News': '#ef4444', 'Personal': '#10b981', 'Research': '#06b6d4',
  'General': 'var(--text3)', 'Ideas': '#f97316', 'Media': '#ec4899',
}

export default function ClipCard({ clip, onDeleted, onUpdated }) {
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showDate, setShowDate] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [sharing, setSharing] = useState(false)

  const isLink = clip.type === 'link'
  const isImage = clip.type === 'image' || isImageFile(clip.file_type)
  const isFile = clip.type === 'file' || isPDF(clip.file_type)
  const catColor = CAT_COLORS[clip.category] || 'var(--text3)'
  const isArchived = Boolean(clip.archived)
  const isFav = Boolean(clip.favorited)

  const content = clip.raw_input || clip.content || ''
  const title = clip.title || (isLink ? clip.site_name || clip.url || content : content.slice(0, 80))
  const domain = clip.site_name || (clip.url ? (() => { try { return new URL(clip.url).hostname.replace('www.', '') } catch { return '' } })() : '')

  const handleCopy = async (e) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(clip.url || content || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    const shareUrl = clip.url || `${window.location.origin}?clip=${clip.id}`
    const shareData = { title: title, text: clip.description || content, url: shareUrl }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setSharing(true)
        setTimeout(() => setSharing(false), 2000)
      }
    } catch {}
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this clip permanently?')) return
    setDeleting(true)
    try { await deleteClip(clip.id); onDeleted?.(clip.id) }
    catch { setDeleting(false) }
  }

  const handleArchive = async (e) => {
    e.stopPropagation()
    try { const u = await updateClip(clip.id, { archived: !isArchived }); onUpdated?.(u) } catch {}
  }

  const handleFavorite = async (e) => {
    e.stopPropagation()
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
      onClick={(isLink || clip.file_url) ? handleOpen : undefined}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isFav ? 'var(--teal-border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: (isLink || clip.file_url) ? 'pointer' : 'default',
        transition: 'all 0.18s',
        opacity: deleting ? 0.4 : 1,
        animation: 'fadeIn 0.25s ease-out',
        boxShadow: isFav ? '0 0 0 1px var(--teal-border)' : 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = isFav ? '0 0 0 1px var(--teal-border)' : 'none'; e.currentTarget.style.transform = 'none' }}
    >
      {/* Image preview for link cards */}
      {isLink && clip.image_url && !imgError && (
        <img src={clip.image_url} alt="" onError={() => setImgError(true)}
          style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block', borderBottom: '1px solid var(--border)' }}/>
      )}

      {/* Image clip */}
      {isImage && clip.file_url && (
        <img src={clip.file_url} alt={clip.file_name || 'Image'}
          style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block', borderBottom: '1px solid var(--border)' }}/>
      )}

      {/* PDF/file preview */}
      {isFile && clip.file_url && (
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
          background: 'var(--mint)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 36, height: 36, background: 'var(--teal)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>{clip.file_name || 'File'}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>PDF Document</div>
          </div>
        </div>
      )}

      <div style={{ padding: '12px 14px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>

          {/* Favicon */}
          {isLink && (
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: '#fff', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt=""
                style={{ width: 18, height: 18 }}
                onError={e => { e.target.style.display = 'none' }}/>
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: 'var(--text1)',
              lineHeight: 1.35, marginBottom: isLink && clip.description ? 4 : 0,
              wordBreak: 'break-word',
            }}>
              {isLink ? title : displayContent}
            </div>

            {isLink && clip.description && (
              <div style={{
                fontSize: 12, color: 'var(--text2)', lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {clip.description}
              </div>
            )}
          </div>

          {/* Favorite star */}
          <button onClick={handleFavorite} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            color: isFav ? 'var(--gold)' : 'var(--border2)', flexShrink: 0,
            transition: 'color 0.15s',
          }}>
            <Star size={15} fill={isFav ? 'var(--gold)' : 'none'}/>
          </button>
        </div>

        {/* Note */}
        {clip.note && (
          <div style={{
            fontSize: 12, color: 'var(--teal)', fontStyle: 'italic',
            padding: '5px 8px', background: 'var(--teal-dim)',
            borderRadius: 6, borderLeft: '2px solid var(--teal)',
            marginBottom: 8,
          }}>
            {clip.note}
          </div>
        )}

        {/* Expand long text */}
        {!isLink && isLong && (
          <button onClick={e => { e.stopPropagation(); setExpanded(x => !x) }} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, color: 'var(--teal)', display: 'flex',
            alignItems: 'center', gap: 3, marginBottom: 6, padding: 0,
          }}>
            {expanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {/* Type */}
          <span style={{
            fontSize: 9, fontFamily: 'monospace', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '2px 6px', borderRadius: 20,
            background: 'var(--teal-dim)', color: 'var(--teal)',
          }}>
            {clip.type || 'note'}
          </span>

          {/* Category */}
          {clip.category && (
            <span style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.05em', padding: '2px 7px', borderRadius: 20,
              background: `${catColor}18`, color: catColor,
            }}>
              {clip.category}
            </span>
          )}

          {/* Domain for links */}
          {isLink && domain && (
            <span style={{ fontSize: 10, color: 'var(--teal)', fontFamily: 'monospace' }}>
              {domain}
            </span>
          )}

          {/* Tags */}
          {clip.tags?.filter(Boolean).map(tag => (
            <span key={tag} style={{
              fontSize: 10, color: 'var(--text3)',
              background: 'var(--surface2)', borderRadius: 20,
              padding: '1px 7px',
            }}>
              #{tag}
            </span>
          ))}

          {/* Device + date */}
          <span
            onClick={e => { e.stopPropagation(); setShowDate(s => !s) }}
            title={formatDate(clip.created_at)}
            style={{
              marginLeft: 'auto', fontSize: 10, color: 'var(--text3)',
              display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {clip.device === 'mobile' ? <Smartphone size={9}/> : <Monitor size={9}/>}
            {showDate ? formatDate(clip.created_at) : timeAgo(clip.created_at)}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex', gap: 5, flexWrap: 'wrap',
          paddingTop: 8, borderTop: '1px solid var(--border)',
        }}>
          {(isLink || clip.file_url) && (
            <Btn icon={<ExternalLink size={12}/>} label="Open" onClick={handleOpen}/>
          )}
          <Btn icon={copied ? <CheckCheck size={12}/> : <Copy size={12}/>}
            label={copied ? 'Copied' : 'Copy'} onClick={handleCopy}
            color={copied ? 'var(--teal)' : undefined}/>
          <Btn icon={sharing ? <CheckCheck size={12}/> : <Share2 size={12}/>}
            label={sharing ? 'Shared!' : 'Share'} onClick={handleShare}
            color={sharing ? 'var(--teal)' : undefined}/>
          <Btn
            icon={isArchived ? <ArchiveRestore size={12}/> : <Archive size={12}/>}
            label={isArchived ? 'Restore' : 'Archive'} onClick={handleArchive}/>
          {isArchived && (
            <Btn icon={<Trash2 size={12}/>} label="Delete" onClick={handleDelete}
              color="var(--danger)" bg="rgba(224,82,82,0.08)"/>
          )}
        </div>
      </div>
    </div>
  )
}

function Btn({ icon, label, onClick, color, bg }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 9px', border: 'none', borderRadius: 7,
        background: hover ? (bg || 'var(--mint)') : (bg || 'var(--surface2)'),
        cursor: 'pointer', fontSize: 11, fontWeight: 500,
        color: color || 'var(--text2)',
        transition: 'all 0.15s',
      }}
    >
      {icon} {label}
    </button>
  )
}
