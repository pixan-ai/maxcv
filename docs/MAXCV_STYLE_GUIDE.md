# MaxCV Design System — Style Guide v1.0

> Source of truth: `dev.maxcv.org` Improve page (page.tsx)
> Design philosophy: **Clean SaaS Minimal** — inspired by Linear, Stripe, Notion

---

## 1. Design Principles

| Principle | Rule |
|-----------|------|
| **Simplicity** | Every element must earn its place. If removing it doesn't hurt, remove it. |
| **Typography-first** | Hierarchy through font size and weight, not backgrounds or borders. |
| **One accent color** | Brand green (`accent`) for CTAs and highlights. Everything else is grayscale. |
| **No dark mode** | White background only. Reduces code complexity by 50%. |
| **Mobile-first** | Design at 375px, scale up. `max-w-2xl` (~672px) container. |
| **Content over chrome** | No decorative elements. No gradients. No shadows (except `shadow-sm` on primary cards). |

---

## 2. Colors

### CSS Variables (defined in globals.css)

```css
:root {
  --accent: #059669;        /* emerald-600 — primary brand */
  --accent-hover: #047857;  /* emerald-700 — hover state */
  --accent-light: #ecfdf5;  /* emerald-50 — subtle backgrounds */
  --border: #e5e7eb;        /* gray-200 — all borders */
  --muted: #6b7280;         /* gray-500 — secondary text */
}
```

### Usage

| Element | Color | Class |
|---------|-------|-------|
| Body background | White | `bg-white` |
| Primary text | Gray 900 | `text-gray-900` |
| Secondary text | Gray 500 | `text-muted` |
| Borders | Gray 200 | `border-border` |
| Links / CTAs | Emerald 600 | `text-accent` |
| Primary button bg | Emerald 600 | `bg-accent` |
| Primary button hover | Emerald 700 | `hover:bg-accent-hover` |
| Subtle backgrounds | Emerald 50 | `bg-accent-light` |
| Error text | Red 700 | `text-red-700` |
| Error background | Red 50 | `bg-red-50` |
| Success | Emerald 600 | `text-emerald-600` |
| Warning | Amber 500 | `text-amber-500` |

### Score colors (Score page only)

| Score | Text | Bar/Ring |
|-------|------|----------|
| 80-100 | `text-emerald-600` | `bg-emerald-500` / `stroke-emerald-500` |
| 60-79 | `text-amber-500` | `bg-amber-400` / `stroke-amber-400` |
| 0-59 | `text-red-500` | `bg-red-500` / `stroke-red-500` |

---

## 3. Typography

### Font

- **Family:** Inter (Google Fonts)
- **Fallback:** system-ui, sans-serif
- **Body class:** `font-sans antialiased`

### Scale

| Element | Size | Weight | Tracking | Class |
|---------|------|--------|----------|-------|
| Hero title | 36px | Bold | Tight | `text-4xl font-bold tracking-tight` |
| Hero highlight | 36px | Bold | Tight | `text-4xl font-bold tracking-tight text-accent` |
| Section title | 24px | Bold | Tight | `text-2xl font-bold tracking-tight` |
| Card title | 14px | Semibold | Normal | `text-sm font-semibold` |
| Body text | 14px | Normal | Normal | `text-sm` |
| Body relaxed | 14px | Normal | Normal | `text-sm leading-relaxed` |
| Labels | 14px | Medium | Normal | `text-sm font-medium` |
| Helper text | 12px | Normal | Normal | `text-xs text-muted` |
| Score numbers | varies | Semibold | Tabular | `font-semibold tabular-nums` |

---

## 4. Layout

### Container

```html
<main class="flex-1 w-full max-w-2xl mx-auto px-4 py-12">
```

- Max width: `max-w-2xl` (~672px)
- Horizontal padding: `px-4` (16px)
- Vertical padding: `py-12` (48px)
- Always centered: `mx-auto`

### Spacing

| Context | Spacing |
|---------|---------|
| Between major sections | `mb-12` or `pt-16 pb-8` |
| Between form fields | `space-y-4` |
| Inside cards/sections | `p-5 sm:p-6` |
| Between cards in results | `space-y-4` |
| Label to input | `mb-1.5` |

---

## 5. Components

