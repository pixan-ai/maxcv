const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK || "#";
const PAYPAL_LINK = process.env.NEXT_PUBLIC_PAYPAL_DONATION_LINK || "#";

const TEXT = {
  en: {
    headline: "Did MaxCV help you? Consider supporting the project.",
    sub: "MaxCV is free and always will be. Donations help cover AI costs and keep it running.",
    stripe: "Support with card",
    paypal: "or PayPal",
  },
  es: {
    headline: "¿Te ayudó MaxCV? Considera apoyar el proyecto.",
    sub: "MaxCV es gratis y siempre lo será. Las donaciones ayudan a cubrir los costos de IA.",
    stripe: "Apoyar con tarjeta",
    paypal: "o PayPal",
  },
};

export default function DonationBanner({ lang }: { lang: "en" | "es" }) {
  const t = TEXT[lang];

  return (
    <div className="border border-border rounded-lg p-6 text-center space-y-3">
      <p className="text-sm font-medium">{t.headline}</p>
      <p className="text-xs text-muted">{t.sub}</p>
      <div className="flex items-center justify-center gap-3">
        <a
          href={STRIPE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-accent text-white text-sm font-medium py-2 px-5 rounded-lg hover:bg-accent-hover transition inline-block"
        >
          {t.stripe}
        </a>
        <a
          href={PAYPAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted hover:text-gray-900 font-medium transition"
        >
          {t.paypal}
        </a>
      </div>
    </div>
  );
}
