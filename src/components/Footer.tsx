import Link from "next/link";

const LINKS = {
  es: {
    tagline: "Gratis siempre. Sin datos almacenados.",
    security: "Seguridad",
  },
  en: {
    tagline: "Free forever. No data stored.",
    security: "Security",
  },
};

export function Footer({ lang }: { lang: "en" | "es" }) {
  const t = LINKS[lang];

  return (
    <footer className="w-full border-t border-ink-100 bg-ink-000">
      <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-4 text-xs text-ink-400">
          <Link href="/" className="hover:text-ink-700 transition">
            Home
          </Link>
          <Link href="/security" className="hover:text-ink-700 transition">
            {t.security}
          </Link>
          <a
            href="https://github.com/pixan-ai/maxcv"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink-700 transition"
          >
            GitHub
          </a>
        </div>
        <p className="text-xs text-ink-300">{t.tagline}</p>
      </div>
    </footer>
  );
}

export default Footer;
