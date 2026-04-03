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
    privacy: "Privacidad",
    terms: "Términos",
    howItWorks: "¿Cómo funciona?",
    donate: "Donar",
    about: "¿Quiénes somos?",
  },
  en: {
    security: "Security",
    privacy: "Privacy",
    terms: "Terms",
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
    contactEmail: "security@maxcv.org",
    updated: "Última actualización: Abril 2026",
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
    updated: "Last updated: April 2026",
  },
};

// ─── Privacy Notice (LFPDPPP 2025 + International) ─────────────────
type PrivacyDataItem = {
  icon: string;
  title: string;
  body: string;
};

type ArcoRight = {
  letter: string;
  name: string;
  desc: string;
};

type InternationalRight = {
  icon: string;
  region: string;
  law: string;
  body: string;
};

type PrivacyStrings = {
  heroTitle: string;
  heroAccent: string;
  heroSub: string;
  responsableTitle: string;
  responsableBody: string;
  dataTitle: string;
  dataItems: PrivacyDataItem[];
  purposeTitle: string;
  purposeItems: string[];
  purposeNote: string;
  neverTitle: string;
  neverItems: string[];
  arcoTitle: string;
  arcoBody: string;
  arcoRights: ArcoRight[];
  arcoHow: string;
  thirdPartyTitle: string;
  thirdPartyBody: string;
  securityTitle: string;
  securityBody: string;
  changesTitle: string;
  changesBody: string;
  authorityTitle: string;
  authorityBody: string;
  internationalTitle: string;
  internationalBody: string;
  internationalRights: InternationalRight[];
  internationalNote: string;
  contactTitle: string;
  contactBody: string;
  contactEmail: string;
  updated: string;
};

