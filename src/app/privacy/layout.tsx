import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de Privacidad — maxcv",
  description: "Aviso de privacidad conforme a LFPDPPP, GDPR, LGPD, CCPA y PIPEDA. maxcv no almacena datos personales.",
  alternates: { canonical: "https://maxcv.org/privacy" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
