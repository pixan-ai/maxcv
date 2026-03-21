export default function Header({
  lang,
  onToggleLang,
}: {
  lang: "en" | "es";
  onToggleLang: () => void;
}) {
  return (
    <header className="w-full border-b border-border">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="text-lg font-semibold tracking-tight">
          Max<span className="text-accent">CV</span>
        </a>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLang}
            className="text-xs text-muted hover:text-gray-900 transition cursor-pointer"
          >
            {lang === "en" ? "Español" : "English"}
          </button>
          <span className="text-xs text-muted">
            Powered by Claude Opus 4.6
          </span>
        </div>
      </div>
    </header>
  );
}
