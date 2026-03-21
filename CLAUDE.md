# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MaxCV is a free AI-powered resume/CV improver tool. Users paste their CV text, optionally select a target role/industry, and receive an improved version with specific tips. Monetization is through voluntary donations (Stripe primary, PayPal secondary).

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + Tailwind CSS 4
- Claude Opus 4.6 API (Anthropic SDK) for CV analysis and improvement
- Vercel Analytics for tracking
- Deployed on Vercel (dev.maxcv.org for staging, maxcv.org for production)

## Commands

- `npm run dev` — Start development server (Turbopack)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Architecture

- Single-page app with fluid flow: input → results → donation prompt
- `/src/app` — Next.js App Router pages and layout
- `/src/app/api/improve` — CV improvement endpoint (calls Claude Opus 4.6)
- `/src/app/api/pdf` — PDF generation endpoint (no external deps)
- `/src/components` — React components (Header, Footer, DonationBanner)

## Design Principles

- UI language: English by default, suggest Spanish switch for LATAM visitors
- Minimalist, impeccable design — Inter font everywhere, no clutter
- Branding is subtle: "by MaxCV", not heavy logos
- No user data persistence — CVs are processed and never stored

## Rate Limiting

- 3 improvements per IP per day (in-memory, resets on deploy)
- Input capped at 8000 characters to prevent abuse

## Environment Variables

- `ANTHROPIC_API_KEY` — Required, Claude API key
- `NEXT_PUBLIC_STRIPE_DONATION_LINK` — Stripe payment link for donations
- `NEXT_PUBLIC_PAYPAL_DONATION_LINK` — PayPal donation link
