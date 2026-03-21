export default function Header() {
  return (
    <header className="w-full border-b border-border">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="text-lg font-semibold tracking-tight">
          Max<span className="text-accent">CV</span>
        </a>
        <span className="text-xs text-muted">
          Powered by Claude Opus 4.6
        </span>
      </div>
    </header>
  );
}
