export default function Footer() {
  return (
    <footer className="w-full border-t border-border">
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
        <span>by MaxCV — Free for everyone, forever.</span>
        <span>
          Built with{" "}
          <a
            href="https://www.anthropic.com/claude"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover transition"
          >
            Claude Opus 4.6
          </a>
          , the most capable AI model.
        </span>
      </div>
    </footer>
  );
}
