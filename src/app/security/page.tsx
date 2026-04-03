"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SECURITY_UI } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export default function SecurityPage() {
  const [lang, setLang] = useState<Lang>("es");
  const t = SECURITY_UI[lang];

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

        <div className="space-y-3 mb-16">
          {t.sections.map((s, i) => (
            <div key={i} className="border border-ink-100 rounded-xl p-5 sm:p-6 transition hover:border-ink-200">
              <div className="flex items-start gap-3.5">
                <span className="text-lg leading-none mt-0.5 shrink-0">{s.icon}</span>
                <div>
                  <h2 className="text-sm font-medium text-ink-900 mb-1">{s.title}</h2>
                  <p className="text-sm text-ink-500 leading-relaxed">{s.body}</p>
                  {s.link && (
                    <a href={s.link.href} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-accent hover:text-accent-dim transition inline-block mt-2 font-medium">{s.link.label}</a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="mb-16">
          <h2 className="text-lg font-medium text-ink-900 mb-4">{t.neverTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
            <ul className="space-y-3">
              {t.neverItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-red-500 leading-none mt-0.5 shrink-0">✕</span>
                  <span className="text-ink-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-lg font-medium text-ink-900 mb-2">{t.openTitle}</h2>
          <p className="text-sm text-ink-500 leading-relaxed mb-3">{t.openBody}</p>
          <a href="https://github.com/pixan-ai/maxcv" target="_blank" rel="noopener noreferrer"
            className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.openLink}</a>
        </section>

        <div className="bg-ink-050 rounded-xl p-6 sm:p-8 mb-6">
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
