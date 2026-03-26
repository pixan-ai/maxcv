import Link from "next/link";

export default function Header({ lang, onToggleLang, active = "improve" }: {
  lang: "en" | "es"; onToggleLang: () => void; active?: "improve" | "score";
}) {
  return (
    <header className="w-full border-b border-ink-100 bg-ink-000">
      <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-[family-name:var(--font-mono)] text-base tracking-tight text-ink-900">
            max<span className="text-accent">cv</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/" className={`px-3 py-1.5 rounded-md text-sm transition ${
              active === "improve" ? "bg-ink-050 text-ink-900 font-medium" : "text-ink-400 hover:text-ink-700 hover:bg-ink-050"
            }`}>{lang === "en" ? "Improve" : "Mejorar"}</Link>
            <Link href="/score" className={`px-3 py-1.5 rounded-md text-sm transition ${
              active === "score" ? "bg-ink-050 text-ink-900 font-medium" : "text-ink-400 hover:text-ink-700 hover:bg-ink-050"
            }`}>Score</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onToggleLang} className="text-xs text-ink-400 hover:text-ink-700 transition cursor-pointer px-2 py-1 rounded hover:bg-ink-050">
            {lang === "en" ? "ES" : "EN"}
          </button>
          <span className="text-[11px] text-ink-300 font-[family-name:var(--font-mono)]">v3.2</span>
        </div>
      </div>
    </header>
  );
}
