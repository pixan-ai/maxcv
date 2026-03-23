export default function Header({
  lang,
  onToggleLang,
}: {
  lang: "en" | "es";
  onToggleLang: () => void;
}) {
  return (
    <header className="w-full border-b border-[--ink-100]">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="font-[family-name:var(--font-mono)] text-base tracking-tight text-[--ink-900]">
          max<span className="text-[--accent]">cv</span>
        </a>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLang}
            className="text-xs text-[--ink-500] hover:text-[--ink-900] transition cursor-pointer"
          >
            {lang === "en" ? "Español" : "English"}
          </button>
          <span className="text-xs text-[--ink-300]">v2.1</span>
        </div>
      </div>
    </header>
  );
}
