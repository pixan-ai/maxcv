import Link from "next/link";

export default function Footer({ lang = "en" }: { lang?: "en" | "es" }) {
  return (
    <footer className="w-full border-t border-[--ink-100]">
      <div className="max-w-3xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-[--ink-400]">
          <span className="font-[family-name:var(--font-mono)] text-[--ink-500]">maxcv</span>
          <span>{lang === "en" ? "Free forever. No data stored." : "Gratis siempre. Sin datos almacenados."}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[--ink-400]">
          <Link href="/" className="hover:text-[--ink-700] transition">
            {lang === "en" ? "Improve" : "Mejorar"}
          </Link>
          <Link href="/score" className="hover:text-[--ink-700] transition">
            Score
          </Link>
        </div>
      </div>
    </footer>
  );
}
