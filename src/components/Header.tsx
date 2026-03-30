import Link from "next/link";

export default function Header({ lang, onToggleLang }: {
  lang: "en" | "es"; onToggleLang: () => void;
}) {
  return (
    <header className="w-full border-b border-ink-100 bg-ink-000">
      <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <Link href="/" className="font-[family-name:var(--font-mono)] text-base tracking-tight text-ink-900">
          max<span className="text-accent">cv</span>
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
