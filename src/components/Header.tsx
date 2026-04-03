import Link from "next/link";

export function Header({ lang, onToggleLang }: {
  lang: "en" | "es";
  onToggleLang: () => void;
}) {
  return (
    <header className="w-full border-b border-ink-100 bg-ink-000">
      <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="6" fill="currentColor" className="text-accent" />
            <polygon points="8,8 16,24 24,8" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round" />
          </svg>
          <span className="font-[family-name:var(--font-geist)] text-lg font-medium leading-none text-ink-900">
            maxcv
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLang}
            aria-label="Toggle language"
            className="text-xs text-ink-400 hover:text-ink-700 transition cursor-pointer
                       px-2 py-1 rounded-lg hover:bg-ink-050"
          >
            {lang === "en" ? "ES" : "EN"}
          </button>
          <span className="text-[11px] text-ink-300 font-[family-name:var(--font-mono)]">
            v5.1
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
