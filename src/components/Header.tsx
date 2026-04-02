import Link from "next/link";

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="logo-clip">
          <rect width="32" height="32" />
        </clipPath>
      </defs>
      <rect width="32" height="32" fill="currentColor" className="text-accent" />
      <g clipPath="url(#logo-clip)">
        <polygon points="6.72,32 16,15.96 25.28,32" fill="white" />
      </g>
    </svg>
  );
}

export default function Header({ lang, onToggleLang }: {
  lang: "en" | "es"; onToggleLang: () => void;
}) {
  return (
    <header className="w-full border-b border-ink-100 bg-ink-000">
      <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon className="w-5 h-5" />
          <span className="font-[family-name:var(--font-mono)] text-base tracking-tight text-ink-900">
            max<span className="text-accent">cv</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={onToggleLang} className="text-xs text-ink-400 hover:text-ink-700 transition cursor-pointer px-2 py-1 rounded hover:bg-ink-050">
            {lang === "en" ? "ES" : "EN"}
          </button>
          <span className="text-[11px] text-ink-300 font-[family-name:var(--font-mono)]">v4.0</span>
        </div>
      </div>
    </header>
  );
}
