import Link from "next/link";
import { FOOTER_UI } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

function GitHubIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer({ lang }: { lang: Lang }) {
  const t = FOOTER_UI[lang];
  return (
    <footer className="w-full border-t border-ink-100 bg-ink-000">
      <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-ink-400">
          <Link href="/how" className="hover:text-ink-700 transition">{t.howItWorks}</Link>
          <Link href="/donate" className="hover:text-ink-700 transition">{t.donate}</Link>
          <Link href="/" className="hover:text-ink-700 transition">Home</Link>
          <Link href="/security" className="hover:text-ink-700 transition">{t.security}</Link>
          <Link href="/privacy" className="hover:text-ink-700 transition">{t.privacy}</Link>
          <Link href="/terms" className="hover:text-ink-700 transition">{t.terms}</Link>
          <Link href="/about" className="hover:text-ink-700 transition">{t.about}</Link>
          <span className="flex-1" />
          <a href="https://github.com/pixan-ai/maxcv" target="_blank" rel="noopener noreferrer" className="hover:text-ink-700 transition" aria-label="GitHub">
            <GitHubIcon />
          </a>
          <a href="https://x.com/maxcvorg" target="_blank" rel="noopener noreferrer" className="hover:text-ink-700 transition" aria-label="X">
            <XIcon />
          </a>
        </div>
        <p className="text-[11px] text-ink-300">maxcv v5.1</p>
      </div>
    </footer>
  );
}

export default Footer;
