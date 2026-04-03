"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TERMS_UI } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export default function TermsPage() {
  const [lang, setLang] = useState<Lang>("es");
  const t = TERMS_UI[lang];

  return (
    <div className="min-h-screen flex flex-col bg-ink-000">
      <Header lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8">
        <section className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-3 text-ink-900">
            <span className="hero-reveal-1 inline-block">{t.heroTitle}</span>{" "}
            <span className="hero-reveal-2 inline-block text-accent">{t.heroAccent}</span>
          </h1>
          <p className="hero-reveal-3 text-ink-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">{t.heroSub}</p>
        </section>

        <div className="space-y-6">
          {t.sections.map((s, i) => (
            <section key={i} className="mb-2">
              <h2 className="text-lg font-medium text-ink-900 mb-3">{s.title}</h2>
              <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
                {s.items ? (
                  <ul className="space-y-3">
                    {s.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <span className="text-accent leading-none mt-0.5 shrink-0">→</span>
                        <span className="text-ink-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-700 leading-relaxed">{s.body}</p>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Contacto */}
        <div className="bg-ink-050 rounded-xl p-6 sm:p-8 mt-8 mb-6">
          <h2 className="text-sm font-medium text-ink-900 mb-1">{t.contactTitle}</h2>
          <p className="text-sm text-ink-500 leading-relaxed mb-2">{t.contactBody}</p>
          <a href={`mailto:${t.contactEmail}`} className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.contactEmail}</a>
        </div>

        <p className="text-xs text-ink-300">{t.updated}</p>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
