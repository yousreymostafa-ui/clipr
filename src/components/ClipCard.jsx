import { useState } from 'react'
import { Trash2, Copy, CheckCheck, Archive, ArchiveRestore, ExternalLink, Share2, FileText, Smartphone, Monitor, Star, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { deleteClip, updateClip } from '../lib/supabase'
import { timeAgo, formatDate, isImageFile, isPDF, getPlatform } from '../lib/utils'

const CAT_COLORS = {
  'Read Later':'#3b82f6','Work':'#f59e0b','Inspo':'#a78bfa','AI':'#6366f1',
  'News':'#ef4444','Personal':'#10b981','Research':'#06b6d4',
  'General':'#9ab8b3','Ideas':'#f97316','Media':'#ec4899','Design':'#8b5cf6',
}

const PLT_COLORS = { tiktok:'#010101', facebook:'#1877f2', instagram:'#e1306c', twitter:'#000', youtube:'#ff0000', website:'#6b7280' }

function PlatformIcon({ platform, size = 14 }) {
  const icons = {
    tiktok: <svg width={size} height={size} viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>,
    facebook: <svg width={size} height={size} viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
    instagram: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/></svg>,
    youtube: <svg width={size} height={size} viewBox="0 0 24 24" fill="white"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#ff0000"/></svg>,
    twitter: <svg width={size} height={size} viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    website: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  }
  return icons[platform] || icons.website
}

function PreviewPopup({ clip, onClose }) {
  const domain = clip.site_name || (clip.url ? (() => { try { return new URL(clip.url).hostname.replace('www.','') } catch { return '' } })() : '')
  const platform = getPlatform(clip.url)
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:999, display:'flex', alignItems:'flex-end', animation:'fadeIn .18s ease-out' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--bg)', borderRadius:'22px 22px 0 0', padding:'16px 18px 40px', width:'100%', animation:'slideUp .22s cubic-bezier(.4,0,.2,1)', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ width:36, height:4, borderRadius:2, background:'var(--border-card)', margin:'0 auto 16px' }}/>
        {clip.image_url
          ? <img src={clip.image_url} alt="" style={{ width:'100%', height:160, objectFit:'cover', borderRadius:13, display:'block', marginBottom:12 }}/>
          : <div style={{ width:'100%', height:100, borderRadius:13, background:PLT_COLORS[platform], display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
              <PlatformIcon platform={platform} size={40}/>
            </div>
        }
        <div style={{ fontSize:11, color:'var(--teal)', fontWeight:600, marginBottom:4 }}>{domain}</div>
        <div style={{ fontSize:17, fontWeight:700, color:'var(--text1)', lineHeight:1.3, marginBottom:6 }}>{clip.title || domain}</div>
        {clip.description && <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, marginBottom:16 }}>{clip.description}</div>}
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => window.open(clip.url,'_blank','noopener,noreferrer')} style={{ flex:1, height:44, borderRadius:13, background:'var(--teal)', border:'none', cursor:'pointer', color:'#fff', fontSize:14, fontWeight:700, fontFamily:'inherit' }}>Open</button>
          <button onClick={async () => { await navigator.clipboard.writeText(clip.url); onClose() }} style={{ flex:1, height:44, borderRadius:13, background:'var(--surface2)', border:'.5px solid var(--border-card)', cursor:'pointer', color:'var(--text1)', fontSize:14, fontWeight:600, fontFamily:'inherit' }}>Copy</button>
          <button onClick={async () => { try { await navigator.share({ title:clip.title, url:clip.url }) } catch {} onClose() }} style={{ flex:1, height:44, borderRadius:13, background:'var(--surface2)', border:'.5px solid var(--border-card)', cursor:'pointer', color:'var(--text1)', fontSize:14, fontWeight:600, fontFamily:'inherit' }}>Share</button>
        </div>
      </div>
    </div>
  )
}

