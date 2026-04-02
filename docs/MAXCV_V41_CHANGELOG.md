# MaxCV v4.1 Changelog

> Release date: 2026-04-01

---

## Summary

MaxCV v4.1 is a code-quality refactor: dead code removal, shared utility extraction, prompt separation, HTTP security headers, and a custom favicon. Zero feature changes — same UX, cleaner codebase, smaller bundle.

---

## Changes

### Dead code removal
- Uninstalled 4 unused dependencies: `mammoth`, `motion`, `pdf-parse`, `@types/pdf-parse` (~165KB saved)
- Deleted orphan component `AtsExplainer.tsx` (121 lines, imported nowhere)

### Prompt extraction
- System prompts moved from inline strings in route.ts to dedicated text files:
  - `src/lib/prompts/score.txt` (156-line scoring prompt)
  - `src/lib/prompts/improve.txt` (29-line improvement prompt)
- New `src/lib/prompts.ts` — loads prompts via `readFileSync` at build time
- API routes now import `SCORE_PROMPT` / `IMPROVE_PROMPT` instead of hardcoding

### Shared utilities (DRY)
- `src/lib/rateLimit.ts` — `getClientIp()` + `isRateLimited()` extracted from duplicated code in score + improve routes
- `src/lib/apiUtils.ts` — `stripMarkdown()` extracted from duplicated regex in score + improve routes
- Both API routes reduced from ~120-243 lines to ~60 lines each

### HTTP security headers
- `next.config.ts` now sets 6 security headers on all routes:
  - `X-DNS-Prefetch-Control: on`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

### Favicon
- New `public/favicon.svg` — typographic "M" icon (dark background, white text)
- Wired into `layout.tsx` metadata as both `icon` and `apple` touch icon

### Version bump
- `package.json` version: `4.0.0` → `4.1.0`

---

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/rateLimit.ts` | Shared rate limiting + IP extraction |
| `src/lib/apiUtils.ts` | Shared API utilities (stripMarkdown) |
| `src/lib/prompts.ts` | Prompt loader |
| `src/lib/prompts/score.txt` | Claude scoring system prompt |
| `src/lib/prompts/improve.txt` | Claude improvement system prompt |
| `public/favicon.svg` | Brand favicon |

## Files Modified

| File | Change |
|------|--------|
| `src/app/api/score/route.ts` | Removed inline prompt + rate limit code, imports from lib |
| `src/app/api/improve/route.ts` | Removed inline prompt + rate limit code, imports from lib |
| `src/app/layout.tsx` | Added favicon metadata |
| `next.config.ts` | Added 6 security headers |
| `package.json` | Removed 4 deps, version bump to 4.1.0 |
| `CLAUDE.md` | Updated architecture section with new lib files |
| `docs/MAXCV_BACKLOG.md` | Marked 5 priority items as completed |

## Files Deleted

| File | Reason |
|------|--------|
| `src/components/AtsExplainer.tsx` | Orphan component, never imported |

---

## What was NOT changed

- `src/app/page.tsx` — no UI changes
- `src/app/api/parse/route.ts` — out of scope
- `src/app/security/page.tsx`
- All other components (Header, Footer, CVInput, ProgressBar, DonationBanner, AboutUs)

---

*Version: 4.1 | For: MaxCV project*