export const PRIVACY_UI: Record<Lang, PrivacyStrings> = {
  es: {
    heroTitle: "Aviso de",
    heroAccent: "Privacidad",
    heroSub: "Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP 2025).",
    responsableTitle: "1. Responsable del tratamiento",
    responsableBody: "MaxCV (operado por Pixan AI) es responsable del tratamiento de los datos personales que recabamos. Domicilio para oír y recibir notificaciones: Ciudad de México, México. Correo de contacto: security@maxcv.org.",
    dataTitle: "2. Datos personales que tratamos",
    dataItems: [
      { icon: "📄", title: "Contenido de tu CV", body: "El texto o archivo PDF que subes para análisis. Este contenido se procesa en tiempo real y se descarta inmediatamente al finalizar el análisis. No se almacena en ningún servidor, base de datos ni respaldo." },
      { icon: "🌐", title: "Datos técnicos mínimos", body: "Dirección IP (solo para control de tasa de uso, no se almacena de forma persistente). No recopilamos nombre, correo electrónico, teléfono ni ningún dato de identificación personal." },
      { icon: "📊", title: "Analítica anónima", body: "Vercel Analytics recopila métricas agregadas de uso del sitio (páginas vistas, país de origen, tipo de dispositivo). Estos datos son anónimos y no permiten identificarte individualmente." },
    ],
    purposeTitle: "3. Finalidades del tratamiento",
    purposeItems: [
      "Analizar y evaluar tu CV mediante inteligencia artificial para generar un puntaje y recomendaciones de mejora (finalidad necesaria).",
      "Generar una versión mejorada de tu CV optimizada para sistemas de reclutamiento ATS (finalidad necesaria).",
      "Aplicar control de tasa de uso para prevenir abuso del servicio (finalidad necesaria).",
      "Recopilar métricas anónimas y agregadas para mejorar el servicio (finalidad voluntaria).",
    ],
    purposeNote: "Todas las finalidades necesarias están directamente vinculadas a la prestación del servicio. No tratamos tus datos para finalidades secundarias como marketing, publicidad ni perfilamiento.",
    neverTitle: "4. Lo que nunca hacemos con tus datos",
    neverItems: [
      "Almacenar tu CV o su contenido después del análisis",
      "Crear perfiles, cuentas de usuario o bases de datos con información personal",
      "Vender, compartir, licenciar o monetizar tus datos de ninguna forma",
      "Usar tu CV para entrenar modelos de inteligencia artificial",
      "Inferir género, edad, etnia, orientación sexual, religión o nacionalidad",
      "Enviar comunicaciones comerciales o contactarte después de tu visita",
      "Usar cookies de tracking, retargeting o analytics invasivos",
    ],
    arcoTitle: "5. Derechos ARCO (México)",
    arcoBody: "Como titular de tus datos personales, la LFPDPPP te otorga los siguientes derechos:",
    arcoRights: [
      { letter: "A", name: "Acceso", desc: "Conocer qué datos personales tenemos sobre ti y cómo los tratamos." },
      { letter: "R", name: "Rectificación", desc: "Solicitar la corrección de tus datos personales si son inexactos o incompletos." },
      { letter: "C", name: "Cancelación", desc: "Solicitar la eliminación de tus datos personales de nuestros registros." },
      { letter: "O", name: "Oposición", desc: "Oponerte al tratamiento de tus datos personales para finalidades específicas." },
    ],
    arcoHow: "Dado que MaxCV no almacena datos personales de forma persistente, en la práctica no existen datos sobre los cuales ejercer estos derechos después de que tu sesión finaliza. Sin embargo, puedes ejercer tus derechos ARCO o revocar tu consentimiento en cualquier momento enviando un correo a security@maxcv.org.",
    thirdPartyTitle: "6. Terceros y transferencias",
    thirdPartyBody: "El contenido de tu CV se envía a la API de Anthropic (Claude) exclusivamente para su análisis. Anthropic no utiliza los datos enviados a su API para entrenar modelos. No realizamos ninguna otra transferencia de datos personales a terceros nacionales o internacionales. MaxCV corre en la infraestructura de Vercel (respaldada por AWS), que procesa las solicitudes web sin almacenar el contenido de los CVs.",
    securityTitle: "7. Medidas de seguridad",
    securityBody: "Implementamos cifrado TLS/SSL en todas las comunicaciones. Los HTTP security headers incluyen HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy y Permissions-Policy. No mantenemos bases de datos con información personal. El código fuente es abierto y auditable en GitHub. Para más detalles técnicos, consulta nuestra página de Seguridad.",
    changesTitle: "8. Cambios al aviso de privacidad",
    changesBody: "Nos reservamos el derecho de modificar este aviso de privacidad. Cualquier cambio será publicado en esta página con la fecha de actualización correspondiente. Te recomendamos revisarlo periódicamente.",
    authorityTitle: "9. Autoridad competente (México)",
    authorityBody: "Si consideras que tu derecho a la protección de datos personales ha sido vulnerado, puedes acudir a la Secretaría de Anticorrupción y Buen Gobierno, autoridad competente conforme a la LFPDPPP vigente desde el 21 de marzo de 2025.",
    internationalTitle: "10. Usuarios internacionales",
    internationalBody: "MaxCV es un servicio global. Aunque operamos desde México bajo la LFPDPPP, reconocemos y respetamos los derechos de privacidad de usuarios en otras jurisdicciones:",
    internationalRights: [
      { icon: "🇪🇺", region: "Unión Europea (GDPR)", law: "Reglamento General de Protección de Datos", body: "Tienes derecho a acceder, rectificar, suprimir (\"derecho al olvido\"), portar, restringir y oponerte al tratamiento de tus datos. Nuestra base legal para el procesamiento es tu consentimiento implícito al usar el servicio. Dado que no almacenamos datos personales, estos derechos se cumplen por diseño." },
      { icon: "🇧🇷", region: "Brasil (LGPD)", law: "Lei Geral de Proteção de Dados", body: "Tienes derechos equivalentes al GDPR: acceso, corrección, anonimización, portabilidad, eliminación e información sobre compartición. MaxCV cumple con la LGPD de facto al no retener datos personales." },
      { icon: "🇺🇸", region: "Estados Unidos (CCPA/CPRA)", law: "California Consumer Privacy Act", body: "Si resides en California, tienes derecho a saber qué datos recopilamos, solicitar su eliminación y optar por no participar en la venta de datos. MaxCV no vende ni comparte datos personales con fines de publicidad." },
      { icon: "🇨🇦", region: "Canadá (PIPEDA)", law: "Personal Information Protection and Electronic Documents Act", body: "Tienes derecho a acceder a tus datos personales y solicitar correcciones. MaxCV recopila solo lo estrictamente necesario para el servicio y no retiene información después del análisis." },
    ],
    internationalNote: "En todas las jurisdicciones aplica el mismo principio: MaxCV no almacena tu CV ni datos personales de forma persistente. Para ejercer cualquier derecho de privacidad, sin importar tu país, escríbenos a security@maxcv.org.",
    contactTitle: "¿Dudas sobre privacidad?",
    contactBody: "Para ejercer tus derechos de privacidad (ARCO, GDPR, LGPD, CCPA u otros), revocar tu consentimiento, o cualquier consulta relacionada con el tratamiento de tus datos personales.",
    contactEmail: "security@maxcv.org",
    updated: "Última actualización: Abril 2026",
  },
  en: {
    heroTitle: "Privacy",
    heroAccent: "Notice",
    heroSub: "In compliance with Mexico's LFPDPPP (2025), the EU's GDPR, Brazil's LGPD, California's CCPA, and Canada's PIPEDA.",
    responsableTitle: "1. Data controller",
    responsableBody: "MaxCV (operated by Pixan AI) is the data controller responsible for the personal data we collect. Address for notifications: Mexico City, Mexico. Contact email: security@maxcv.org.",
    dataTitle: "2. Personal data we process",
    dataItems: [
      { icon: "📄", title: "Your resume content", body: "The text or PDF file you upload for analysis. This content is processed in real time and discarded immediately after analysis. It is not stored on any server, database, or backup." },
      { icon: "🌐", title: "Minimal technical data", body: "IP address (only for rate limiting, not stored persistently). We do not collect your name, email, phone number, or any personal identification data." },
      { icon: "📊", title: "Anonymous analytics", body: "Vercel Analytics collects aggregate site usage metrics (page views, country of origin, device type). This data is anonymous and cannot identify you individually." },
    ],
    purposeTitle: "3. Purposes of data processing",
    purposeItems: [
      "Analyze and evaluate your resume using AI to generate a score and improvement recommendations (necessary purpose).",
      "Generate an improved version of your resume optimized for ATS recruitment systems (necessary purpose).",
      "Apply rate limiting to prevent service abuse (necessary purpose).",
      "Collect anonymous, aggregate metrics to improve the service (voluntary purpose).",
    ],
    purposeNote: "All necessary purposes are directly linked to service delivery. We do not process your data for secondary purposes such as marketing, advertising, or profiling.",
    neverTitle: "4. What we never do with your data",
    neverItems: [
      "Store your resume or its contents after analysis",
      "Create profiles, user accounts, or databases with personal information",
      "Sell, share, license, or monetize your data in any way",
      "Use your resume to train AI models",
      "Infer gender, age, ethnicity, sexual orientation, religion, or nationality",
      "Send marketing communications or contact you after your visit",
      "Use tracking cookies, retargeting, or invasive analytics",
    ],
    arcoTitle: "5. ARCO Rights (Mexico)",
    arcoBody: "As a data subject under Mexico's LFPDPPP, you have the following rights:",
    arcoRights: [
      { letter: "A", name: "Access", desc: "Know what personal data we hold about you and how we process it." },
      { letter: "R", name: "Rectification", desc: "Request correction of your personal data if inaccurate or incomplete." },
      { letter: "C", name: "Cancellation", desc: "Request deletion of your personal data from our records." },
      { letter: "O", name: "Opposition", desc: "Object to the processing of your personal data for specific purposes." },
    ],
    arcoHow: "Since MaxCV does not persistently store personal data, in practice there is no data to exercise these rights on after your session ends. However, you may exercise your ARCO rights or revoke your consent at any time by emailing security@maxcv.org.",
    thirdPartyTitle: "6. Third parties and transfers",
    thirdPartyBody: "Your resume content is sent to Anthropic's API (Claude) exclusively for analysis. Anthropic does not use data sent to its API to train models. We do not make any other transfers of personal data to domestic or international third parties. MaxCV runs on Vercel's infrastructure (backed by AWS), which processes web requests without storing resume content.",
    securityTitle: "7. Security measures",
    securityBody: "We implement TLS/SSL encryption on all communications. HTTP security headers include HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy. We maintain no databases with personal information. Source code is open and auditable on GitHub. For more technical details, see our Security page.",
    changesTitle: "8. Changes to this privacy notice",
    changesBody: "We reserve the right to modify this privacy notice. Any changes will be published on this page with the corresponding update date. We recommend reviewing it periodically.",
    authorityTitle: "9. Competent authority (Mexico)",
    authorityBody: "If you believe your right to personal data protection has been violated, you may contact Mexico's Secretaría de Anticorrupción y Buen Gobierno, the competent authority under the LFPDPPP effective since March 21, 2025.",
    internationalTitle: "10. International users",
    internationalBody: "MaxCV is a global service. Although we operate from Mexico under the LFPDPPP, we recognize and respect the privacy rights of users in other jurisdictions:",
    internationalRights: [
      { icon: "🇪🇺", region: "European Union (GDPR)", law: "General Data Protection Regulation", body: "You have the right to access, rectify, erase (\"right to be forgotten\"), port, restrict, and object to the processing of your data. Our legal basis for processing is your implied consent when using the service. Since we do not store personal data, these rights are fulfilled by design." },
      { icon: "🇧🇷", region: "Brazil (LGPD)", law: "Lei Geral de Proteção de Dados", body: "You have equivalent rights to the GDPR: access, correction, anonymization, portability, deletion, and information about data sharing. MaxCV complies with the LGPD de facto by not retaining personal data." },
      { icon: "🇺🇸", region: "United States (CCPA/CPRA)", law: "California Consumer Privacy Act", body: "If you reside in California, you have the right to know what data we collect, request its deletion, and opt out of the sale of data. MaxCV does not sell or share personal data for advertising purposes." },
      { icon: "🇨🇦", region: "Canada (PIPEDA)", law: "Personal Information Protection and Electronic Documents Act", body: "You have the right to access your personal data and request corrections. MaxCV collects only what is strictly necessary for the service and does not retain information after analysis." },
    ],
    internationalNote: "The same principle applies across all jurisdictions: MaxCV does not persistently store your resume or personal data. To exercise any privacy right, regardless of your country, email us at security@maxcv.org.",
    contactTitle: "Privacy questions?",
    contactBody: "To exercise your privacy rights (ARCO, GDPR, LGPD, CCPA, or others), revoke your consent, or for any inquiry related to the processing of your personal data.",
    contactEmail: "security@maxcv.org",
    updated: "Last updated: April 2026",
  },
};

