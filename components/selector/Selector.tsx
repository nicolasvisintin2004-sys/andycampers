"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { colores, equipamientos, hexColor, nombreColor, nombreEq, videoSelector, type Equipamiento } from "@/config/p70";
import { isPending } from "@/lib/pending";
import { ciclarColor, ciclarEq, linkCompartir, setSeleccion, useSeleccion } from "@/lib/selection";
import { track } from "@/lib/analytics";
import { blip, haptic, setSound, soundEnabled } from "@/lib/ui-sound";
import { Missing } from "@/components/ui/Missing";
import { IconShare, IconSound, IconSoundOff, IconChevron, IconClose } from "@/components/ui/Icons";
import { Stage, type StageHandle } from "./Stage";

const pad = (n: number) => String(n).padStart(2, "0");

/** Alto de la barra de contactos fija (--bar-h), para que el scroll no deje nada debajo. */
const barra = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar-h")) || 0;

/**
 * Lleva a una sección (debajo de la barra fija) con el desplazamiento nativo del
 * navegador; si la página cambió de alto en el camino, corrige al llegar.
 */
export function irA(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const offset = -barra();
  const fuera = () => Math.abs(target.getBoundingClientRect().top + offset) > 2;
  const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const go = () => window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top + offset, behavior: smooth ? "smooth" : "auto" });
  go();
  if (smooth) setTimeout(() => fuera() && go(), 1200);
}

const usd = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
/** Precio con el formato de los flyers: "U$D 16.500.-". */
export const precioFlyer = (n: number) => `U$D ${usd.format(n)}.-`;
const nombre = (e: Equipamiento) => (isPending(e.nombre) ? nombreEq(e.n) : e.nombre);
const coloresPendientes = colores.some((c) => isPending(c.nombre) || isPending(c.hex));

/**
 * "Armá tu P70": el camper girando en un estudio claro (como los renders de los
 * flyers), los 3 niveles pegados abajo del camper y los colores debajo.
 * Pocas palabras: el nombre del nivel, su precio y lo que incluye.
 * Desktop: el detalle del nivel a la izquierda. Mobile: el detalle en una hoja
 * inferior y el CTA en una barra fija.
 */
