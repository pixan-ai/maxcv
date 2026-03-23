# MaxCV Style Guide v2.0

> Supersedes v1.0. Source of truth for the Score page and all new pages.
> Design philosophy: **Empathy-first minimal** — the UI serves the user's emotional state, not our aesthetics.

---

## 1. Design Tokens (OKLCH)

### Ink scale (neutrals)
```css
--ink-000: oklch(1 0 0)          /* white — page background */
--ink-050: oklch(0.97 0 0)       /* subtle bg */
--ink-100: oklch(0.93 0 0)       /* borders, dividers */
--ink-200: oklch(0.87 0 0)       /* disabled text */
--ink-300: oklch(0.75 0 0)       /* placeholder */
--ink-400: oklch(0.65 0 0)       /* muted text */
--ink-500: oklch(0.55 0 0)       /* secondary text, score numbers */
--ink-600: oklch(0.45 0 0)       /* body text */
--ink-700: oklch(0.35 0 0)       /* strong text */
--ink-800: oklch(0.25 0 0)       /* headings */
--ink-900: oklch(0.15 0 0)       /* near-black */
```

### Accent
```css
--v2-accent: oklch(0.55 0.2 260)        /* primary action */
--v2-accent-hover: oklch(0.48 0.2 260)  /* hover state */
--v2-accent-light: oklch(0.95 0.03 260) /* subtle bg */
```

### Semantic
```css
--positive: oklch(0.55 0.15 155)        /* strengths, success */
--positive-light: oklch(0.95 0.03 155)  /* positive bg */
```

---

## 2. Typography

### Fonts
- **Geist Sans** — all UI text (via `geist/font/sans`, CSS var `--font-geist-sans`)
- **Geist Mono** — scores, metadata, CTA buttons (via `geist/font/mono`, CSS var `--font-geist-mono`)
- No Inter, no system stack on v2.0 pages.

### Weight rules
| Weight | Token | Usage |
|--------|-------|-------|
| 300 | `font-light` | Score numbers, metadata |
| 400 | `font-normal` | Body text, descriptions |
| 500 | `font-medium` | Headings, labels, buttons, logo |
| 700 | `font-bold` | **NEVER USED** |

### Size scale
| Size | Usage | Additional |
|------|-------|------------|
| 11px | Impact badges | `tracking-wide uppercase`, Geist Mono |
| 13px | Metadata, scores, labels, hints | `tracking-wide uppercase` for metadata |
| 14px | Body text, list items, buttons | Default reading size |
| 18px | Section headings | `font-medium` |
| 24px | Page titles (rare) | `font-medium` |

---

## 3. Logo

- Always `maxcv` in **lowercase**
- Geist Sans, `font-medium`
- No color accent on any letter
- `<span className="font-medium">maxcv</span>`

---

## 4. Layout

| Property | Value |
|----------|-------|
| Max width | `max-w-2xl` (672px) |
| Page padding | `px-5 py-12` |
| Section spacing | `space-y-16` |
| Background | `--ink-000` (white), always |
| Header | `border-b border-ink-100`, static |
| Footer | `border-t border-ink-100`, centered |

---

## 5. Visual Rules

| Rule | Detail |
|------|--------|
| Shadows | **None. Ever.** |
| Gradients | **None. Ever.** |
| Border radius | `rounded-lg` only on interactive elements |
| Borders | 1px `--ink-100` |
| External libraries | None (no shadcn, no Aceternity) |
| Background | Always white (`--ink-000`) |

---

## 6. Motion

### motion.dev (formerly framer-motion)
```ts
const spring = { stiffness: 300, damping: 30 };
const stagger = 0.06; // 60ms between items
// Entry: opacity 0, y 8 → opacity 1, y 0
```

### CSS scroll-driven animations
```css
.reveal {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}

@keyframes reveal {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 7. Score Page — Hierarchy

The score number is **NOT** the hero. The user needs actionable improvements, not a judgment.

| Priority | Section | Visual weight |
|----------|---------|---------------|
| 1st | Improvements (actionable list) | **HERO** — largest, most prominent |
| 2nd | Strengths (what works) | Medium — validation, positive tone |
| 3rd | Score number | Small — 13px, `--ink-500`, Geist Mono, metadata feel |

### Copy tone
- Never: "bad", "poor", "failing", "low score", "reprobado"
- Always: "can be improved", "can be strengthened", "a change here would make a difference"
- CTA: "improve these sections with AI" / "mejorar estas secciones con IA"
- The AI proposes. Never judges.

---

## 8. Performance

- Lighthouse >= 95 or it's a bug
- `next/font` for font loading (no Google Fonts CDN on v2.0 pages)
- Prefer CSS animations over JS
- No heavy libraries beyond motion.dev

---

## 9. Patterns to AVOID

| Don't | Do instead |
|-------|------------|
| `font-bold` / `font-semibold` | `font-medium` (500 max) |
| Score number as hero | Score as discrete metadata |
| Dark mode classes | White only |
| `shadow-*` anything | No shadows |
| Gradient backgrounds | Solid colors |
| `Max<span>CV</span>` | `maxcv` lowercase |
| Emoji icons | Text or minimal SVG |
| Pill tabs | Underline tabs |
| Sticky header with blur | Static header with border |

---

*Last updated: 2026-03-22 | v2.0*
*Applies to: /score and all new pages*
