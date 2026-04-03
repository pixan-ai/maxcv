export type Lang = "en" | "es";

// ─── Analyzer strings ──────────────────────────────────────────────
export const ANALYZER_UI = {
  es: {
    heroTitle: "Tu próximo trabajo empieza con un gran CV.",
    heroAccent: "Análisis profesional 100% anónimo con IA de última generación",
    heroLine1: "Descubre cómo ven tu CV los expertos y sistemas de reclutamiento (ATS)",
    heroLine2: "Mejóralo al instante sin registrarte, sin almacenar tu info y sin costo siempre.",
    placeholder: "Pega el texto de tu CV aquí o adjunta un PDF",
    attachPdf: "Adjuntar PDF",
    targetRole: "Puesto al que aspiras",
    targetRoleOptional: "(Opcional)",
    btnAnalyze: "Analizar tu CV y recomendar mejoras",
    rateLimit: "Puedes analizar y mejorar tu CV hasta 7 veces cada hora",
    privacy: "Tu CV se analiza en línea por IA de frontera y se elimina de inmediato",
    analyzing: "Analizando tu CV...",
    uploadingPdf: "Cargando tu PDF para extraer el texto...",
    scoreMeta: "puntuación actual",
    originalCvTitle: "Texto original de tu CV",
    targetRoleTitle: "Puesto al que aspiras",
    analysisStepTitle: "Análisis de tu CV",
    scoreSummaryTitle: "Score y resumen del análisis",
    strengthsTitle: "Lo que ya funciona bien",
    improvementsTitle: "Oportunidades de mejora",
    improvedStepTitle: "Tu nuevo CV mejorado (texto)",
    newTextTitle: "Nuevo texto (para copiar y pegar)",
    changesSubTitle: "Mejoras que aplicamos",
    expandHint: "Expande cada sección para ver el detalle",
    noteP1: "Revísalo y realiza las correcciones que consideres necesarias en tu CV.",
    noteP2: "Hasta 7 revisiones de CV cada hora (ilimitadas por día).",
    noteP3: "Sí, esto es gratis para ayudar a otros.",
    noteP4: "Claude es IA y puede cometer errores. Por favor, verifica tu información antes de enviar tu CV.",
    copy: "Copiar",
    copied: "¡Copiado!",
    donationText: "¿Te fue útil? Ayúdanos a mantenerlo gratis.",
    donationBtn: "Invitar un café",
    tryAgain: "Empezar de nuevo",
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    errorLimit: "Límite alcanzado (7/hora). Intenta más tarde.",
    errorConnection: "Error de conexión. Revisa tu internet.",
    errorLength: "Pega al menos 50 caracteres.",
    errorPdf: "No se pudo leer el PDF. Intenta pegando el texto directamente.",
    before: "Antes",
    after: "Después",
    notSpecified: "No especificado",
  },
  en: {
    heroTitle: "Your next job starts with a great resume.",
    heroAccent: "100% anonymous professional analysis with cutting-edge AI",
    heroLine1: "See how recruiters and applicant tracking systems (ATS) see your resume",
    heroLine2: "Improve it instantly — no sign-up, no data stored, always free.",
    placeholder: "Paste your resume text here or attach a PDF",
    attachPdf: "Attach PDF",
    targetRole: "Target role",
    targetRoleOptional: "(Optional)",
    btnAnalyze: "Analyze your resume and suggest improvements",
    rateLimit: "You can analyze and improve your resume up to 7 times per hour",
    privacy: "Your resume is analyzed online by frontier AI and deleted immediately",
    analyzing: "Analyzing your resume...",
    uploadingPdf: "Loading your PDF to extract text...",
    scoreMeta: "current score",
    originalCvTitle: "Your original resume text",
    targetRoleTitle: "Target role",
    analysisStepTitle: "Analysis of your resume",
    scoreSummaryTitle: "Score and analysis summary",
    strengthsTitle: "What already works well",
    improvementsTitle: "Improvement opportunities",
    improvedStepTitle: "Your improved resume (text)",
    newTextTitle: "New text (copy and paste)",
    changesSubTitle: "Improvements we applied",
    expandHint: "Expand each section for details",
    noteP1: "Review it and make any corrections you see fit in your resume.",
    noteP2: "Up to 7 resume reviews per hour (unlimited per day).",
    noteP3: "Yes, this is free to help others.",
    noteP4: "Claude is AI and can make mistakes. Please verify your information before sending your resume.",
    copy: "Copy",
    copied: "Copied!",
    donationText: "Found this useful? Help us keep it free.",
    donationBtn: "Buy us a coffee",
    tryAgain: "Start over",
    errorGeneric: "Something went wrong. Please try again.",
    errorLimit: "Limit reached (7/hour). Try again later.",
    errorConnection: "Connection error. Check your internet.",
    errorLength: "Please paste at least 50 characters.",
    errorPdf: "Could not read the PDF. Try pasting the text directly.",
    before: "Before",
    after: "After",
    notSpecified: "Not specified",
  },
} as const;

