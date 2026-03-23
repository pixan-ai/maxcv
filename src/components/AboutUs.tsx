const TEXT = {
  en: {
    title: "Who We Are",
    p1: "maxcv was born from a simple idea: everyone deserves a great resume, regardless of their budget. We're a small team of developers and career enthusiasts based in Mexico City, building tools that make professional growth accessible to all.",
    p2: "We use the most advanced AI available to analyze and improve your resume with the same quality you'd get from a professional career coach, but instantly and completely free.",
    p3: "Your privacy matters. We never store your resume or personal data. Everything is processed in real-time and immediately discarded.",
  },
  es: {
    title: "Quiénes Somos",
    p1: "maxcv nació de una idea simple: todos merecen un gran currículum, sin importar su presupuesto. Somos un pequeño equipo de desarrolladores y entusiastas de carrera en la Ciudad de México, construyendo herramientas que hacen el crecimiento profesional accesible para todos.",
    p2: "Usamos la IA más avanzada disponible para analizar y mejorar tu currículum con la misma calidad que obtendrías de un coach profesional, pero al instante y completamente gratis.",
    p3: "Tu privacidad importa. Nunca almacenamos tu currículum ni datos personales. Todo se procesa en tiempo real y se descarta inmediatamente.",
  },
};

export default function AboutUs({ lang }: { lang: "en" | "es" }) {
  const t = TEXT[lang];

  return (
    <section className="border-t border-[--ink-100] pt-16 pb-8">
      <h2 className="text-2xl font-light tracking-tight mb-6 text-center text-[--ink-900]">
        {t.title}
      </h2>
      <div className="space-y-4 text-sm text-[--ink-500] leading-relaxed max-w-xl mx-auto">
        <p>{t.p1}</p>
        <p>{t.p2}</p>
        <p>{t.p3}</p>
      </div>
    </section>
  );
}
