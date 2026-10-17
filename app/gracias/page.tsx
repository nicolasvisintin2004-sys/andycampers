import type { Metadata } from "next";
import { Gracias } from "@/components/cotizar/Gracias";

export const metadata: Metadata = {
  title: "¡Gracias!",
  robots: { index: false, follow: false },
  alternates: { canonical: "/gracias" },
};

export default function GraciasPage() {
  return <Gracias />;
}
