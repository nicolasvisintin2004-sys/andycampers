"use client";

import dynamic from "next/dynamic";
import { useSettled } from "@/lib/settled";

/**
 * El formulario (con Framer Motion, ~27 KB) se pide recién cuando la página se
 * asentó o con la primera interacción: está lejos del primer pantallazo y así
 * no compite con el LCP. Mientras tanto, un esqueleto del mismo alto (sin saltos).
 */
const QuoteForm = dynamic(() => import("./QuoteForm").then((m) => m.QuoteForm), {
  ssr: false,
  loading: () => <Esqueleto />,
});

function Esqueleto() {
  return (
    <div aria-hidden className="min-h-[540px] sm:min-h-[560px]">
      <div className="flex h-11 items-center gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="h-2 flex-1 -skew-x-[24deg] bg-ink/10" />
        ))}
      </div>
      <div className="mt-10 h-12 w-3/4 bg-ink/8" />
      <div className="mt-8 grid gap-2.5 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 border-2 border-ink/10 bg-white/50 lg:h-[248px]" />
        ))}
      </div>
    </div>
  );
}

export function QuoteFormLazy() {
  const settled = useSettled();
  return settled ? <QuoteForm /> : <Esqueleto />;
}
