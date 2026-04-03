"use client";

import { useState } from "react";
import { Analyzer } from "@/components/Analyzer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Lang } from "@/lib/i18n";

export default function Home() {
  const [lang, setLang] = useState<Lang>("es");

  return (
    <div className="min-h-screen flex flex-col bg-ink-000">
      <Header lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} />
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8">
        <Analyzer lang={lang} onLangDetected={setLang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}
