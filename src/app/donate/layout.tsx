import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apoya maxcv — Donaciones",
  description: "Ayuda a mantener maxcv gratis. Tu donación cubre API de Claude, infraestructura y desarrollo continuo.",
  alternates: { canonical: "https://maxcv.org/donate" },
};

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
