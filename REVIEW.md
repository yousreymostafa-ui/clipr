# CLiPR App Review (March 28, 2026)

## Overall impression

CLiPR is a clean, focused React + Supabase app with a clear product direction: quick capture and cross-device retrieval. The architecture is intentionally small and understandable, and the core save/browse loop is easy to follow.

## What is working well

- **Simple auth and app shell split** (`LoginPage` vs `DashboardPage`) with a lightweight auth context.
- **Good real-time UX baseline** using Supabase realtime subscriptions to keep the clip feed current.
- **Useful content model** for links, notes, images, and files with category/tag/favorite/archive support.
- **Consistent visual design tokens** in CSS variables with dark-mode support.

## Priority issues

### 1) Missing environment validation for Supabase client (High)
`createClient` is called directly with environment values and no guardrails. If either variable is missing at runtime, failures happen later and are harder to debug.

**Where:** `src/lib/supabase.js`

**Recommendation:** Validate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at startup and throw a clear error message if missing.

### 2) Uploaded files are publicly readable (High, depending on product expectations)
The SQL setup creates a public bucket and a public-read policy. If users expect private clipping, uploaded files are accessible by URL to anyone who has the link.

**Where:** `SUPABASE_SQL.sql`

**Recommendation:** Use a private bucket and signed URLs for file access, or document very clearly that uploaded files are public-by-link.

### 3) Link metadata fetch depends on a third-party proxy with no fallback strategy (Medium)
`fetchLinkMeta` depends on `allorigins.win` from the client. This can fail intermittently due to rate limits/CORS/proxy uptime, which can degrade title/preview quality.

**Where:** `src/lib/utils.js`

**Recommendation:** Move metadata extraction to a server/edge function you control, add timeouts/retries, and handle non-OK responses explicitly.

### 4) No pagination / fetch limits for clip list (Medium)
`getClips` fetches all clips in descending order. As data grows, initial load and memory usage will degrade.

**Where:** `src/lib/supabase.js`

**Recommendation:** Add `.range()` pagination or cursor-based loading and lazy-load older clips.

### 5) Accessibility gaps in interactive controls (Medium)
Many icon-only controls do not provide ARIA labels, and a clickable avatar image uses empty `alt` text while acting as a button.

**Where:** `src/pages/DashboardPage.jsx`, `src/components/ClipCard.jsx`, `src/components/SaveBar.jsx`

**Recommendation:** Add `aria-label` to icon buttons and convert clickable non-button elements into semantic `<button>` elements (or add role/keyboard handlers where needed).

## Lower-priority improvements

- **Error handling consistency:** `catch {}` blocks swallow actionable errors; consider user-visible toasts and structured logging.
- **Maintainability:** very large inline style objects make components harder to test and evolve; consider extracting repeated UI primitives.
- **Search/filter logic duplication:** filtering is run twice for `activeView === 'All'`; can be simplified for readability.

## Suggested next steps (order)

1. Add env var validation + user-visible error boundaries for startup/auth failures.
2. Decide privacy model for uploaded files and align Supabase storage policies.
3. Introduce pagination for clips and measure time-to-first-contentful-list on larger datasets.
4. Accessibility pass: labels, keyboard navigation, focus states, semantic controls.
5. Move link metadata fetching to a controlled backend endpoint.