export function Selector() {
  const sel = useSeleccion();
  const stage = useRef<StageHandle>(null);
  const section = useRef<HTMLElement>(null);
  const [scanKey, setScanKey] = useState(0);
  const [sound, setSoundState] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const eq = equipamientos.find((e) => e.n === sel.eq) ?? equipamientos[0];

  useEffect(() => setSoundState(soundEnabled()), []);

  // Barra fija de mobile: solo mientras el selector está en pantalla.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(e.intersectionRatio > 0.35), { threshold: [0, 0.35, 0.6] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const elegir = useCallback(
    (next: { eq?: number; color?: string }, via: "click" | "teclado" | "swipe" = "click") => {
      const eqN = next.eq ?? sel.eq;
      const colorId = next.color ?? sel.color;
      if (eqN === sel.eq && colorId === sel.color) return;
      stage.current?.markClick();
      setSeleccion({ eq: eqN, color: colorId });
      setScanKey((k) => k + 1);
      blip("select");
      if (via !== "teclado") haptic();
      if (next.eq !== undefined && next.eq !== sel.eq) track("select_equipment", { equipamiento: eqN, via });
      if (next.color !== undefined && next.color !== sel.color) track("select_color", { color: colorId, via });
    },
    [sel.eq, sel.color],
  );

  // Teclado: ← → nivel, ↑ ↓ color (con el foco dentro del selector).
  const onKeyDown = (e: React.KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, select, [role=dialog]")) return;
    const map: Record<string, () => void> = {
      ArrowRight: () => elegir({ eq: ciclarEq(sel.eq, 1) }, "teclado"),
      ArrowLeft: () => elegir({ eq: ciclarEq(sel.eq, -1) }, "teclado"),
      ArrowDown: () => elegir({ color: ciclarColor(sel.color, 1) }, "teclado"),
      ArrowUp: () => elegir({ color: ciclarColor(sel.color, -1) }, "teclado"),
    };
    const fn = map[e.key];
    if (!fn) return;
    e.preventDefault();
    fn();
    // El foco acompaña a la opción elegida (patrón radiogroup).
    requestAnimationFrame(() => {
      const group = e.key === "ArrowLeft" || e.key === "ArrowRight" ? "eq" : "color";
      if (t.closest(`[data-group=${group}]`)) section.current?.querySelector<HTMLElement>(`[data-group=${group}] [aria-checked=true]`)?.focus();
    });
  };

  // Deslizar sobre el camper cambia de nivel.
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.4 && performance.now() - s.t < 700) {
      elegir({ eq: ciclarEq(sel.eq, dx < 0 ? 1 : -1) }, "swipe");
    }
  };

  const quieroAsi = () => {
    blip("confirm");
    track("click_quiero_asi", { equipamiento: sel.eq, color: sel.color });
    setSheet(false);
    irA("cotizar");
  };

  const compartir = async () => {
    const url = linkCompartir(sel);
    track("share_config", { equipamiento: sel.eq, color: sel.color });
    const text = `Mirá mi P70: ${nombreEq(sel.eq)} en ${nombreColor(sel.color)}`;
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: "Mi P70 · AndyCampers", text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast("Link copiado. Pegalo donde quieras.");
    } catch {
      setToast(url);
    }
    setTimeout(() => setToast(null), 3200);
  };

  const toggleSound = () => {
    const on = !sound;
    setSound(on);
    setSoundState(on);
  };

  const prime = (e: number, c: string) => stage.current?.prime(e, c);

  return (
    <section
      ref={section}
      id="armalo"
      aria-labelledby="armalo-title"
      onKeyDown={onKeyDown}
      className="garage-cut relative isolate flex h-[calc(100svh-var(--bar-h))] min-h-[620px] flex-col overflow-hidden bg-estudio text-ink lg:min-h-[700px]"
    >
      {/* Piso del estudio: grilla en perspectiva, como el de los renders de los flyers */}
      <div aria-hidden className="pointer-events-none absolute inset-x-[-30%] top-[54%] bottom-[-40%] -z-10 garage-floor" />

      {/* Encabezado: el bloque de los flyers y, chico, cuántos niveles hay */}
      <div className="relative z-10 flex items-start justify-between gap-3 pt-6 pr-2 pl-4 sm:pl-6 lg:pt-8 lg:pr-8 lg:pl-10">
        <div>
          <h2 id="armalo-title" className="slab font-display-x text-[1.55rem] uppercase lg:text-[2.2rem]">
            Armá tu P70
          </h2>
          <p className="titulo-cond mt-2 text-[1.05rem] text-stone lg:text-[1.3rem]">({equipamientos.length} niveles de equipamiento)</p>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? "Apagar sonidos" : "Activar sonidos"}
            className="grid size-11 place-items-center text-stone transition-colors hover:text-ink"
          >
            {sound ? <IconSound className="size-5" /> : <IconSoundOff className="size-5" />}
          </button>
          <button type="button" onClick={compartir} aria-label="Compartir mi P70" className="grid size-11 place-items-center text-stone transition-colors hover:text-ink lg:hidden">
            <IconShare className="size-5" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(270px,310px)_1fr] lg:gap-10 lg:px-10 lg:pb-7">
        {/* Detalle del nivel (desktop) */}
        <aside className="relative z-10 hidden min-h-0 flex-col justify-center lg:flex" aria-label="Detalle del nivel">
          <div className="min-h-0 overflow-y-auto pr-2">
            <Detalle eq={eq} />
          </div>
          <Ctas onQuiero={quieroAsi} onShare={compartir} />
        </aside>

        {/* El camper, y pegados abajo los niveles y los colores */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            className="stage min-h-0 flex-1 touch-pan-y select-none"
            style={{ "--piso": videoSelector.pisoY, "--base": videoSelector.pedestal.frente + 0.04 } as React.CSSProperties}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipe.current = null)}
          >
            <Stage ref={stage} eq={sel.eq} color={sel.color} scanKey={scanKey} label={`${nombreEq(sel.eq)}, ${nombreColor(sel.color)}`} />
          </div>

          <Niveles active={sel.eq} onPick={(n) => elegir({ eq: n })} onPrime={(n) => prime(n, sel.color)} />
          <Colores active={sel.color} onPick={(c) => elegir({ color: c })} onPrime={(c) => prime(sel.eq, c)} />
        </div>
      </div>

      {/* Barra fija inferior (mobile): el nivel, su precio y el CTA */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white px-4 pt-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-18px_rgb(22_24_27/0.5)] transition-transform duration-500 ease-[var(--ease-out-expo)] sm:px-6 lg:hidden ${
          barVisible ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
        aria-hidden={!barVisible}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSheet(true)}
            tabIndex={barVisible ? 0 : -1}
            aria-haspopup="dialog"
            className="flex min-h-12 min-w-0 flex-1 flex-col items-start justify-center gap-0.5 text-left"
          >
            <span className="flex max-w-full items-center gap-2">
              <span className="font-cond text-[1.05rem] leading-none font-semibold uppercase">{nombre(eq)}</span>
              {isPending(eq.precio) ? (
                <Missing label={eq.precio} compact short="precio" />
              ) : (
                <span className="tabular font-cond text-[1.05rem] leading-none font-light">{precioFlyer(eq.precio)}</span>
              )}
            </span>
            <span className="flex items-center gap-1 text-sm text-stone">
              Qué incluye <IconChevron className="size-4 rotate-180" />
            </span>
          </button>
          <button
            type="button"
            onClick={quieroAsi}
            tabIndex={barVisible ? 0 : -1}
            className="inline-flex min-h-12 items-center bg-forest px-5 font-semibold text-white transition-colors hover:bg-forest-deep active:scale-[0.98]"
          >
            Lo quiero así
          </button>
        </div>
      </div>

      {sheet && createPortal(<Sheet eq={eq} onClose={() => setSheet(false)} onQuiero={quieroAsi} onShare={compartir} />, document.body)}

      {toast && (
        <p role="status" className="fixed top-[calc(var(--bar-h)+1rem)] left-1/2 z-[60] max-w-[92vw] -translate-x-1/2 truncate bg-ink px-4 py-3 text-sm font-semibold text-bone shadow-[0_8px_24px_-12px_rgb(0_0_0/0.6)]">
          {toast}
        </p>
      )}
    </section>
  );
}

