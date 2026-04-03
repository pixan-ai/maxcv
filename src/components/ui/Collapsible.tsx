"use client";

const ARROW = "▶";

export function Collapsible({ title, isOpen, onToggle, children, className: wrapperClass }: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-ink-100 rounded-lg overflow-hidden ${wrapperClass ?? ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-050 transition cursor-pointer"
        aria-expanded={isOpen}
      >
        <span
          className="text-ink-400 text-sm transition-transform duration-200 leading-none"
          style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          {ARROW}
        </span>
        {title}
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "5000px" : "0" }}
      >
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}