export type AnalyzerStrings = typeof ANALYZER_UI.es;

// ─── Dimension names ───────────────────────────────────────────────
export const DIM_NAMES: Record<string, { en: string; es: string }> = {
  ats_compatibility: { en: "ATS Compatibility", es: "Compatibilidad ATS" },
  achievement_impact: { en: "Achievement Impact", es: "Impacto de Logros" },
  structure_format: { en: "Structure & Format", es: "Estructura y Formato" },
  keyword_relevance: { en: "Keyword Relevance", es: "Palabras Clave" },
  writing_clarity: { en: "Writing Clarity", es: "Claridad de Escritura" },
  completeness: { en: "Completeness", es: "Completitud" },
};

// ─── Header strings ────────────────────────────────────────────────
export const HEADER_UI = {
  es: {
    powered: "Análisis y optimización con Claude Opus 4.6 · Anthropic",
  },
  en: {
    powered: "Analysis & optimization by Claude Opus 4.6 · Anthropic",
  },
} as const;

// ─── Footer strings ────────────────────────────────────────────────
export const FOOTER_UI = {
  es: {
    security: "Seguridad",
    howItWorks: "¿Cómo funciona?",
    donate: "Donar",
    about: "¿Quiénes somos?",
  },
  en: {
    security: "Security",
    howItWorks: "How it works",
    donate: "Donate",
    about: "About us",
  },
} as const;

// ─── Security page strings ─────────────────────────────────────────
type SecuritySection = {
  icon: string;
  title: string;
  body: string;
  link?: { label: string; href: string };
};

type SecurityStrings = {
  heroTitle: string;
  heroAccent: string;
  heroSub: string;
  sections: SecuritySection[];
  neverTitle: string;
  neverItems: string[];
  openTitle: string;
  openBody: string;
  openLink: string;
  contactTitle: string;
  contactBody: string;
  contactEmail: string;
  updated: string;
};

