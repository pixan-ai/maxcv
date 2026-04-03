import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Uso — maxcv",
  description: "Términos y condiciones de uso de maxcv. Servicio gratuito de análisis de CV con IA, operado desde México.",
  alternates: { canonical: "https://maxcv.org/terms" },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
