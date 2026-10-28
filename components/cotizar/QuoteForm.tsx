"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { MotionProvider } from "@/components/providers/Motion";
import { notaNoCamioneta, preguntas, provincias, tiposVehiculo, type IdOpciones, type PreguntaOpciones, type TipoVehiculo } from "@/config/quote-questions";
import { normalizeArPhone } from "@/lib/phone";
import { track } from "@/lib/analytics";
import { setSeleccion, useSeleccion } from "@/lib/selection";
import { readAttribution } from "@/components/providers/Attribution";
import { IconArrow, IconCheck } from "@/components/ui/Icons";

const STORAGE = "p70:cotizacion:v1";
export const GRACIAS_KEY = "p70:gracias";

type Respuestas = Partial<Record<IdOpciones, string>> & {
  comentario?: string;
  vehiculo?: { tipo?: TipoVehiculo; marca?: string; modelo?: string; anio?: string };
};
type Contacto = { nombre: string; whatsapp: string; email: string; localidad: string; provincia: string };

interface Estado {
  step: number;
  respuestas: Respuestas;
  /** La persona cambió el equipamiento en el formulario: ya no se pisa con el del selector. */
  eqManual: boolean;
  contacto: Contacto;
  consentimiento: boolean;
  startedAt: number;
}

const vacio = (): Estado => ({
  step: 0,
  respuestas: {},
  eqManual: false,
  contacto: { nombre: "", whatsapp: "", email: "", localidad: "", provincia: "" },
  consentimiento: false,
  startedAt: Date.now(),
});

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

const TOTAL = preguntas.length + 1; // + datos de contacto
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Formulario de cotización en la misma página: una pregunta por pantalla,
 * opciones como botones grandes (se sienten como elecciones de partida),
 * avance automático, botón atrás y estado guardado si recarga.
 * El equipamiento y el color del selector llegan precargados y viajan con el lead.
 */
export function QuoteForm() {
  return (
    <MotionProvider>
      <QuoteFormInner />
    </MotionProvider>
  );
}