export const SECURITY_UI: Record<Lang, SecurityStrings> = {
  es: {
    heroTitle: "Seguridad",
    heroAccent: "& Privacidad",
    heroSub: "Tu CV contiene información personal sensible. Así es como la protegemos.",
    sections: [
      { icon: "🗑", title: "No almacenamos tu CV", body: "Tu archivo se procesa en tiempo real durante el análisis y se descarta inmediatamente después. No existe en ningún servidor, base de datos, ni respaldo. Ni siquiera nosotros podemos recuperarlo." },
      { icon: "👤", title: "Sin cuentas, sin perfiles", body: "No necesitas registrarte. No creamos perfiles de usuario. No usamos cookies de tracking. No hay base de datos con tu información. Llegas, analizas tu CV, y te vas." },
      { icon: "🚫", title: "No vendemos datos", body: "No tenemos datos que vender. No compartimos información con terceros. No hacemos retargeting. No monetizamos tu información de ninguna forma." },
      { icon: "🔒", title: "Cifrado en tránsito", body: "Toda la comunicación entre tu navegador y nuestros servidores está cifrada con TLS/SSL. Tu CV viaja protegido en todo momento." },
      { icon: "🤖", title: "IA responsable", body: "Tu CV se analiza usando Claude, creado por Anthropic. Los datos enviados a la API de Anthropic no se usan para entrenar modelos. Anthropic es pionera en IA constitucional con principios éticos explícitos.", link: { label: "Conoce la constitución de Claude →", href: "https://www.anthropic.com/news/claude-new-constitution" } },
      { icon: "🏗", title: "Infraestructura moderna", body: "maxcv corre en Vercel, respaldada por la infraestructura global de AWS. Sin servidores propios que mantener, sin bases de datos de CVs, sin puntos débiles adicionales." },
    ],
    neverTitle: "Lo que nunca hacemos",
    neverItems: ["Almacenar tu CV o su contenido", "Crear perfiles o cuentas de usuario", "Usar cookies de tracking o analytics invasivos", "Vender, compartir, o monetizar tus datos", "Usar tu CV para entrenar modelos de IA", "Inferir género, edad, etnia, u otros datos personales", "Contactarte después de tu visita"],
    openTitle: "Código abierto",
    openBody: "maxcv es open source. Puedes inspeccionar exactamente cómo procesamos tu CV, qué enviamos a la API, y verificar que cumplimos cada promesa de esta página.",
    openLink: "Ver código en GitHub →",
    contactTitle: "¿Preguntas de seguridad?",
    contactBody: "Si tienes dudas sobre cómo manejamos tus datos, escríbenos.",
    contactEmail: "seguridad@maxcv.org",
    updated: "Última actualización: Marzo 2026",
  },
  en: {
    heroTitle: "Security",
    heroAccent: "& Privacy",
    heroSub: "Your resume contains sensitive personal information. Here's how we protect it.",
    sections: [
      { icon: "🗑", title: "We don't store your resume", body: "Your file is processed in real time during analysis and discarded immediately after. It doesn't exist on any server, database, or backup. Even we can't retrieve it." },
      { icon: "👤", title: "No accounts, no profiles", body: "You don't need to sign up. We don't create user profiles. We don't use tracking cookies. There's no database with your information. You arrive, analyze your resume, and leave." },
      { icon: "🚫", title: "We don't sell data", body: "We have no data to sell. We don't share information with third parties. We don't retarget. We don't monetize your information in any way." },
      { icon: "🔒", title: "Encrypted in transit", body: "All communication between your browser and our servers is encrypted with TLS/SSL. Your resume travels protected at all times." },
      { icon: "🤖", title: "Responsible AI", body: "Your resume is analyzed using Claude, created by Anthropic. Data sent to Anthropic's API is not used to train models. Anthropic is a pioneer in constitutional AI with explicit ethical principles.", link: { label: "Read Claude's constitution →", href: "https://www.anthropic.com/news/claude-new-constitution" } },
      { icon: "🏗", title: "Modern infrastructure", body: "maxcv runs on Vercel, backed by AWS's global infrastructure. No self-managed servers, no resume databases, no additional weak points." },
    ],
    neverTitle: "What we never do",
    neverItems: ["Store your resume or its contents", "Create user profiles or accounts", "Use tracking cookies or invasive analytics", "Sell, share, or monetize your data", "Use your resume to train AI models", "Infer gender, age, ethnicity, or other personal data", "Contact you after your visit"],
    openTitle: "Open source",
    openBody: "maxcv is open source. You can inspect exactly how we process your resume, what we send to the API, and verify that we keep every promise on this page.",
    openLink: "View code on GitHub →",
    contactTitle: "Security questions?",
    contactBody: "If you have questions about how we handle your data, reach out.",
    contactEmail: "security@maxcv.org",
    updated: "Last updated: March 2026",
  },
};
