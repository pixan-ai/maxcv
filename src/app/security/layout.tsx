import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seguridad & Privacidad — maxcv",
  description: "Cómo maxcv protege tu CV: sin almacenamiento, sin cuentas, cifrado TLS, headers de seguridad, código abierto. Mozilla Observatory A+.",
  alternates: { canonical: "https://maxcv.org/security" },
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
