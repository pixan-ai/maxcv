import Link from "next/link";
import { HEADER_UI } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export function Header({ lang, onToggleLang }: { lang: Lang; onToggleLang: () => void }) {
  const t = HEADER_UI[lang];
  return (
    <header className="w-full border-b border-ink-100 bg-ink-000">
      <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-4 h-4" aria-hidden="true">
            <polygon points="2,2 30,2 16,30" fill="currentColor" className="text-accent" />
          </svg>
          <span className="font-[family-name:var(--font-geist)] text-lg font-medium leading-none text-ink-900">max<span className="text-accent">cv</span></span>
        </Link>
        <span className="hidden sm:block text-[11px] text-ink-300 flex-1 text-center px-4">{t.powered}</span>
        <div className="flex items-center gap-1">
          <button onClick={onToggleLang} aria-label="Toggle language"
            className="flex items-center gap-1 text-xs text-ink-400 hover:text-ink-700 transition cursor-pointer px-2 py-1 rounded-lg hover:bg-ink-050">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15 15 0 014 9 15 15 0 01-4 9 15 15 0 01-4-9 15 15 0 014-9z" />
            </svg>
            {lang === "en" ? "ES" : "EN"}
          </button>
          <a href="https://github.com/pixan-ai/maxcv" target="_blank" rel="noopener noreferrer" aria-label="GitHub"
            className="p-1.5 text-ink-400 hover:text-ink-700 transition rounded-lg hover:bg-ink-050">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <a href="https://x.com/maxcvorg" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"
            className="p-1.5 text-ink-400 hover:text-ink-700 transition rounded-lg hover:bg-ink-050">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
      <div className="sm:hidden max-w-2xl mx-auto px-5 pb-2">
        <p className="text-[10px] text-ink-300 text-center">{t.powered}</p>
      </div>
    </header>
  );
}

export default Header;
