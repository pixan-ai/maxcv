const TEXT = {
  en: {
    title: "Who We Are",
    p1: "maxcv was born from a simple idea: everyone deserves a great resume, regardless of their budget. We're a small team of developers and career enthusiasts in Mexico City.",
    p2: "We use advanced AI to analyze and improve your resume with the same quality you'd get from a career coach — instantly and completely free.",
    p3: "Your privacy matters. We never store your resume or personal data.",
  },
  es: {
    title: "Quiénes Somos",
    p1: "maxcv nació de una idea simple: todos merecen un gran currículum, sin importar su presupuesto. Somos un pequeño equipo de desarrolladores en la Ciudad de México.",
    p2: "Usamos IA avanzada para analizar y mejorar tu currículum con la misma calidad que un coach profesional — al instante y completamente gratis.",
    p3: "Tu privacidad importa. Nunca almacenamos tu currículum ni datos personales.",
  },
};

export default function AboutUs({ lang }: { lang: "en" | "es" }) {
  const t = TEXT[lang];
  return (
    <section className="mt-20 mb-8">
      <div className="bg-[--ink-050] rounded-2xl p-8 sm:p-10 max-w-xl mx-auto">
        <h2 className="text-lg font-medium text-[--ink-900] mb-4">{t.title}</h2>
        <div className="space-y-3 text-sm text-[--ink-500] leading-relaxed">
          <p>{t.p1}</p>
          <p>{t.p2}</p>
          <p>{t.p3}</p>
        </div>
      </div>
    </section>
  );
}
