import Link from "next/link";

const LINKS = {
  es: { security: "Seguridad", howItWorks: "¿Cómo funciona?", donate: "Donar", about: "¿Quiénes somos?" },
  en: { security: "Security", howItWorks: "How it works", donate: "Donate", about: "About us" },
};

export function Footer({ lang }: { lang: "en" | "es" }) {
  const t = LINKS[lang];
  return (
    <footer className="w-full border-t border-ink-100 bg-ink-000">
      <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-ink-400">
          <Link href="/#how" className="hover:text-ink-700 transition">{t.howItWorks}</Link>
          <Link href="/#donate" className="hover:text-ink-700 transition">{t.donate}</Link>
          <Link href="/" className="hover:text-ink-700 transition">Home</Link>
          <Link href="/security" className="hover:text-ink-700 transition">{t.security}</Link>
          <a href="https://github.com/pixan-ai/maxcv" target="_blank" rel="noopener noreferrer" className="hover:text-ink-700 transition">GitHub</a>
          <Link href="/#about" className="hover:text-ink-700 transition">{t.about}</Link>
        </div>
        <p className="text-[11px] text-ink-300">maxcv v5.1</p>
      </div>
    </footer>
  );
}

export default Footer;
