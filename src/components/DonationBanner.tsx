const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK || "#";
const PAYPAL_LINK = process.env.NEXT_PUBLIC_PAYPAL_DONATION_LINK || "#";

const TEXT = {
  en: { headline: "maxcv helped? Keep it free for everyone.", sub: "Donations cover AI costs \u2014 every bit helps keep this running.", stripe: "Support with card", paypal: "PayPal" },
  es: { headline: "\u00bfTe ayud\u00f3 maxcv? Mantenlo gratis para todos.", sub: "Las donaciones cubren costos de IA \u2014 cada aporte ayuda.", stripe: "Apoyar con tarjeta", paypal: "PayPal" },
};

export default function DonationBanner({ lang }: { lang: "en" | "es" }) {
  const t = TEXT[lang];
  return (
    <div className="bg-ink-050 rounded-xl p-6 text-center space-y-3">
      <p className="text-sm font-medium text-ink-900">{t.headline}</p>
      <p className="text-xs text-ink-400">{t.sub}</p>
      <div className="flex items-center justify-center gap-3 pt-1">
        <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer"
          className="bg-ink-900 text-white text-sm font-medium py-2.5 px-5 rounded-lg hover:bg-ink-700 transition inline-block">
          {t.stripe}
        </a>
        <a href={PAYPAL_LINK} target="_blank" rel="noopener noreferrer"
          className="text-sm text-ink-400 hover:text-ink-700 font-medium transition">{t.paypal}</a>
      </div>
    </div>
  );
}