function QuoteFormInner() {
  const router = useRouter();
  const sel = useSeleccion();
  const [s, setS] = useState<Estado>(vacio);
  const [hydrated, setHydrated] = useState(false);
  const [dir, setDir] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string | undefined>();
  const heading = useRef<HTMLHeadingElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const moved = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) setS({ ...vacio(), ...JSON.parse(saved) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(s));
    } catch {}
  }, [s, hydrated]);

  // Equipamiento precargado desde el selector (salvo que lo hayan cambiado acá).
  useEffect(() => {
    if (!hydrated || s.eqManual || !sel.elegida) return;
    setS((x) => (x.respuestas.equipamiento === `eq${sel.eq}` ? x : { ...x, respuestas: { ...x.respuestas, equipamiento: `eq${sel.eq}` } }));
  }, [sel.eq, sel.elegida, hydrated, s.eqManual]);

  // Al cambiar de paso: el foco va a la pregunta y, si quedó arriba de la pantalla, se acomoda.
  useEffect(() => {
    if (!hydrated || !moved.current) return;
    heading.current?.focus({ preventScroll: true });
    const r = top.current?.getBoundingClientRect();
    if (r && (r.top < 0 || r.top > window.innerHeight * 0.5)) {
      window.scrollTo({ top: window.scrollY + r.top - 16 });
    }
  }, [s.step, hydrated]);

  const go = useCallback(
    (to: number) => {
      moved.current = true;
      setDir(to > s.step ? 1 : -1);
      setS((x) => ({ ...x, step: Math.max(0, Math.min(TOTAL - 1, to)) }));
    },
    [s.step],
  );

  const completar = (n: number) => {
    if (!started.current) {
      started.current = true;
      track("start_quote", { equipamiento: sel.eq, color: sel.color });
    }
    track(`quote_step_${n + 1}`);
  };

  const elegir = (id: IdOpciones, value: string) => {
    setS((x) => ({ ...x, eqManual: x.eqManual || id === "equipamiento", respuestas: { ...x.respuestas, [id]: value } }));
    // Si cambia el equipamiento acá, el selector (y su P70 en /gracias) lo acompaña.
    const n = id === "equipamiento" ? Number(value.replace("eq", "")) : NaN;
    if (n) setSeleccion({ eq: n });
    completar(s.step);
    setTimeout(() => go(s.step + 1), 260);
  };

  const pregunta = preguntas[s.step];
  const esContacto = s.step === preguntas.length;

  // Atajos tipo juego: A, B, C… eligen la opción (con el foco en el formulario).
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (pregunta?.tipo !== "opciones" || e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as HTMLElement).closest("input, textarea, select")) return;
    const i = e.key.toUpperCase().charCodeAt(0) - 65;
    if (e.key.length === 1 && i >= 0 && i < pregunta.opciones.length) {
      e.preventDefault();
      elegir(pregunta.id, pregunta.opciones[i].id);
    }
  };

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const c = s.contacto;
    const errs: Record<string, string> = {};
    if (c.nombre.trim().length < 2) errs.nombre = "Ingresá tu nombre";
    if (!normalizeArPhone(c.whatsapp)) errs.whatsapp = "Ingresá un celular argentino con código de área (ej. 341 564-1103)";
    if (c.email && !/^\S+@\S+\.\S+$/.test(c.email)) errs.email = "El email no es válido";
    if (c.localidad.trim().length < 2) errs.localidad = "Ingresá tu localidad";
    if (!c.provincia) errs.provincia = "Elegí tu provincia";
    if (!s.consentimiento) errs.consentimiento = "Necesitamos tu consentimiento para contactarte";
    setErrores(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }

    // Preguntas obligatorias sin responder (por ejemplo, si se saltearon con el botón atrás).
    const faltante = preguntas.findIndex((p) => (p.tipo === "opciones" ? !s.respuestas[p.id] : p.tipo === "vehiculo" ? !s.respuestas.vehiculo?.tipo : false));
    if (faltante >= 0) return go(faltante);

    setEnviando(true);
    setError(null);
    const r = s.respuestas;
    const honeypot = (e.currentTarget.elements.namedItem("empresa") as HTMLInputElement | null)?.value;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          respuestas: {
            aventurero: r.aventurero,
            viaje: r.viaje,
            etapa: r.etapa,
            inversion: r.inversion,
            plazo: r.plazo,
            equipamiento: r.equipamiento,
            origen: r.origen,
            comentario: r.comentario ?? "",
            vehiculo: { tipo: r.vehiculo?.tipo, marca: r.vehiculo?.marca ?? "", modelo: r.vehiculo?.modelo ?? "", anio: r.vehiculo?.anio ?? "" },
          },
          contacto: c,
          consentimiento: s.consentimiento,
          seleccion: { eq: sel.eq, color: sel.color, elegida: sel.elegida },
          attrib: readAttribution(),
          turnstileToken: token,
          empresa: honeypot,
          startedAt: s.startedAt,
        }),
      });
      const json = (await res.json()) as { ok: boolean; categoria?: string; error?: string; issues?: { path: string; message: string }[] };
      if (!json.ok) {
        setError(json.issues?.[0]?.message ?? json.error ?? "No pudimos enviar el formulario.");
        if (token) window.turnstile?.reset();
        setEnviando(false);
        return;
      }
      track("submit_quote", { categoria: json.categoria, equipamiento: sel.eq, color: sel.color });
      sessionStorage.setItem(GRACIAS_KEY, JSON.stringify({ categoria: json.categoria, eq: sel.eq, color: sel.color }));
      localStorage.removeItem(STORAGE);
      router.push("/gracias");
    } catch {
      setError("No hay conexión. Probá de nuevo o escribinos por WhatsApp.");
      setEnviando(false);
    }
  }

  return (
    <div ref={top} onKeyDown={onKeyDown} className="scroll-mt-4">
      {/* Progreso */}
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => go(s.step - 1)} disabled={s.step === 0} className="flex min-h-11 items-center gap-2 text-sm font-semibold disabled:invisible">
          <IconArrow className="size-4 rotate-180" /> Atrás
        </button>
        <div className="flex h-2 flex-1 gap-1" role="progressbar" aria-label="Progreso del formulario" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={s.step + 1}>
          {Array.from({ length: TOTAL }, (_, i) => (
            <span key={i} className={`h-full flex-1 -skew-x-[24deg] transition-colors duration-300 ${i < s.step ? "bg-forest" : i === s.step ? "bg-ink/45" : "bg-ink/12"}`} />
          ))}
        </div>
        <span className="tabular font-cond text-sm text-stone">
          {pad(s.step + 1)}/{pad(TOTAL)}
        </span>
      </div>

      <div className="relative mt-8 min-h-[440px] sm:mt-10">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <m.div
            key={s.step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {pregunta?.tipo === "opciones" && pregunta.estilo === "niveles" && (
              <Niveles heading={heading} p={pregunta} value={s.respuestas[pregunta.id]} onPick={(v) => elegir(pregunta.id, v)} />
            )}

            {pregunta?.tipo === "opciones" && pregunta.estilo !== "niveles" && (
              <div>
                <Titulo heading={heading} id={`q-${pregunta.id}`}>
                  {pregunta.titulo}
                </Titulo>
                {pregunta.ayuda && <p className="mt-3 text-stone">{pregunta.ayuda}</p>}
                <div role="radiogroup" aria-labelledby={`q-${pregunta.id}`} className="mt-7 flex flex-col gap-2.5">
                  {pregunta.opciones.map((o, i) => {
                    const on = s.respuestas[pregunta.id] === o.id;
                    return (
                      <m.button
                        key={o.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => elegir(pregunta.id, o.id)}
                        className={`group flex min-h-16 w-full items-center gap-4 border-2 px-4 py-3.5 text-left text-[1.05rem] font-medium transition-[border-color,background-color,color,transform] duration-200 sm:px-5 sm:text-lg ${
                          on ? "border-forest bg-forest text-white" : "border-ink/15 bg-white/70 hover:-translate-y-0.5 hover:border-forest/60"
                        }`}
                      >
                        <Tecla on={on} letra={String.fromCharCode(65 + i)} />
                        {o.label}
                      </m.button>
                    );
                  })}
                </div>
              </div>
            )}

            {pregunta?.tipo === "vehiculo" && (
              <Vehiculo
                heading={heading}
                titulo={pregunta.titulo}
                ayuda={pregunta.ayuda}
                value={s.respuestas.vehiculo ?? {}}
                onChange={(v) => setS((x) => ({ ...x, respuestas: { ...x.respuestas, vehiculo: { ...x.respuestas.vehiculo, ...v } } }))}
                onNext={() => {
                  completar(s.step);
                  go(s.step + 1);
                }}
              />
            )}

            {pregunta?.tipo === "texto" && (
              <div>
                <Titulo heading={heading}>{pregunta.titulo}</Titulo>
                <p className="mt-3 text-stone">{pregunta.ayuda}</p>
                <label htmlFor="comentario" className="sr-only">
                  Comentario
                </label>
                <textarea
                  id="comentario"
                  rows={5}
                  maxLength={1500}
                  value={s.respuestas.comentario ?? ""}
                  onChange={(e) => setS((x) => ({ ...x, respuestas: { ...x.respuestas, comentario: e.target.value } }))}
                  className="mt-6 w-full border-2 border-ink/20 bg-white/80 p-4 text-lg focus:border-ink focus:outline-none"
                  placeholder="Ej.: busco algo para ir a pescar al sur con mi familia…"
                />
                <button
                  type="button"
                  onClick={() => {
                    completar(s.step);
                    go(s.step + 1);
                  }}
                  className="mt-6 inline-flex min-h-14 items-center gap-3 bg-forest px-6 text-lg font-semibold text-white transition-colors hover:bg-forest-deep"
                >
                  {s.respuestas.comentario ? "Siguiente" : "Omitir"} <IconArrow className="size-5" />
                </button>
              </div>
            )}

            {esContacto && (
              <form onSubmit={enviar} noValidate>
                <Titulo heading={heading}>¡Último paso! ¿Dónde te escribimos?</Titulo>
                <p className="mt-3 text-stone">Andy te responde por WhatsApp con la cotización de tu P70.</p>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <Campo id="nombre" label="Nombre" error={errores.nombre} className="sm:col-span-2">
                    <input
                      id="f-nombre"
                      autoComplete="name"
                      value={s.contacto.nombre}
                      onChange={(e) => setS((x) => ({ ...x, contacto: { ...x.contacto, nombre: e.target.value } }))}
                      aria-invalid={!!errores.nombre}
                      aria-describedby={errores.nombre ? "e-nombre" : undefined}
                    />
                  </Campo>
                  <Campo id="whatsapp" label="WhatsApp" hint="Con código de área, ej. 341 564-1103" error={errores.whatsapp}>
                    <input
                      id="f-whatsapp"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={s.contacto.whatsapp}
                      onChange={(e) => setS((x) => ({ ...x, contacto: { ...x.contacto, whatsapp: e.target.value } }))}
                      aria-invalid={!!errores.whatsapp}
                      aria-describedby={errores.whatsapp ? "e-whatsapp" : "h-whatsapp"}
                    />
                  </Campo>
                  <Campo id="email" label="Email (opcional)" error={errores.email}>
                    <input
                      id="f-email"
                      type="email"
                      autoComplete="email"
                      value={s.contacto.email}
                      onChange={(e) => setS((x) => ({ ...x, contacto: { ...x.contacto, email: e.target.value } }))}
                      aria-invalid={!!errores.email}
                      aria-describedby={errores.email ? "e-email" : undefined}
                    />
                  </Campo>
                  <Campo id="localidad" label="Localidad" error={errores.localidad}>
                    <input
                      id="f-localidad"
                      autoComplete="address-level2"
                      value={s.contacto.localidad}
                      onChange={(e) => setS((x) => ({ ...x, contacto: { ...x.contacto, localidad: e.target.value } }))}
                      aria-invalid={!!errores.localidad}
                      aria-describedby={errores.localidad ? "e-localidad" : undefined}
                    />
                  </Campo>
                  <Campo id="provincia" label="Provincia" error={errores.provincia}>
                    <select
                      id="f-provincia"
                      autoComplete="address-level1"
                      value={s.contacto.provincia}
                      onChange={(e) => setS((x) => ({ ...x, contacto: { ...x.contacto, provincia: e.target.value } }))}
                      aria-invalid={!!errores.provincia}
                      aria-describedby={errores.provincia ? "e-provincia" : undefined}
                    >
                      <option value="">Elegí…</option>
                      {provincias.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </Campo>
                </div>

                {/* Honeypot: oculto para personas, visible para bots */}
                <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label htmlFor="empresa">Empresa</label>
                  <input id="empresa" name="empresa" tabIndex={-1} autoComplete="off" />
                </div>

                <label className="mt-8 flex cursor-pointer items-start gap-3">
                  <input
                    id="f-consentimiento"
                    type="checkbox"
                    checked={s.consentimiento}
                    onChange={(e) => setS((x) => ({ ...x, consentimiento: e.target.checked }))}
                    className="mt-1 size-5 shrink-0 accent-[var(--color-ink)]"
                    aria-invalid={!!errores.consentimiento}
                    aria-describedby={errores.consentimiento ? "e-consentimiento" : undefined}
                  />
                  <span className="text-ink/85">
                    Acepto que AndyCampers use mis datos para responder esta consulta, según la{" "}
                    <Link href="/privacidad" target="_blank" className="font-semibold underline underline-offset-4">
                      política de privacidad
                    </Link>{" "}
                    (Ley 25.326).
                  </span>
                </label>
                {errores.consentimiento && (
                  <p id="e-consentimiento" className="mt-2 text-sm font-semibold text-falta">
                    {errores.consentimiento}
                  </p>
                )}

                <Turnstile onToken={setToken} />

                {error && (
                  <p role="alert" className="mt-6 border-l-4 border-falta bg-falta/10 p-4 font-medium">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 bg-forest px-6 text-lg font-semibold text-white transition-colors hover:bg-forest-deep disabled:opacity-60 sm:w-auto"
                >
                  {enviando ? "Enviando…" : "Enviar y pedir cotización"} <IconArrow className="size-5" />
                </button>
              </form>
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Titulo({ heading, id, children }: { heading: React.RefObject<HTMLHeadingElement | null>; id?: string; children: React.ReactNode }) {
  return (
    <h3 ref={heading} tabIndex={-1} id={id} className="font-display-x text-[clamp(1.75rem,6.4vw,2.9rem)] leading-[1.02] outline-none">
      {children}
    </h3>
  );
}

function Tecla({ on, letra }: { on: boolean; letra: string }) {
  return (
    <span
      aria-hidden
      className={`grid size-8 shrink-0 place-items-center border-2 font-cond text-sm font-semibold transition-colors ${
        on ? "border-white bg-white text-forest shadow-[0_3px_0_0_var(--color-forest-deep)]" : "border-ink/30 text-ink shadow-[0_3px_0_0_rgb(22_24_27/0.22)] group-hover:border-ink/60"
      }`}
    >
      {on ? <IconCheck className="size-4" /> : letra}
    </span>
  );
}

/* ───────────── Pregunta 1: selector de dificultad ───────────── */

const iconosNivel = [
  // 1 · ruta asfaltada
  <path key="1" d="M4 20 L10 4 M20 20 L14 4 M12 6 v2 M12 11 v2.5 M12 16.5 v3" />,
  // 2 · ripio
  <path key="2" d="M3 18 h18 M5 15.5 h.01 M9 16 h.01 M13 15.5 h.01 M17 16 h.01 M7 13 l3 -4 3 3 2 -2 4 4" />,
  // 3 · lugares remotos
  <path key="3" d="M2 19 l6 -10 4 6 3 -4 7 8 Z M15 5.5 a2 2 0 1 0 .01 0" />,
  // 4 · off-road de verdad
  <path key="4" d="M2 19 l7 -13 4 6 3 -3 6 10 Z M7.5 9 l1.5 1.5 1.5 -1.5 M4 19 c2 -2 4 -2 6 0 s4 2 6 0 4 -2 6 0" />,
];

function Niveles({
  heading,
  p,
  value,
  onPick,
}: {
  heading: React.RefObject<HTMLHeadingElement | null>;
  p: PreguntaOpciones;
  value?: string;
  onPick: (v: string) => void;
}) {
  return (
    <div>
      <p className="font-cond text-[1.05rem] font-semibold text-forest uppercase">Elegí tu dificultad</p>
      <div className="mt-2">
        <Titulo heading={heading} id={`q-${p.id}`}>
          {p.titulo}
        </Titulo>
      </div>
      <div role="radiogroup" aria-labelledby={`q-${p.id}`} className="mt-7 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {p.opciones.map((o, i) => {
          const on = value === o.id;
          return (
            <m.button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${o.label}: ${o.detalle}`}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPick(o.id)}
              className={`group relative flex items-center gap-4 border-2 p-4 text-left transition-[border-color,background-color,color,transform] duration-200 sm:flex-col sm:items-start sm:gap-3 lg:min-h-[248px] lg:p-5 ${
                on ? "border-forest bg-forest text-white" : "border-ink/15 bg-white/70 hover:-translate-y-1 hover:border-forest/60"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
                aria-hidden
                className={`size-10 shrink-0 lg:size-12 ${on ? "text-durazno" : "text-forest"}`}
              >
                {iconosNivel[i]}
              </svg>
              <span className="min-w-0 flex-1">
                <span className={`block font-cond text-[0.95rem] font-semibold uppercase ${on ? "text-durazno" : "text-forest"}`}>
                  {o.label}
                </span>
                <span className="mt-1 block text-[1.02rem] leading-snug font-medium lg:text-[1.08rem]">{o.detalle}</span>
                {/* Barra que se llena según el nivel */}
                <span className="mt-3 flex gap-1" aria-hidden>
                  {[0, 1, 2, 3].map((k) => (
                    <span
                      key={k}
                      className={`h-1.5 flex-1 -skew-x-[24deg] transition-colors duration-300 ${k <= i ? (on ? "bg-durazno" : "bg-forest/70 group-hover:bg-forest") : on ? "bg-bone/15" : "bg-ink/10"}`}
                      style={{ transitionDelay: `${k * 50}ms` }}
                    />
                  ))}
                </span>
              </span>
              <span className="absolute top-3 right-3 sm:static sm:hidden lg:absolute lg:block">
                <Tecla on={on} letra={String.fromCharCode(65 + i)} />
              </span>
            </m.button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────── Vehículo ───────────── */

function Vehiculo({
  heading,
  titulo,
  ayuda,
  value,
  onChange,
  onNext,
}: {
  heading: React.RefObject<HTMLHeadingElement | null>;
  titulo: string;
  ayuda?: string;
  value: NonNullable<Respuestas["vehiculo"]>;
  onChange: (v: Partial<NonNullable<Respuestas["vehiculo"]>>) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <Titulo heading={heading} id="q-vehiculo">
        {titulo}
      </Titulo>
      <p className="mt-3 text-stone">{ayuda}</p>
      <div role="radiogroup" aria-label="Tipo de vehículo" className="mt-7 grid grid-cols-3 gap-2.5">
        {tiposVehiculo.map((t) => {
          const on = value.tipo === t.id;
          return (
            <m.button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange({ tipo: t.id })}
              className={`min-h-16 border-2 px-2 text-[1.02rem] font-semibold transition-colors sm:text-lg ${on ? "border-forest bg-forest text-white" : "border-ink/15 bg-white/70 hover:border-ink/60"}`}
            >
              {t.label}
            </m.button>
          );
        })}
      </div>
      {value.tipo && value.tipo !== "camioneta" && (
        <p className="mt-4 border-l-4 border-forest bg-forest/10 px-4 py-3 font-medium text-forest-deep" aria-live="polite">
          {notaNoCamioneta}
        </p>
      )}
      <div className="mt-7 grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
        <Campo id="marca" label="Marca">
          <input id="f-marca" value={value.marca ?? ""} onChange={(e) => onChange({ marca: e.target.value })} placeholder="Ej. Toyota" autoComplete="off" />
        </Campo>
        <Campo id="modelo" label="Modelo">
          <input id="f-modelo" value={value.modelo ?? ""} onChange={(e) => onChange({ modelo: e.target.value })} placeholder="Ej. Hilux" autoComplete="off" />
        </Campo>
        <Campo id="anio" label="Año">
          <input
            id="f-anio"
            inputMode="numeric"
            maxLength={4}
            value={value.anio ?? ""}
            onChange={(e) => onChange({ anio: e.target.value.replace(/\D/g, "") })}
            placeholder="2022"
            autoComplete="off"
          />
        </Campo>
      </div>
      <button
        type="button"
        disabled={!value.tipo}
        onClick={onNext}
        className="mt-7 inline-flex min-h-14 items-center gap-3 bg-forest px-6 text-lg font-semibold text-white transition-colors hover:bg-forest-deep disabled:opacity-40"
      >
        Siguiente <IconArrow className="size-5" />
      </button>
      {!value.tipo && <p className="mt-3 text-sm text-stone">Elegí el tipo de vehículo para seguir.</p>}
    </div>
  );
}

function Campo({
  id,
  label,
  hint,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactElement;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={`f-${id}`} className="text-sm font-semibold">
        {label}
      </label>
      <div className="[&>input]:min-h-13 [&>input]:w-full [&>input]:border-2 [&>input]:border-ink/20 [&>input]:bg-white/80 [&>input]:px-4 [&>input]:text-lg [&>input]:focus:border-ink [&>input]:focus:outline-none [&>input[aria-invalid=true]]:border-falta [&>select]:min-h-13 [&>select]:w-full [&>select]:border-2 [&>select]:border-ink/20 [&>select]:bg-white/80 [&>select]:px-3 [&>select]:text-lg [&>select]:focus:border-ink [&>select]:focus:outline-none">
        {children}
      </div>
      {hint && !error && (
        <p id={`h-${id}`} className="text-sm text-stone">
          {hint}
        </p>
      )}
      {error && (
        <p id={`e-${id}`} className="text-sm font-semibold text-falta">
          {error}
        </p>
      )}
    </div>
  );
}

/** Cloudflare Turnstile (si hay site key). Se carga recién en el paso de contacto. */
function Turnstile({ onToken }: { onToken: (t: string | undefined) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!siteKey || !ready || !ref.current || !window.turnstile) return;
    const id = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      language: "es",
      callback: (t: string) => onToken(t),
      "expired-callback": () => onToken(undefined),
    });
    return () => window.turnstile?.reset(id);
  }, [siteKey, ready, onToken]);

  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} />
      <div ref={ref} className="mt-6 min-h-[65px]" />
    </>
  );
}
