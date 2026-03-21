const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK || "#";
const PAYPAL_LINK = process.env.NEXT_PUBLIC_PAYPAL_DONATION_LINK || "#";

export default function DonationBanner() {
  return (
    <div className="border border-border rounded-lg p-6 text-center space-y-3">
      <p className="text-sm font-medium">
        Did MaxCV help you? Consider supporting the project.
      </p>
      <p className="text-xs text-muted">
        MaxCV is free and always will be. Donations help cover AI costs and keep
        it running.
      </p>
      <div className="flex items-center justify-center gap-3">
        <a
          href={STRIPE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-accent text-white text-sm font-medium py-2 px-5 rounded-lg hover:bg-accent-hover transition inline-block"
        >
          Support with card
        </a>
        <a
          href={PAYPAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted hover:text-gray-900 font-medium transition"
        >
          or PayPal
        </a>
      </div>
    </div>
  );
}
