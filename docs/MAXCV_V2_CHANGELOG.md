# MaxCV v2.0 Changelog

> Release date: 2026-03-30

---

## Summary

MaxCV v2.0 unifies the Score and Improve flows into a single page with dual CTAs, adds a staged progress bar, Word-compatible output, refreshed copy, and CSS animations.

---

## New Features

### Unified single-page architecture
- Both Score and Improve flows now live on `/`
- Two side-by-side CTA buttons: "Analyze my resume" and "Rewrite it for me"
- `/score` redirects to `/`
- Cross-flow CTAs: after Score → "Want me to rewrite it?", after Improve → "Want to see your score?"

### Staged progress bar
- New `ProgressBar.tsx` component with 5 stages (bilingual)
- Smooth CSS transitions with cubic-bezier easing
- Jumps to 100% when API responds

### Word-compatible output
- Improve API now outputs ALL CAPS section headers, • bullet points, blank line separators
- New "Download for Word" button generates UTF-8 BOM `.txt` file
- Replaces the old browser print/PDF workflow

### CSS animations
- `card-enter`: stagger animation for result cards (opacity + translateY + blur)
- `soft-pulse`: subtle box-shadow pulse on post-result CTA buttons
- Score count-up: animated number from 0 to final score (ease-out cubic, 1.2s)
- `reveal`: scroll-driven animation with `animation-timeline: view()` fallback
- All animations respect `prefers-reduced-motion: reduce`

### Copy refresh
- New hero: "Your next job starts with a great resume" / "Tu próximo trabajo empieza con un gran CV"
- Accent line: "Professional AI analysis. Free." / "Análisis profesional con IA. Gratis."
- Subtitled CTA buttons with clear benefit descriptions
- Privacy and rate limit notes below CTAs

---

## Changes

### Rate limiting
- Improve API changed from 3/day to 5/hour (aligned with Score API)

### Header
- Removed nav tabs (Improve/Score) — no longer needed with unified page
- Version updated to v4.0

### Meta tags
- Title: `maxcv — AI Resume Analyzer & Improver`
- Description updated for both OG and standard meta

### Package version
- `package.json` version bumped to `4.0.0`

---

## Files Modified

| File | Change |
|------|--------|
| `src/app/page.tsx` | Complete rewrite — unified page with dual flows |
| `src/app/score/page.tsx` | Replaced with redirect to `/` |
| `src/app/globals.css` | Added card-enter, soft-pulse keyframes |
| `src/app/layout.tsx` | Updated meta tags |
| `src/app/api/improve/route.ts` | Word-compatible prompt + hourly rate limit |
| `src/components/Header.tsx` | Removed nav, updated version to v4.0 |
| `src/components/CVInput.tsx` | Added `hideSubmit` prop |
| `src/components/ProgressBar.tsx` | **NEW** — staged progress bar component |
| `package.json` | Version 4.0.0 |
| `CLAUDE.md` | Updated to reflect v2.0 architecture |
| `docs/MAXCV_BACKLOG.md` | Marked v2.0 items as completed |

---

## What was NOT changed

- `src/app/security/page.tsx`
- `src/app/api/score/route.ts`
- `src/app/api/parse/route.ts`
- `src/components/DonationBanner.tsx`
- `src/components/Footer.tsx`
- `src/components/AboutUs.tsx`
- All docs except BACKLOG and CLAUDE.md

---

*Version: 2.0 | For: MaxCV project*
