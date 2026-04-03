import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo funciona — maxcv",
  description: "Pipeline técnico de maxcv: cómo analizamos y mejoramos tu CV con IA. Open source, auditable, sin almacenamiento de datos.",
  alternates: { canonical: "https://maxcv.org/how" },
};

export default function HowLayout({ children }: { children: React.ReactNode }) {
  return children;
}
