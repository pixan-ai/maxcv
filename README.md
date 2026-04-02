# maxcv

Free, open-source AI-powered resume analyzer and improver. Upload your resume, get a professional score across 6 dimensions, actionable improvement recommendations with before/after examples, and a complete rewritten resume — all in one click. No sign-up, no data stored, free forever.

**Live at [maxcv.org](https://maxcv.org)**

## How it works

1. Paste your resume text or upload a PDF
2. Click "Analyze" — one button, one flow
3. Get your score, specific improvements, strengths, and a fully rewritten resume
4. Copy or download the improved version for Word

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **Tailwind CSS 4**
- **Claude API** (Anthropic) for analysis and rewriting
- **Vercel** for deployment

## Run locally

```bash
git clone https://github.com/pixan-ai/maxcv.git
cd maxcv
npm install
```

Create a `.env.local` file:

```
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-opus-4-6
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Ethical principles

MaxCV is built with a constitutional prompt that enforces:

- **Honesty over comfort** — scores reflect reality, never inflated or deflated
- **Zero discrimination** — career gaps, non-traditional paths, and personal attributes are never penalized
- **Precision, not assumptions** — every observation references actual content
- **Privacy** — no personal data in analysis output
- **Empowerment, not fear** — no negative language, only opportunities

Read more at [maxcv.org/security](https://maxcv.org/security).

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

## License

[MIT](LICENSE)

---

Built by [Pixan AI](https://pixan.ai) for the global job-seeking community.