// ─── Terms of Use ──────────────────────────────────────────────────
type TermsSection = {
  title: string;
  body?: string;
  items?: string[];
};

type TermsStrings = {
  heroTitle: string;
  heroAccent: string;
  heroSub: string;
  sections: TermsSection[];
  contactTitle: string;
  contactBody: string;
  contactEmail: string;
  updated: string;
};

export const TERMS_UI: Record<Lang, TermsStrings> = {
  es: {
    heroTitle: "Términos de",
    heroAccent: "Uso",
    heroSub: "Al usar MaxCV aceptas los siguientes términos y condiciones.",
    sections: [
      { title: "1. Descripción del servicio", body: "MaxCV es una herramienta gratuita de análisis y mejora de currículums (CVs) que utiliza inteligencia artificial. El servicio evalúa tu CV en 6 dimensiones y genera recomendaciones de mejora. MaxCV es operado por Pixan AI desde Ciudad de México, México." },
      { title: "2. Uso aceptable", items: ["El servicio es exclusivamente para analizar y mejorar currículums legítimos.", "No debes enviar contenido ilegal, ofensivo, discriminatorio o que viole derechos de terceros.", "No debes intentar sobrecargar, hackear, realizar ingeniería inversa o interferir con el funcionamiento del servicio.", "No debes usar el servicio para generar contenido fraudulento o engañoso en un CV.", "El uso está sujeto a un límite de 7 análisis por hora por dirección IP."] },
      { title: "3. Naturaleza del análisis", body: "MaxCV utiliza inteligencia artificial (Claude, de Anthropic) para analizar tu CV. Los resultados son recomendaciones automatizadas, no asesoría profesional. La IA puede cometer errores. Tú eres responsable de verificar y validar cualquier cambio antes de usar tu CV en procesos de selección. MaxCV no garantiza que seguir las recomendaciones resulte en obtener un empleo." },
      { title: "4. Propiedad intelectual", body: "El contenido de tu CV te pertenece. MaxCV no reclama ningún derecho sobre tu CV original ni sobre la versión mejorada que genera. El código fuente de MaxCV es software de código abierto. La marca MaxCV, su diseño y logotipos son propiedad de Pixan AI." },
      { title: "5. Donaciones", body: "MaxCV opera bajo un modelo de donación voluntaria. Las donaciones no son obligatorias para usar el servicio. Las donaciones realizadas no son reembolsables. No se ofrecen servicios adicionales ni garantías a cambio de donaciones." },
      { title: "6. Privacidad y datos personales", body: "El tratamiento de tus datos personales se rige por nuestro Aviso de Privacidad, disponible en /privacy. MaxCV no almacena tu CV ni crea perfiles de usuario. Para más detalles sobre nuestras prácticas de seguridad, consulta /security." },
      { title: "7. Limitación de responsabilidad", items: ["MaxCV se proporciona \"tal cual\" (as is), sin garantías de ningún tipo, expresas o implícitas.", "No garantizamos la disponibilidad ininterrumpida del servicio.", "No somos responsables por decisiones tomadas con base en las recomendaciones de la IA.", "No somos responsables por daños directos, indirectos, incidentales o consecuentes derivados del uso del servicio.", "La responsabilidad total de MaxCV en cualquier caso no excederá el monto de donaciones realizadas por el usuario en los últimos 12 meses."] },
      { title: "8. Disponibilidad", body: "MaxCV se esfuerza por mantener el servicio disponible, pero no garantiza su funcionamiento ininterrumpido. Nos reservamos el derecho de suspender o descontinuar el servicio temporal o permanentemente, con o sin aviso previo." },
      { title: "9. Modificaciones", body: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta página con la fecha de actualización. El uso continuado del servicio después de una modificación constituye la aceptación de los nuevos términos." },
      { title: "10. Legislación aplicable", body: "Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes de la Ciudad de México." },
    ],
    contactTitle: "¿Preguntas sobre estos términos?",
    contactBody: "Si tienes dudas sobre nuestros términos de uso, contáctanos.",
    contactEmail: "security@maxcv.org",
    updated: "Última actualización: Abril 2026",
  },
  en: {
    heroTitle: "Terms of",
    heroAccent: "Use",
    heroSub: "By using MaxCV you agree to the following terms and conditions.",
    sections: [
      { title: "1. Service description", body: "MaxCV is a free AI-powered resume analysis and improvement tool. The service evaluates your resume across 6 dimensions and generates improvement recommendations. MaxCV is operated by Pixan AI from Mexico City, Mexico." },
      { title: "2. Acceptable use", items: ["The service is exclusively for analyzing and improving legitimate resumes.", "You must not submit illegal, offensive, discriminatory content or content that violates third-party rights.", "You must not attempt to overload, hack, reverse-engineer, or interfere with the service.", "You must not use the service to generate fraudulent or misleading resume content.", "Usage is subject to a limit of 7 analyses per hour per IP address."] },
      { title: "3. Nature of analysis", body: "MaxCV uses artificial intelligence (Claude, by Anthropic) to analyze your resume. Results are automated recommendations, not professional advice. AI can make mistakes. You are responsible for verifying and validating any changes before using your resume in job applications. MaxCV does not guarantee that following recommendations will result in employment." },
      { title: "4. Intellectual property", body: "Your resume content belongs to you. MaxCV claims no rights over your original resume or the improved version it generates. MaxCV's source code is open-source software. The MaxCV brand, design, and logos are property of Pixan AI." },
      { title: "5. Donations", body: "MaxCV operates under a voluntary donation model. Donations are not required to use the service. Donations are non-refundable. No additional services or guarantees are offered in exchange for donations." },
      { title: "6. Privacy and personal data", body: "The processing of your personal data is governed by our Privacy Notice, available at /privacy. MaxCV does not store your resume or create user profiles. For more details on our security practices, see /security." },
      { title: "7. Limitation of liability", items: ["MaxCV is provided \"as is\", without warranties of any kind, express or implied.", "We do not guarantee uninterrupted service availability.", "We are not responsible for decisions made based on AI recommendations.", "We are not liable for direct, indirect, incidental, or consequential damages arising from use of the service.", "MaxCV's total liability shall not exceed the amount of donations made by the user in the preceding 12 months."] },
      { title: "8. Availability", body: "MaxCV strives to maintain service availability but does not guarantee uninterrupted operation. We reserve the right to suspend or discontinue the service temporarily or permanently, with or without notice." },
      { title: "9. Modifications", body: "We reserve the right to modify these terms at any time. Changes will be published on this page with the update date. Continued use of the service after a modification constitutes acceptance of the new terms." },
      { title: "10. Governing law", body: "These terms are governed by the laws of Mexico. For any dispute, the parties submit to the jurisdiction of the competent courts of Mexico City." },
    ],
    contactTitle: "Questions about these terms?",
    contactBody: "If you have questions about our terms of use, contact us.",
    contactEmail: "security@maxcv.org",
    updated: "Last updated: April 2026",
  },
};
