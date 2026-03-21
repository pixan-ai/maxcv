const TEXT = {
  en: {
    title: "What is an ATS?",
    subtitle: "Understanding Applicant Tracking Systems",
    intro:
      "An ATS (Applicant Tracking System) is software that companies use to manage job applications. Before a human ever sees your resume, the ATS scans and ranks it. Understanding how it works can make the difference between landing an interview or being filtered out.",
    howTitle: "How does it work?",
    howSteps: [
      {
        title: "Parsing",
        desc: "The ATS reads your resume and extracts key information: contact details, work experience, education, and skills.",
      },
      {
        title: "Keyword matching",
        desc: "It compares your resume against the job description, looking for relevant keywords, skills, and qualifications.",
      },
      {
        title: "Ranking",
        desc: "Candidates are scored and ranked. Only the top-ranked resumes are forwarded to hiring managers.",
      },
    ],
    tipsTitle: "Tips to beat the ATS",
    tips: [
      "Use standard section headers (Experience, Education, Skills) — avoid creative names",
      "Include keywords from the job posting naturally in your resume",
      "Use a clean, simple format — avoid tables, columns, images, and fancy graphics",
      "Submit in PDF or DOCX format (PDF is generally safest)",
      "Spell out acronyms at least once (e.g., \"Search Engine Optimization (SEO)\")",
      "Tailor your resume for each application — one-size-fits-all doesn't work",
    ],
    stat: "75%+ of resumes are rejected by ATS before a human sees them.",
    cta: "MaxCV optimizes your resume for ATS compatibility automatically — just paste your CV above and let AI do the work.",
  },
  es: {
    title: "¿Qué es un ATS?",
    subtitle: "Entendiendo los Sistemas de Seguimiento de Candidatos",
    intro:
      "Un ATS (Applicant Tracking System) es un software que las empresas usan para gestionar solicitudes de empleo. Antes de que un humano vea tu currículum, el ATS lo escanea y clasifica. Entender cómo funciona puede ser la diferencia entre conseguir una entrevista o ser filtrado.",
    howTitle: "¿Cómo funciona?",
    howSteps: [
      {
        title: "Análisis",
        desc: "El ATS lee tu currículum y extrae información clave: datos de contacto, experiencia laboral, educación y habilidades.",
      },
      {
        title: "Coincidencia de palabras clave",
        desc: "Compara tu currículum con la descripción del puesto, buscando palabras clave, habilidades y requisitos relevantes.",
      },
      {
        title: "Clasificación",
        desc: "Los candidatos reciben una puntuación y se clasifican. Solo los mejor puntuados llegan a los reclutadores.",
      },
    ],
    tipsTitle: "Consejos para pasar el ATS",
    tips: [
      "Usa encabezados estándar (Experiencia, Educación, Habilidades) — evita nombres creativos",
      "Incluye palabras clave de la vacante de forma natural en tu currículum",
      "Usa un formato limpio y simple — evita tablas, columnas, imágenes y gráficos elaborados",
      "Envía en formato PDF o DOCX (PDF es generalmente más seguro)",
      "Escribe los acrónimos completos al menos una vez (ej. \"Optimización para Motores de Búsqueda (SEO)\")",
      "Personaliza tu currículum para cada solicitud — uno genérico no funciona",
    ],
    stat: "Más del 75% de los CVs son rechazados por el ATS antes de que un humano los vea.",
    cta: "MaxCV optimiza tu currículum para compatibilidad con ATS automáticamente — solo pega tu CV arriba y deja que la IA haga el trabajo.",
  },
};

export default function AtsExplainer({ lang }: { lang: "en" | "es" }) {
  const t = TEXT[lang];

  return (
    <section className="border-t border-border pt-16 pb-8">
      <h2 className="text-2xl font-bold tracking-tight mb-2 text-center">
        {t.title}
      </h2>
      <p className="text-muted text-sm text-center mb-8">{t.subtitle}</p>

      <div className="max-w-xl mx-auto space-y-8">
        <p className="text-sm text-gray-600 leading-relaxed">{t.intro}</p>

        {/* How it works */}
        <div>
          <h3 className="text-base font-semibold mb-4">{t.howTitle}</h3>
          <div className="space-y-4">
            {t.howSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div>
          <h3 className="text-base font-semibold mb-3">{t.tipsTitle}</h3>
          <ul className="space-y-2">
            {t.tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-accent mt-0.5 shrink-0">&bull;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Stat callout */}
        <div className="bg-accent-light rounded-lg p-5 text-center">
          <p className="text-sm font-semibold text-accent">{t.stat}</p>
          <p className="text-xs text-gray-600 mt-2">{t.cta}</p>
        </div>
      </div>
    </section>
  );
}
