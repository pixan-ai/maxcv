"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Lang } from "@/lib/i18n";

const ABOUT_UI = {
  es: {
    heroStrike: "¿Quiénes somos?",
    heroTitle: "¿Quién",
    heroAccent: "soy?",
    blocks: [
      "Este es un proyecto de una persona con muchas horas de vuelo en tecnología y muchos años analizando cientos de CVs y entrevistando candidatos de múltiples perfiles e industrias. Construí MaxCV con una convicción simple: el acceso a un trabajo digno es un derecho humano reconocido globalmente, y las mejores herramientas deberían estar al alcance de todos.",
      "Alguien necesitaba un buen analizador de CV en español. No existía. Así que lo construimos. Y ¿por qué no?, también para cualquier idioma. Y después, buscamos optimizar ese CV a su máxima expresión con IA generativa de frontera (gracias, Anthropic!). Buscamos ayudar a cualquier persona a encontrar ese trabajo que te cambia la vida.",
      "Esto no es un startup buscando la siguiente ronda de inversión. Es un café en la mano, una ThinkPad X1 hermosa, una API key de Anthropic, y la terquedad suficiente para hacer que funcione. El código es open source / MIT. La optimización es sin costo y anónima. Los datos se evaporan de inmediato.",
      "Si te sirve para conseguir ese trabajo que estás buscando, ya valió toda la desvelada. Y si logras obtener ese trabajo que te cambió la vida, se vale regresar y donar para tokens, stack y crecimiento. MaxCV siempre será gratis, anónimo, honesto y transparente.",
    ],
    signature: "Alfredo Arenas",
    location: "Ciudad de México",
  },
  en: {
    heroStrike: "About us",
    heroTitle: "About",
    heroAccent: "me",
    blocks: [
      "This is a one-person project with many flight hours in technology and many years reviewing hundreds of resumes and interviewing candidates across multiple roles and industries. I built MaxCV with a simple conviction: access to dignified work is a globally recognized human right, and the best tools should be available to everyone.",
      "Someone needed a good resume analyzer in Spanish. It didn\u2019t exist. So we built it. And why not make it work in any language too? And then, we set out to optimize any resume to its fullest potential with frontier generative AI (thanks, Anthropic!). We\u2019re here to help anyone find the job that changes their life.",
      "This isn\u2019t a startup chasing the next funding round. It\u2019s a cup of coffee, a beautiful ThinkPad X1, an Anthropic API key, and enough stubbornness to make it work. The code is open source / MIT. The optimization is free and anonymous. Your data evaporates immediately.",
      "If this helps you land the job you\u2019re looking for, every late night was worth it. And if you do land the job that changed your life, feel free to come back and donate for tokens, stack, and growth. MaxCV will always be free, anonymous, honest, and transparent.",
    ],
    signature: "Alfredo Arenas",
    location: "Mexico City",
  },
} as const;

export default function AboutPage() {
  const [lang, setLang] = useState<Lang>("es");
  const t = ABOUT_UI[lang];

  return (
    <div className="min-h-screen flex flex-col bg-ink-000">
      <Header lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8">
        {/* Hero */}
        <section className="text-center mb-10">
          <p className="hero-reveal-1 text-sm text-ink-300 line-through mb-2">{t.heroStrike}</p>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-3 text-ink-900">
            <span className="hero-reveal-1 inline-block">{t.heroTitle}</span>{" "}
            <span className="hero-reveal-2 inline-block text-accent">{t.heroAccent}</span>
          </h1>
        </section>

        {/* Text blocks */}
        <div className="space-y-6 mb-12">
          {t.blocks.map((block, i) => (
            <p key={i} className="text-sm sm:text-base text-ink-700 leading-relaxed">{block}</p>
          ))}
        </div>

        {/* Signature with photo */}
        <div className="mb-8 flex items-center gap-4">
          <Image
            src="/alfredo.webp"
            alt="Alfredo Arenas"
            width={48}
            height={48}
            className="rounded-full grayscale opacity-80"
          />
          <div>
            <p className="text-sm text-ink-700 font-medium">— {t.signature}</p>
            <p className="text-xs text-ink-400">{t.location}</p>
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