### Header

```html
<header class="w-full border-b border-border">
  <div class="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
    <a href="/" class="text-lg font-semibold tracking-tight">
      Max<span class="text-accent">CV</span>
    </a>
    <!-- Right side: language toggle, powered by -->
  </div>
</header>
```

- Simple `border-b` divider (NO backdrop-blur, NO sticky, NO background color)
- Logo: `Max` in gray-900 + `CV` in accent

### Footer

```html
<footer class="w-full border-t border-border">
  <div class="max-w-2xl mx-auto px-4 py-6 text-xs text-muted">
```

### Input Fields

```html
<input class="w-full rounded-lg border border-border px-4 py-3 text-sm
  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
  transition placeholder:text-gray-400" />
```

- Border radius: `rounded-lg` (8px)
- Border: `border-border` (gray-200)
- Focus: ring with accent at 30% opacity
- Padding: `px-4 py-3`

### Primary Button

```html
<button class="w-full bg-accent text-white font-medium py-3 px-6 rounded-lg
  hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed
  transition cursor-pointer">
```

### Tabs (underline style)

```html
<div class="flex border-b border-border">
  <!-- Active -->
  <button class="px-4 py-2.5 text-sm font-medium text-accent
    border-b-2 border-accent -mb-px">
  <!-- Inactive -->
  <button class="px-4 py-2.5 text-sm font-medium text-muted
    hover:text-gray-900">
</div>
```

- Underline style, NOT pill/background style
- Active: accent color + 2px bottom border
- Inactive: muted text

### Cards / Sections

```html
<div class="border border-border rounded-lg p-6">
```

- NO shadow (or `shadow-sm` max for primary result card)
- NO background color (white inherits from body)
- Border: 1px gray-200
- Radius: `rounded-lg`

### Error Messages

```html
<div class="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
```

### Criteria Status (Score page)

| Status | Icon | Background |
|--------|------|------------|
| Pass | ✅ | `bg-emerald-50` |
| Warning | ⚠️ | `bg-amber-50` |
| Fail | ❌ | `bg-red-50` |

---

## 6. Patterns to AVOID

| ❌ Don't | ✅ Do instead |
|----------|---------------|
| Dark mode (`dark:` classes) | White background only |
| `rounded-2xl` or `rounded-3xl` | `rounded-lg` (8px) |
| `backdrop-blur` | Simple `border-b border-border` |
| `shadow-md` or `shadow-lg` | No shadow or `shadow-sm` max |
| Stone palette (`stone-50`, `stone-900`) | Gray palette (`gray-900`, `gray-500`) |
| Emoji icons in headers | Text only, or minimal Unicode |
| Gradient backgrounds | Solid colors only |
| `max-w-3xl` or wider | `max-w-2xl` |
| Pill tabs (background switch) | Underline tabs |
| Sticky header with blur | Static header with border |
| Multiple accent colors | One accent (emerald) |

---

## 7. File Structure

```
src/
  app/
    globals.css          → CSS variables, Tailwind config
    layout.tsx           → Root layout, Inter font, body classes
    page.tsx             → Improve page (reference implementation)
    score/page.tsx       → Score page (follows this guide)
    principles/page.tsx  → Principles page
    privacy/page.tsx     → Privacy page
  components/
    Header.tsx           → Shared header
    Footer.tsx           → Shared footer
    DonationBanner.tsx   → Donation CTA
```

---

## 8. Responsive Breakpoints

| Breakpoint | Usage |
|------------|-------|
| Default (mobile) | Single column, `px-4` |
| `sm:` (640px) | Padding adjustments, side-by-side on results |
| No `md:`, `lg:`, `xl:` | Not needed with `max-w-2xl` container |

---

## 9. Animation

- **Transitions:** `transition` on all interactive elements (200ms default)
- **Score ring:** `duration-[1.5s] ease-out` for the SVG stroke animation
- **Score bars:** `duration-1000 ease-out` with stagger delay
- **Loading spinner:** `animate-spin` on SVG
- **Privacy animation:** `animate-pulse` and `animate-ping` with delays
- **No page transitions, no fancy entrances**

---

*Last updated: 2026-03-22 | Version 1.0*
*Source of truth: Improve page at dev.maxcv.org*
