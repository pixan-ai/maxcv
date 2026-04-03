import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "¿Quién soy? — maxcv",
  description: "La historia detrás de maxcv: un proyecto personal para democratizar el acceso a herramientas profesionales de CV con IA.",
  alternates: { canonical: "https://maxcv.org/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
