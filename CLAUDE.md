# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and Claude Desktop when working with code in this repository.

## Project Overview

MaxCV (maxcv.org) is a free AI-powered resume/CV improver tool. Users paste their CV text, optionally select a target role/industry, and receive an improved version with specific tips. Monetization is through voluntary donations (Stripe primary, PayPal secondary). The tool is free forever — no sign-up, no accounts, no data stored.

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + Tailwind CSS 4
- Claude Opus 4.6 API (`claude-opus-4-6`) via Anthropic SDK for CV analysis
- Vercel Analytics for traffic tracking
- Deployed on Vercel

## Environments

- **Staging:** dev.maxcv.org — test all changes here first
- **Production:** maxcv.org — only promote after testing on staging
- GitHub repo: github.com/pixan-ai/maxcv

## Commands

- `npm run dev` — Start development server (Turbopack)
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `vercel deploy --prod` — Deploy to production via CLI

## Architecture

- Single-page app with fluid flow: input → results → donation prompt
- `/src/app/page.tsx` — Main page component (form, results, PDF download, language switching)
- `/src/app/layout.tsx` — Root layout with Inter font, meta tags, Vercel Analytics
- `/src/app/globals.css` — Tailwind theme config (accent color, custom vars)
- `/src/app/api/improve/route.ts` — API route that calls Claude Opus 4.6 to improve the CV
- `/src/components/Header.tsx` — Logo + language toggle + "Powered by" badge
- `/src/components/Footer.tsx` — Subtle branding + Claude Opus 4.6 credit
- `/src/components/DonationBanner.tsx` — Post-result donation CTA (Stripe + PayPal)

## Bilingual Support

- UI defaults to English
- Claude API detects the language of the pasted CV and responds in the same language
- When Spanish CV is detected, UI automatically switches to Spanish
- Manual toggle in header (EN/ES)
- All UI strings (buttons, errors, tips, donation banner) are translated

## Design Principles

- Minimalist, impeccable design — Inter font everywhere, no clutter
- Accent color: blue (#2563eb)
- Branding is subtle: "by MaxCV", not heavy logos
- No user data persistence — CVs are processed and never stored
- "Powered by Claude Opus 4.6" visible in header and footer

## Rate Limiting & Security

- 3 improvements per IP per day (in-memory, resets on deploy/restart)
- Input capped at 8000 characters to prevent abuse
- Target role input capped at 200 characters
- No user accounts, no cookies, no tracking beyond Vercel Analytics

## PDF Generation

- Client-side via browser print dialog (window.print)
- Opens styled page in new tab with Inter font, user triggers Save as PDF
- Supports all characters including accented/unicode (ñ, á, é, etc.)

## Environment Variables (set in Vercel dashboard)

- `ANTHROPIC_API_KEY` — Required. Claude API key for CV improvement
- `NEXT_PUBLIC_STRIPE_DONATION_LINK` — Stripe payment link for donations
- `NEXT_PUBLIC_PAYPAL_DONATION_LINK` — PayPal donation link

## Code Conventions

- UI language: Spanish and English (bilingual)
- Code, comments, commits: always in English
- Font: Inter only, everywhere
- Keep API prompt optimized for minimal tokens while maintaining quality
