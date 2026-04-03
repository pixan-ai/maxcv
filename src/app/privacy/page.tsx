"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PRIVACY_UI } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>("es");
  const t = PRIVACY_UI[lang];

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

        {/* Responsable */}
        <section className="mb-8">
          <h2 className="text-lg font-medium text-ink-900 mb-3">{t.responsableTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
            <p className="text-sm text-ink-700 leading-relaxed">{t.responsableBody}</p>
          </div>
        </section>

        {/* Datos que recopilamos */}
        <section className="mb-8">
          <h2 className="text-lg font-medium text-ink-900 mb-3">{t.dataTitle}</h2>
          <div className="space-y-3">
            {t.dataItems.map((item, i) => (
              <div key={i} className="border border-ink-100 rounded-xl p-5 sm:p-6">
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

        {/* Finalidades */}
        <section className="mb-8">
          <h2 className="text-lg font-medium text-ink-900 mb-3">{t.purposeTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
            <ul className="space-y-3">
              {t.purposeItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-accent leading-none mt-0.5 shrink-0">→</span>
                  <span className="text-ink-700">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-ink-500 mt-4 leading-relaxed">{t.purposeNote}</p>
          </div>
        </section>

        {/* Lo que NO hacemos */}
        <section className="mb-8">
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

        {/* Derechos ARCO */}
        <section className="mb-8">
          <h2 className="text-lg font-medium text-ink-900 mb-3">{t.arcoTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
            <p className="text-sm text-ink-700 leading-relaxed mb-3">{t.arcoBody}</p>
            <ul className="space-y-2">
              {t.arcoRights.map((right, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-accent leading-none mt-0.5 shrink-0 font-medium">{right.letter}</span>
                  <span className="text-ink-700"><strong className="text-ink-900">{right.name}:</strong> {right.desc}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-ink-500 mt-4 leading-relaxed">{t.arcoHow}</p>
          </div>
        </section>

        {/* Terceros */}
        <section className="mb-8">
          <h2 className="text-lg font-medium text-ink-900 mb-3">{t.thirdPartyTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
            <p className="text-sm text-ink-700 leading-relaxed">{t.thirdPartyBody}</p>
          </div>
        </section>

        {/* Seguridad */}
        <section className="mb-8">
          <h2 className="text-lg font-medium text-ink-900 mb-3">{t.securityTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
            <p className="text-sm text-ink-700 leading-relaxed">{t.securityBody}</p>
          </div>
        </section>

        {/* Cambios al aviso */}
        <section className="mb-8">
          <h2 className="text-lg font-medium text-ink-900 mb-3">{t.changesTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
            <p className="text-sm text-ink-700 leading-relaxed">{t.changesBody}</p>
          </div>
        </section>

        {/* Autoridad */}
        <section className="mb-8">
          <h2 className="text-lg font-medium text-ink-900 mb-3">{t.authorityTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
            <p className="text-sm text-ink-700 leading-relaxed">{t.authorityBody}</p>
          </div>
        </section>

        {/* Internacional */}
        <section className="mb-8">
          <h2 className="text-lg font-medium text-ink-900 mb-3">{t.internationalTitle}</h2>
          <p className="text-sm text-ink-500 leading-relaxed mb-3">{t.internationalBody}</p>
          <div className="space-y-3">
            {t.internationalRights.map((right, i) => (
              <div key={i} className="border border-ink-100 rounded-xl p-5 sm:p-6">
                <div className="flex items-start gap-3.5">
                  <span className="text-lg leading-none mt-0.5 shrink-0">{right.icon}</span>
                  <div>
                    <h3 className="text-sm font-medium text-ink-900 mb-0.5">{right.region}</h3>
                    <p className="text-xs text-ink-400 mb-2">{right.law}</p>
                    <p className="text-sm text-ink-500 leading-relaxed">{right.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-ink-500 mt-4 leading-relaxed">{t.internationalNote}</p>
        </section>

        {/* Contacto */}
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
