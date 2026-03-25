export function detectType(input) {
  if (!input) return 'text'
  try { new URL(input.trim()); return 'link' } catch { return 'text' }
}

export async function fetchLinkMeta(url) {
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    const json = await res.json()
    const doc = new DOMParser().parseFromString(json.contents, 'text/html')
    const g = p => doc.querySelector(`meta[property='${p}'],meta[name='${p}']`)?.getAttribute('content')
    return {
      title: g('og:title') || g('twitter:title') || doc.title || url,
      description: g('og:description') || g('twitter:description') || '',
      image: g('og:image') || g('twitter:image') || null,
      siteName: g('og:site_name') || new URL(url).hostname.replace('www.', ''),
    }
  } catch {
    try { return { title: url, description: '', image: null, siteName: new URL(url).hostname.replace('www.', '') } }
    catch { return { title: url, description: '', image: null, siteName: '' } }
  }
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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function isMobile() {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768
}

export function isImageFile(type) {
  return type?.startsWith('image/')
}

export function isPDF(type) {
  return type === 'application/pdf'
}