export default function ClipCard({ clip, onDeleted, onUpdated }) {
  const [starAnim, setStarAnim] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showDate, setShowDate] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [swiped, setSwiped] = useState(false)
  const [touchStartX, setTouchStartX] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const isLink = clip.type === 'link'
  const isImage = clip.type === 'image' || isImageFile(clip.file_type)
  const isFile = clip.type === 'file' || isPDF(clip.file_type)
  const isFav = Boolean(clip.favorited)
  const isArchived = Boolean(clip.archived)
  const content = clip.raw_input || clip.content || ''
  const platform = getPlatform(clip.url)
  const platColor = PLT_COLORS[platform] || '#6b7280'
  const catColor = CAT_COLORS[clip.category] || '#9ab8b3'

  const domain = clip.site_name || (clip.url ? (() => {
    try { return new URL(clip.url).hostname.replace('www.','') } catch { return '' }
  })() : '')

  const title = (() => {
    if (!isLink) return content.slice(0,200)
    if (clip.title && clip.title !== clip.url && clip.title !== clip.raw_input) return clip.title
    if (domain) return domain
    return 'Saved link'
  })()

  const handleTouchStart = e => setTouchStartX(e.touches[0].clientX)
  const handleTouchEnd = e => {
    if (touchStartX === null) return
    const dx = touchStartX - e.changedTouches[0].clientX
    if (dx > 55) setSwiped(true)
    else if (dx < -20) setSwiped(false)
    setTouchStartX(null)
  }
  const handleFav = async e => {
    e.stopPropagation(); setStarAnim(true); setTimeout(() => setStarAnim(false), 400)
    try { const u = await updateClip(clip.id, { favorited: !isFav }); onUpdated?.(u) } catch {}
  }
  const handleCopy = async e => {
    e.stopPropagation()
    await navigator.clipboard.writeText(clip.url || content || '')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  const handleShare = async e => {
    e.stopPropagation()
    try {
      if (navigator.share) await navigator.share({ title, url: clip.url || window.location.origin })
      else { await navigator.clipboard.writeText(clip.url || ''); setSharing(true); setTimeout(() => setSharing(false), 2000) }
    } catch {}
  }
  const handleDelete = async e => {
    e.stopPropagation(); if (!confirm('Delete this clip?')) return
    setDeleting(true)
    try { await deleteClip(clip.id); onDeleted?.(clip.id) } catch { setDeleting(false) }
  }
  const handleArchive = async e => {
    e.stopPropagation()
    try { const u = await updateClip(clip.id, { archived: !isArchived }); onUpdated?.(u) } catch {}
  }
  const handleOpen = () => {
    if (isLink && clip.url) window.open(clip.url, '_blank', 'noopener,noreferrer')
    else if (clip.file_url) window.open(clip.file_url, '_blank', 'noopener,noreferrer')
  }
  const handleCardTap = () => {
    if (swiped) { setSwiped(false); return }
    if (isLink) setShowPreview(true)
  }

  const isLong = content.length > 200
  const displayContent = isLong && !expanded ? content.slice(0, 200) + '…' : content

  if (isImage && clip.file_url) return (
    <div style={{ background:'var(--surface)', border:'.5px solid var(--border-card)', borderRadius:'var(--radius)', overflow:'hidden', animation:'cardIn .22s ease-out both', opacity:deleting?.3:1, marginBottom:8 }}>
      <img src={clip.file_url} alt="" style={{ width:'100%', maxHeight:180, objectFit:'cover', display:'block' }}/>
      <div style={{ padding:'9px 13px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:12, color:'var(--text3)' }}>{timeAgo(clip.created_at)}</span>
        <button onClick={handleFav} style={{ background:'none', border:'none', cursor:'pointer', color:isFav?'var(--gold)':'var(--border2)', padding:2, transform:starAnim?'scale(1.5)':'scale(1)', transition:'transform .25s cubic-bezier(.4,2,.6,1)' }}>
          <Star size={17} fill={isFav?'var(--gold)':'none'} strokeWidth={1.8}/>
        </button>
      </div>
    </div>
  )

  if (!isLink && !isFile) return (
    <div style={{ background:'var(--surface)', border:'.5px solid var(--border-card)', borderRadius:'var(--radius)', padding:'12px 14px', animation:'cardIn .22s ease-out both', opacity:deleting?.3:1, marginBottom:8 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6 }}>
            <div style={{ width:22, height:22, borderRadius:6, background:'var(--teal-dim)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text1)' }}>{title.slice(0,60)}</div>
          </div>
          {isLong && <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.55, marginBottom:7 }}>{displayContent}</div>}
          {isLong && <button onClick={e=>{e.stopPropagation();setExpanded(x=>!x)}} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--teal)', display:'flex', alignItems:'center', gap:3, padding:0, marginBottom:6 }}>{expanded?<ChevronUp size={12}/>:<ChevronDown size={12}/>}{expanded?'Less':'More'}</button>}
          {clip.note && <div style={{ fontSize:12, color:'var(--teal)', fontStyle:'italic', padding:'4px 9px', background:'var(--teal-dim)', borderRadius:6, borderLeft:'2px solid var(--teal)', marginBottom:8 }}>{clip.note}</div>}
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            {clip.category && clip.category !== 'General' && <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20, background:`${catColor}18`, color:catColor }}>{clip.category}</span>}
            <span onClick={e=>{e.stopPropagation();setShowDate(s=>!s)}} style={{ marginLeft:'auto', fontSize:11, color:'var(--text3)', display:'flex', alignItems:'center', gap:3, cursor:'pointer' }}>
              {clip.device==='mobile'?<Smartphone size={10}/>:<Monitor size={10}/>}
              {showDate?formatDate(clip.created_at):timeAgo(clip.created_at)}
            </span>
          </div>
        </div>
        <button onClick={handleFav} style={{ background:'none', border:'none', cursor:'pointer', padding:3, color:isFav?'var(--gold)':'var(--border2)', transform:starAnim?'scale(1.5)':'scale(1)', transition:'transform .25s cubic-bezier(.4,2,.6,1)', flexShrink:0 }}>
          <Star size={18} fill={isFav?'var(--gold)':'none'} strokeWidth={1.8}/>
        </button>
      </div>
    </div>
  )

  // LINK CARD
  return (
    <>
      {showPreview && <PreviewPopup clip={clip} onClose={() => setShowPreview(false)}/>}
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ position:'relative', overflow:'hidden', borderRadius:'var(--radius)', animation:'cardIn .22s ease-out both', opacity:deleting?.3:1, marginBottom:8 }}>
        <div onClick={handleCardTap} style={{
          background:'var(--surface)', border:'.5px solid var(--border-card)', borderRadius:'var(--radius)',
          display:'flex', alignItems:'center', gap:12, padding:'12px 14px', cursor:'pointer', minHeight:76,
          transform:swiped?'translateX(-132px)':'translateX(0)', transition:'transform .22s cubic-bezier(.4,0,.2,1)',
        }}>
          {/* Square thumb: platform color bg + icon */}
          <div style={{ width:58, height:58, borderRadius:11, flexShrink:0, overflow:'hidden', background:platColor, display:'flex', alignItems:'center', justifyContent:'center', border:'.5px solid var(--border-card)', position:'relative' }}>
            {clip.image_url
              ? <img src={clip.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              : <PlatformIcon platform={platform} size={26}/>
            }
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            {/* Title first */}
            <div style={{ fontSize:14, fontWeight:600, color:'var(--text1)', lineHeight:1.3, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</div>
            {/* Description */}
            {clip.description && <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.4, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{clip.description}</div>}
            {/* Domain + meta */}
            <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
              <span style={{ fontSize:11, color:'var(--teal)', fontWeight:500 }}>{domain}</span>
              {clip.category && clip.category !== 'General' && <span style={{ fontSize:10, fontWeight:600, padding:'1px 6px', borderRadius:10, background:`${catColor}18`, color:catColor }}>{clip.category}</span>}
              <span style={{ fontSize:11, color:'var(--text3)', marginLeft:'auto' }}>{timeAgo(clip.created_at)}</span>
            </div>
          </div>

          <button onClick={handleFav} style={{ background:'none', border:'none', cursor:'pointer', padding:3, flexShrink:0, color:isFav?'var(--gold)':'var(--border2)', transform:starAnim?'scale(1.5)':'scale(1)', transition:'transform .25s cubic-bezier(.4,2,.6,1)' }}>
            <Star size={18} fill={isFav?'var(--gold)':'none'} strokeWidth={1.8}/>
          </button>
        </div>

        {/* Swipe actions */}
        <div style={{ position:'absolute', right:0, top:0, bottom:0, display:'flex', transform:swiped?'translateX(0)':'translateX(100%)', transition:'transform .22s cubic-bezier(.4,0,.2,1)', borderRadius:`0 var(--radius) var(--radius) 0`, overflow:'hidden' }}>
          <button onClick={handleShare} style={{ width:66, height:'100%', background:'var(--teal)', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, color:'#fff', fontSize:11, fontWeight:600 }}>
            <Share2 size={16}/><span>Share</span>
          </button>
          <button onClick={handleArchive} style={{ width:66, height:'100%', background:'#6b7280', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, color:'#fff', fontSize:11, fontWeight:600 }}>
            <Archive size={16}/><span>Archive</span>
          </button>
          <button onClick={handleDelete} style={{ width:66, height:'100%', background:'var(--danger)', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, color:'#fff', fontSize:11, fontWeight:600, borderRadius:`0 var(--radius) var(--radius) 0` }}>
            <Trash2 size={16}/><span>Delete</span>
          </button>
        </div>
      </div>
    </>
  )
}
