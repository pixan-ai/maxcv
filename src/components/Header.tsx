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
        <button onClick={onToggleLang} aria-label="Toggle language"
          className="flex items-center gap-1 text-xs text-ink-400 hover:text-ink-700 transition cursor-pointer px-2 py-1 rounded-lg hover:bg-ink-050">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15 15 0 014 9 15 15 0 01-4 9 15 15 0 01-4-9 15 15 0 014-9z" />
          </svg>
          {lang === "en" ? "ES" : "EN"}
        </button>
      </div>
      <div className="sm:hidden max-w-2xl mx-auto px-5 pb-2">
        <p className="text-[10px] text-ink-300 text-center">{t.powered}</p>
      </div>
    </header>
  );
}

export default Header;
