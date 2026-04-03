"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DONATE_UI } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export default function DonatePage() {
  const [lang, setLang] = useState<Lang>("es");
  const t = DONATE_UI[lang];

  return (
    <div className="min-h-screen flex flex-col bg-ink-000">
      <Header lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8">
        {/* Hero */}
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-3 text-ink-900">
            <span className="hero-reveal-1 inline-block">{t.heroTitle}</span>{" "}
            <span className="hero-reveal-2 inline-block text-accent">{t.heroAccent}</span>
          </h1>
          <p className="hero-reveal-3 text-ink-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            {t.heroSub}
          </p>
        </section>

        {/* How it works — transparency */}
        <section className="mb-12">
          <h2 className="text-lg font-medium text-ink-900 mb-4">{t.whyTitle}</h2>
          <div className="space-y-3">
            {t.whyItems.map((item, i) => (
              <div key={i} className="border border-ink-100 rounded-xl p-5 sm:p-6 transition hover:border-ink-200">
                <div className="flex items-start gap-3.5">
                  <span className="text-lg leading-none mt-0.5 shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="text-sm font-medium text-ink-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-ink-500 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA — Buy Me a Coffee */}
        <section className="mb-12">
          <div className="border border-accent/20 rounded-xl p-6 sm:p-8 text-center">
            <p className="text-sm text-ink-700 mb-1 font-medium">{t.ctaTitle}</p>
            <p className="text-sm text-ink-500 mb-5 leading-relaxed max-w-md mx-auto">{t.ctaSub}</p>
            <a
              href="https://buymeacoffee.com/alfredoarenas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-accent-dim transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8h1a4 4 0 110 8h-1" />
                <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
              </svg>
              {t.ctaBtn}
            </a>
            <p className="text-xs text-ink-300 mt-4">{t.ctaNote}</p>
          </div>
        </section>

        {/* What your donation covers */}
        <section className="mb-12">
          <h2 className="text-lg font-medium text-ink-900 mb-4">{t.coversTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
            <ul className="space-y-3">
              {t.coversItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-accent leading-none mt-0.5 shrink-0">{item.icon}</span>
                  <div>
                    <span className="text-ink-700 font-medium">{item.label}</span>
                    <span className="text-ink-500"> — {item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Promise */}
        <section className="mb-12">
          <h2 className="text-lg font-medium text-ink-900 mb-4">{t.promiseTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
            <ul className="space-y-3">
              {t.promiseItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-positive leading-none mt-0.5 shrink-0">✓</span>
                  <span className="text-ink-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="bg-ink-050 rounded-xl p-6 sm:p-8 text-center mb-6">
          <p className="text-sm text-ink-700 font-medium mb-2">{t.bottomTitle}</p>
          <p className="text-sm text-ink-500 leading-relaxed mb-4">{t.bottomBody}</p>
          <a
            href="https://buymeacoffee.com/alfredoarenas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:text-accent-dim transition font-medium"
          >
            {t.bottomLink} →
          </a>
        </div>

        <p className="text-xs text-ink-300">{t.updated}</p>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