/* ───────────────────────── Niveles (pegados al camper) ───────────────────────── */

function Niveles({ active, onPick, onPrime }: { active: number; onPick: (n: number) => void; onPrime: (n: number) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Nivel de equipamiento"
      data-group="eq"
      className="relative z-10 mx-auto grid w-full max-w-[36rem] gap-2 px-5 pt-1 sm:px-6 lg:px-3"
      style={{ gridTemplateColumns: `repeat(${equipamientos.length}, minmax(0, 1fr))` }}
    >
      {equipamientos.map((e) => {
        const on = e.n === active;
        return (
          <button
            key={e.n}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onPick(e.n)}
            onPointerEnter={(ev) => ev.pointerType === "mouse" && onPrime(e.n)}
            onPointerDown={() => onPrime(e.n)}
            onFocus={() => onPrime(e.n)}
            className={`min-h-12 -skew-x-12 transition-[background-color,color,box-shadow] duration-200 lg:min-h-[3.25rem] ${
              on ? "bg-forest text-white shadow-[0_8px_18px_-10px_rgb(31_63_59/0.9)]" : "bg-white/85 text-ink ring-1 ring-ink/12 hover:ring-forest"
            }`}
          >
            <span className="block skew-x-12 font-cond text-[1.02rem] font-semibold uppercase [font-kerning:normal] lg:text-[1.15rem]">{nombre(e)}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Detalle del nivel ───────────────────────── */

function Detalle({ eq }: { eq: Equipamiento }) {
  return (
    <div key={eq.n} className="fade-up">
      <p className="font-cond text-[2.6rem] leading-none font-semibold text-forest uppercase">{nombre(eq)}</p>
      <div className="mt-2">
        {isPending(eq.precio) ? (
          <Missing label={eq.precio} compact short="precio" />
        ) : (
          <p className="tabular font-cond text-[2rem] leading-none font-light">{precioFlyer(eq.precio)}</p>
        )}
      </div>
      <div className="mt-5 text-ink/80">{isPending(eq.descripcion) ? <Missing label={eq.descripcion} compact short="descripción" /> : <p>{eq.descripcion}</p>}</div>
      <Incluye eq={eq} className="mt-5" />
    </div>
  );
}

function Incluye({ eq, className = "" }: { eq: Equipamiento; className?: string }) {
  return (
    <div className={className}>
      <p className="font-cond text-[1.15rem] font-semibold text-forest uppercase">Incluye</p>
      {isPending(eq.incluye) ? (
        <Missing label={eq.incluye} compact short="qué incluye" className="mt-1.5" />
      ) : (
        <ul className="mt-1.5 space-y-1.5">
          {eq.incluye.map((it) => (
            <li key={it} className="text-[0.98rem] leading-snug">
              {it}
            </li>
          ))}
        </ul>
      )}
      {eq.stats && equipamientos.every((e) => e.stats) && <Stats stats={eq.stats} />}
    </div>
  );
}

function Stats({ stats }: { stats: NonNullable<Equipamiento["stats"]> }) {
  const rows = [
    ["Autonomía", stats.autonomia],
    ["Confort", stats.confort],
    ["Off-road", stats.offroad],
  ] as const;
  return (
    <dl className="mt-6 space-y-3">
      {rows.map(([k, v]) => (
        <div key={k}>
          <div className="flex justify-between font-cond text-sm font-semibold uppercase">
            <dt>{k}</dt>
            <dd className="tabular">{v}</dd>
          </div>
          <div className="mt-1 h-1.5 bg-ink/10">
            <div className="h-full origin-left bg-forest transition-transform duration-700 ease-[var(--ease-out-expo)]" style={{ transform: `scaleX(${v / 100})` }} />
          </div>
        </div>
      ))}
    </dl>
  );
}

function Ctas({ onQuiero, onShare }: { onQuiero: () => void; onShare: () => void }) {
  return (
    <div className="mt-7 flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onQuiero}
        className="inline-flex min-h-14 w-full items-center justify-center bg-forest px-6 text-lg font-semibold text-white transition-colors hover:bg-forest-deep"
      >
        Lo quiero así
      </button>
      <button type="button" onClick={onShare} className="inline-flex min-h-11 items-center gap-2.5 px-1 font-semibold text-ink/75 transition-colors hover:text-ink">
        <IconShare className="size-5" /> Compartir mi P70
      </button>
    </div>
  );
}

/* ───────────────────────── Colores ───────────────────────── */

function Colores({ active, onPick, onPrime }: { active: string; onPick: (id: string) => void; onPrime: (id: string) => void }) {
  return (
    <div className="relative z-10 flex items-center justify-center gap-3 px-4 pt-3 pb-[5.75rem] sm:gap-5 sm:px-6 lg:pt-4 lg:pb-0">
      <span className="pestana hidden font-cond text-[0.95rem] font-semibold uppercase sm:inline-block" id="color-label">
        Elegí tu color
      </span>
      <div role="radiogroup" aria-labelledby="color-label" data-group="color" className="flex items-center gap-1 sm:gap-2">
        {colores.map((c, i) => {
          const on = c.id === active;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => onPick(c.id)}
              onPointerEnter={(ev) => ev.pointerType === "mouse" && onPrime(c.id)}
              onPointerDown={() => onPrime(c.id)}
              onFocus={() => onPrime(c.id)}
              aria-label={`Color ${pad(i + 1)}${isPending(c.nombre) ? "" : `: ${c.nombre}`}`}
              title={isPending(c.nombre) ? `Color ${pad(i + 1)}` : c.nombre}
              className="group grid size-11 place-items-center lg:size-12"
            >
              <span className={`relative grid size-full place-items-center rounded-full transition-transform duration-300 ease-[var(--ease-out-expo)] ${on ? "scale-100" : "scale-[0.78] group-hover:scale-[0.86]"}`}>
                <span aria-hidden className={`absolute inset-0 rounded-full ring-2 transition-colors ${on ? "ring-forest" : "ring-transparent"}`} />
                <span aria-hidden className="size-[74%] rounded-full shadow-[inset_0_-5px_9px_rgb(0_0_0/0.28),inset_0_3px_6px_rgb(255_255_255/0.3),0_2px_6px_-2px_rgb(0_0_0/0.35)]" style={{ background: hexColor(c) }} />
              </span>
            </button>
          );
        })}
      </div>
      {coloresPendientes && <Missing label="nombre y código de los 5 colores" compact short="nombres" />}
    </div>
  );
}

/* ───────────────────────── Hoja inferior (mobile) ───────────────────────── */

function Sheet({ eq, onClose, onQuiero, onShare }: { eq: Equipamiento; onClose: () => void; onQuiero: () => void; onShare: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const close = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };
  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button type="button" aria-label="Cerrar" tabIndex={-1} onClick={close} className={`absolute inset-0 bg-ink/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`Qué incluye ${nombre(eq)}`}
        tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 max-h-[80svh] overflow-y-auto bg-paper px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-ink transition-transform duration-300 ease-[var(--ease-out-expo)] outline-none sm:px-6 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/15" aria-hidden />
        <button type="button" onClick={close} aria-label="Cerrar" className="absolute top-2 right-2 grid size-11 place-items-center text-stone hover:text-ink">
          <IconClose className="size-5" />
        </button>
        <Detalle eq={eq} />
        <Ctas onQuiero={onQuiero} onShare={onShare} />
      </div>
    </div>
  );
}
