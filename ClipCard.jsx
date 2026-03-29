export function detectType(input) {
  if (!input) return 'text'
  try { new URL(input.trim()); return 'link' } catch { return 'text' }
}

const PROXIES = [
  url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
]

export async function fetchLinkMeta(url) {
  for (const proxy of PROXIES) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 8000)
      const res = await fetch(proxy(url), { signal: ctrl.signal })
      clearTimeout(t)
      if (!res.ok) continue
      const ct = res.headers.get('content-type') || ''
      let html = ct.includes('json') ? (await res.json()).contents || '' : await res.text()
      if (!html) continue
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const g = (...props) => { for (const p of props) { const v = doc.querySelector(`meta[property='${p}'],meta[name='${p}'],meta[itemprop='${p}']`)?.getAttribute('content'); if (v?.trim()) return v.trim() } return null }
      const hostname = (() => { try { return new URL(url).hostname.replace('www.','') } catch { return '' } })()
      const title = g('og:title','twitter:title','title') || doc.querySelector('title')?.textContent?.trim() || doc.querySelector('h1')?.textContent?.trim() || hostname || url
      const description = g('og:description','twitter:description','description') || ''
      const image = g('og:image','twitter:image') || null
      const siteName = g('og:site_name') || hostname
      if (title && title !== url) return { title, description, image, siteName }
    } catch {}
  }
  try { const h = new URL(url).hostname.replace('www.',''); return { title: h, description: '', image: null, siteName: h } }
  catch { return { title: url, description: '', image: null, siteName: '' } }
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
}

export function isMobile() {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768
}

export function isImageFile(type) { return type?.startsWith('image/') }
export function isPDF(type) { return type === 'application/pdf' }

export function getPlatform(url) {
  if (!url) return 'website'
  try {
    const h = new URL(url).hostname
    if (h.includes('tiktok')) return 'tiktok'
    if (h.includes('facebook') || h.includes('fb.com')) return 'facebook'
    if (h.includes('instagram')) return 'instagram'
    if (h.includes('twitter') || h.includes('x.com')) return 'twitter'
    if (h.includes('youtube') || h.includes('youtu.be')) return 'youtube'
    return 'website'
  } catch { return 'website' }
}
