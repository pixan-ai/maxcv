import Link from "next/link";

const HEADER_TEXT = {
  es: {
    powered: "An\u00e1lisis y optimizaci\u00f3n con Claude Opus 4.6 \u00b7 Anthropic",
  },
  en: {
    powered: "Analysis & optimization by Claude Opus 4.6 \u00b7 Anthropic",
  },
};

export function Header({ lang, onToggleLang }: {
  lang: "en" | "es";
  onToggleLang: () => void;
}) {
  const t = HEADER_TEXT[lang];

  return (
    <header className="w-full border-b border-ink-100 bg-ink-000">
      <div className="max-w-2xl mx-auto px-5 py-3.5 flex flex-col gap-1">
        {/* Top row: logo + powered text + lang */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <polygon points="2,2 30,2 16,30" fill="currentColor" className="text-accent" />
            </svg>
            <span className="font-[family-name:var(--font-geist)] text-lg font-medium leading-none text-ink-900">
              maxcv
            </span>
          </Link>

          {/* Center: powered by */}
          <span className="hidden sm:block text-[11px] text-ink-300 font-[family-name:var(--font-mono)]">
            {t.powered}
          </span>

          {/* Right: lang toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleLang}
              aria-label="Toggle language"
              className="flex items-center gap-1 text-xs text-ink-400 hover:text-ink-700 transition cursor-pointer
                         px-2 py-1 rounded-lg hover:bg-ink-050"
            >
              {/* Globe icon */}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3.6 9h16.8M3.6 15h16.8" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 3a15 15 0 014 9 15 15 0 01-4 9 15 15 0 01-4-9 15 15 0 014-9z" />
              </svg>
              {lang === "en" ? "ES" : "EN"}
            </button>
          </div>
        </div>

        {/* Mobile: powered by (below logo row) */}
        <span className="sm:hidden text-[10px] text-ink-300 font-[family-name:var(--font-mono)] text-center">
          {t.powered}
        </span>
      </div>
    </header>
  );
}

export default Header;
