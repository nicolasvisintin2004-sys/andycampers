"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { colores, equipamientos, hexColor, nombreColor, nombreEq, precioDesde, videoSelector, type Equipamiento } from "@/config/p70";
import { isPending } from "@/lib/pending";
import { ciclarColor, ciclarEq, linkCompartir, setSeleccion, useSeleccion } from "@/lib/selection";
import { track } from "@/lib/analytics";
import { blip, haptic, setSound, soundEnabled } from "@/lib/ui-sound";
import { Missing } from "@/components/ui/Missing";
import { IconArrow, IconShare, IconSound, IconSoundOff, IconChevron, IconClose } from "@/components/ui/Icons";
import { Stage, type StageHandle } from "./Stage";

const pad = (n: number) => String(n).padStart(2, "0");

/** Scroll suave a una sección; si la página cambió de alto en el camino, corrige al llegar. */
export function irA(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(target, {
      duration: 1.3,
      onComplete: () => Math.abs(target.getBoundingClientRect().top) > 2 && lenis.scrollTo(target, { duration: 0.35 }),
    });
    return;
  }
  const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  if (smooth) setTimeout(() => Math.abs(target.getBoundingClientRect().top) > 2 && target.scrollIntoView(), 1200);
}

const usd = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
const HINT_KEY = "p70:pista";

/**
 * "Armá tu P70": pantalla de selección tipo videojuego.
 * Mobile primero (375 px): pestañas arriba, colores en una columna fina a la
 * derecha, el camper al centro, "Qué incluye" en una hoja inferior y el CTA fijo.
 * Desktop: clases arriba, colores grandes a la derecha, panel a la izquierda.
 */
export function Selector() {
  const sel = useSeleccion();
  const stage = useRef<StageHandle>(null);
  const section = useRef<HTMLElement>(null);
  const [scanKey, setScanKey] = useState(0);
  const [sound, setSoundState] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const [hint, setHint] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const eqIdx = equipamientos.findIndex((e) => e.n === sel.eq);
  const colorIdx = colores.findIndex((c) => c.id === sel.color);
  const eq = equipamientos[eqIdx];

  useEffect(() => {
    setSoundState(soundEnabled());
    try {
      if (!localStorage.getItem(HINT_KEY)) setHint(true);
    } catch {}
  }, []);

  // Barra fija de mobile: solo mientras el selector está en pantalla.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(e.intersectionRatio > 0.35), { threshold: [0, 0.35, 0.6] });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const mobile = matchMedia("(max-width: 1023px)").matches;
    document.documentElement.style.setProperty("--wa-offset", barVisible && mobile ? "76px" : "0px");
  }, [barVisible]);

  const interacted = useCallback(() => {
    if (!hint) return;
    setHint(false);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {}
  }, [hint]);

  const elegir = useCallback(
    (next: { eq?: number; color?: string }, via: "click" | "teclado" | "swipe" = "click") => {
      const eqN = next.eq ?? sel.eq;
      const colorId = next.color ?? sel.color;
      if (eqN === sel.eq && colorId === sel.color) return;
      stage.current?.markClick();
      setSeleccion({ eq: eqN, color: colorId });
      setScanKey((k) => k + 1);
      interacted();
      blip("select");
      if (via !== "teclado") haptic();
      if (next.eq !== undefined && next.eq !== sel.eq) track("select_equipment", { equipamiento: eqN, via });
      if (next.color !== undefined && next.color !== sel.color) track("select_color", { color: colorId, via });
    },
    [sel.eq, sel.color, interacted],
  );

  // Teclado: ← → equipamiento, ↑ ↓ color (con el foco dentro del selector).
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

  // Deslizar sobre el camper cambia de equipamiento.
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
      className="garage-cut relative isolate flex h-[100svh] min-h-[640px] flex-col overflow-hidden bg-garage text-bone lg:min-h-[760px]"
    >
      {/* Ambiente del garage: grilla de piso, viñeta y cono de luz */}
      <div aria-hidden className="pointer-events-none absolute inset-x-[-30%] top-[58%] bottom-[-40%] -z-10 garage-floor" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,transparent_40%,rgb(10_11_13/0.75)_100%)]" />

      {/* Cabecera HUD */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 pt-4 sm:px-6 lg:px-10 lg:pt-6">
        <div className="flex items-baseline gap-3">
          <h2 id="armalo-title" className="font-display-x text-[1.35rem] uppercase lg:text-[1.9rem]">
            Armá tu P70
          </h2>
          <span className="hidden font-mono text-[0.68rem] tracking-[0.18em] text-mist uppercase xl:inline">Acero 100% · exclusivo para camionetas</span>
        </div>
        {hint && <Hint className="mr-auto ml-4 hidden lg:flex" />}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? "Apagar sonidos" : "Activar sonidos"}
            className="grid size-11 place-items-center text-mist transition-colors hover:text-bone"
          >
            {sound ? <IconSound className="size-5" /> : <IconSoundOff className="size-5" />}
          </button>
          <button type="button" onClick={compartir} aria-label="Compartir mi P70" className="grid size-11 place-items-center text-mist transition-colors hover:text-bone lg:hidden">
            <IconShare className="size-5" />
          </button>
        </div>
      </div>

      {/* Equipamientos: pestañas (mobile) / clases (desktop) */}
      <EqTabs active={sel.eq} onPick={(n) => elegir({ eq: n })} onPrime={(n) => prime(n, sel.color)} />

      <div className="relative flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(300px,340px)_1fr_minmax(150px,180px)] lg:gap-6 lg:px-10 lg:pb-8">
        {/* Nombre + contador (mobile arriba del camper; desktop en el panel) */}
        <div className="relative z-10 flex items-end justify-between gap-3 px-4 pt-3 sm:px-6 lg:hidden">
          <EqName eq={eq} count={`${pad(eqIdx + 1)} / ${pad(equipamientos.length)}`} />
          <ActiveColorName active={sel.color} />
        </div>

        {/* Panel izquierdo (desktop) */}
        <aside className="relative z-10 hidden flex-col pt-6 lg:flex" aria-label="Detalle del equipamiento">
          <EqName eq={eq} count={`${pad(eqIdx + 1)} / ${pad(equipamientos.length)}`} large />
          <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-2">
            <Includes eq={eq} />
          </div>
          <PriceCtas onQuiero={quieroAsi} onShare={compartir} />
        </aside>

        {/* Escenario */}
        <div
          className="stage min-h-0 flex-1 touch-pan-y select-none"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipe.current = null)}
        >
          <Stage
            ref={stage}
            eq={sel.eq}
            color={sel.color}
            scanKey={scanKey}
            label={`${nombreEq(sel.eq)}, ${nombreColor(sel.color)}`}
          />
          <div aria-hidden className="garage-cone pointer-events-none absolute inset-0 z-[6]" />
          {hint && <Hint className="absolute top-3 left-4 z-[7] flex sm:left-6 lg:hidden" />}
          {videoSelector.sonDemo && (
            <div className="absolute bottom-2 left-4 z-[7] max-w-[60%] sm:left-6 lg:left-0">
              <Missing label="los 16 renders 3D del P70 girando (estos videos son DEMO)" compact short="Videos demo" />
            </div>
          )}
        </div>

        {/* Colores: columna fina sobre el borde derecho (mobile) / muestras grandes (desktop) */}
        <ColorRail active={sel.color} onPick={(c) => elegir({ color: c })} onPrime={(c) => prime(sel.eq, c)} />
      </div>

      {/* Barra fija inferior (mobile) */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-transform duration-500 ease-[var(--ease-out-expo)] sm:px-6 lg:hidden ${
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
            className="flex min-h-12 flex-1 flex-col items-start justify-center text-left"
          >
            <span className="tabular font-mono text-[0.7rem] tracking-[0.12em] text-mist uppercase">Desde USD {usd.format(precioDesde)}</span>
            <span className="flex items-center gap-1 text-sm font-semibold">
              Qué incluye <IconChevron className="size-4 rotate-180" />
            </span>
          </button>
          <button
            type="button"
            onClick={quieroAsi}
            tabIndex={barVisible ? 0 : -1}
            className="inline-flex min-h-12 items-center gap-2 bg-orange-cta px-5 font-semibold text-ink active:scale-[0.98]"
          >
            Lo quiero así <IconArrow className="size-5" />
          </button>
        </div>
      </div>

      {sheet && createPortal(<Sheet eq={eq} onClose={() => setSheet(false)} onQuiero={quieroAsi} onShare={compartir} />, document.body)}

      {toast && (
        <p role="status" className="fixed top-[calc(var(--demo-h)+1rem)] left-1/2 z-[60] max-w-[92vw] -translate-x-1/2 truncate bg-bone px-4 py-3 text-sm font-semibold text-ink shadow-[0_8px_24px_-12px_rgb(0_0_0/0.6)]">
          {toast}
        </p>
      )}
    </section>
  );
}

/* ───────────────────────── Equipamientos ───────────────────────── */

function EqTabs({ active, onPick, onPrime }: { active: number; onPick: (n: number) => void; onPrime: (n: number) => void }) {
  const idx = equipamientos.findIndex((e) => e.n === active);
  return (
    <div className="relative z-10 mt-2 px-4 sm:px-6 lg:mt-5 lg:px-10">
      <div role="radiogroup" aria-label="Equipamiento" data-group="eq" className="relative grid grid-cols-4 border-b border-line">
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
              aria-label={`Equipamiento ${pad(e.n)}${isPending(e.nombre) ? "" : `: ${e.nombre}`}`}
              className={`group relative flex min-h-14 flex-col items-start gap-1 px-1.5 pt-1 pb-3 text-left transition-colors sm:px-3 lg:min-h-[92px] lg:px-4 lg:pt-3 ${
                on ? "text-bone" : "text-mist hover:text-bone"
              }`}
            >
              <span className={`tabular font-mono text-xs tracking-[0.14em] lg:text-[0.8rem] ${on ? "text-orange-glow" : ""}`}>{pad(e.n)}</span>
              {/* Nombre corto (mobile) / nombre + descripción (desktop) */}
              <span className="max-w-full lg:hidden">
                {isPending(e.nombreCorto) ? <Missing label={e.nombreCorto} compact short="nombre" /> : <span className="text-sm font-semibold">{e.nombreCorto}</span>}
              </span>
              <span className="hidden max-w-full lg:block">
                {isPending(e.nombre) ? (
                  <span className="font-display-x text-lg uppercase">Equipamiento {pad(e.n)}</span>
                ) : (
                  <span className="font-display-x text-lg uppercase">{e.nombre}</span>
                )}
              </span>
              <span className="hidden max-w-full text-[0.82rem] leading-snug text-bone/70 lg:block">
                {isPending(e.descripcion) ? <Missing label={e.descripcion} compact short="descripción" /> : e.descripcion}
              </span>
            </button>
          );
        })}
        {/* Indicador que se desliza entre opciones */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-[-1px] left-0 h-[3px] w-1/4 bg-orange transition-transform duration-500 ease-[var(--ease-out-expo)]"
          style={{ transform: `translateX(${idx * 100}%) skewX(-24deg)` }}
        />
      </div>
    </div>
  );
}

function EqName({ eq, count, large = false }: { eq: Equipamiento; count: string; large?: boolean }) {
  const name = isPending(eq.nombre) ? `Equipamiento ${pad(eq.n)}` : eq.nombre;
  let l = 0;
  return (
    <div>
      <p className="tabular font-mono text-xs tracking-[0.14em] text-mist">
        <span className="text-orange-glow">{count.slice(0, 2)}</span>
        {count.slice(2)}
      </p>
      <p key={name} aria-hidden className={`letter-in font-display-x mt-1 uppercase ${large ? "text-[clamp(1.7rem,2.2vw,2.4rem)]" : "text-[clamp(1.35rem,6.4vw,1.75rem)]"}`}>
        {name.split(" ").map((w, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            {[...w].map((ch) => (
              <span key={l} style={{ "--l": l++ } as React.CSSProperties}>
                {ch}
              </span>
            ))}
            {wi < name.split(" ").length - 1 && <span style={{ "--l": l++ } as React.CSSProperties}> </span>}
          </span>
        ))}
      </p>
      {isPending(eq.nombre) && (
        <div className="mt-2">
          <Missing label={eq.nombre} compact={!large} short="nombre del equipamiento" />
        </div>
      )}
      {large && <p className="mt-3 text-bone/80">{isPending(eq.descripcion) ? <Missing label={eq.descripcion} /> : eq.descripcion}</p>}
    </div>
  );
}

function Includes({ eq }: { eq: Equipamiento }) {
  return (
    <div key={eq.n} className="fade-up">
      <p className="eyebrow text-mist">Qué incluye</p>
      {isPending(eq.incluye) ? (
        <div className="mt-3">
          <Missing label={eq.incluye} block />
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {eq.incluye.map((it) => (
            <li key={it} className="flex gap-3 py-2.5 text-[0.95rem]">
              <span aria-hidden className="mt-[0.55em] h-[2px] w-3 shrink-0 bg-orange" />
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
          <div className="flex justify-between font-mono text-[0.7rem] tracking-[0.14em] text-mist uppercase">
            <dt>{k}</dt>
            <dd className="tabular">{v}</dd>
          </div>
          <div className="mt-1 h-1.5 bg-line">
            <div className="h-full origin-left bg-orange transition-transform duration-700 ease-[var(--ease-out-expo)]" style={{ transform: `scaleX(${v / 100})` }} />
          </div>
        </div>
      ))}
    </dl>
  );
}

function PriceCtas({ onQuiero, onShare }: { onQuiero: () => void; onShare: () => void }) {
  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="tabular font-mono text-[0.72rem] tracking-[0.14em] text-mist uppercase">Precio base</p>
      <p className="font-display-x mt-1 text-[clamp(1.5rem,1.9vw,1.85rem)] uppercase">
        Desde <span className="tabular">USD {usd.format(precioDesde)}</span>
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={onQuiero}
          className="group inline-flex min-h-14 items-center justify-between gap-3 bg-orange-cta px-6 text-lg font-semibold text-ink transition-colors hover:bg-[#f47b52]"
        >
          Lo quiero así <IconArrow className="size-5 transition-transform group-hover:translate-x-1" />
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex min-h-12 items-center gap-3 px-1 font-semibold text-bone/85 transition-colors hover:text-bone"
        >
          <IconShare className="size-5" /> Compartir mi P70
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Colores ───────────────────────── */

function ColorRail({ active, onPick, onPrime }: { active: string; onPick: (id: string) => void; onPrime: (id: string) => void }) {
  return (
    <div className="pointer-events-none absolute top-[6rem] right-2 z-10 sm:right-4 lg:pointer-events-auto lg:static lg:flex lg:flex-col lg:justify-center">
      <p className="eyebrow mb-4 hidden text-mist lg:block" id="color-label">
        Color
      </p>
      <div role="radiogroup" aria-label="Color" data-group="color" className="pointer-events-auto flex flex-col gap-0.5 lg:gap-3">
        {colores.map((c, i) => {
          const on = c.id === active;
          const pending = isPending(c.nombre) || isPending(c.hex);
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
              className="group flex min-h-11 items-center justify-end gap-3 lg:justify-start lg:py-1"
            >
              <span
                className={`relative grid size-11 shrink-0 place-items-center rounded-full transition-transform duration-300 ease-[var(--ease-out-expo)] lg:size-14 ${on ? "scale-100" : "scale-[0.82] group-hover:scale-90"}`}
              >
                <span aria-hidden className={`absolute inset-0 rounded-full ring-2 transition-colors ${on ? "ring-bone" : "ring-transparent"}`} />
                <span aria-hidden className="size-[72%] rounded-full shadow-[inset_0_-6px_10px_rgb(0_0_0/0.35),inset_0_3px_6px_rgb(255_255_255/0.25)]" style={{ background: hexColor(c) }} />
                {on && <span aria-hidden className="absolute -inset-1.5 rounded-full border border-dashed border-orange-glow/70 motion-safe:animate-[spin_9s_linear_infinite]" />}
              </span>
              <span className="hidden min-w-0 text-left lg:block">
                <span className="tabular block font-mono text-[0.68rem] tracking-[0.14em] text-mist">{pad(i + 1)}</span>
                {isPending(c.nombre) ? <span className="block font-semibold">Color {pad(i + 1)}</span> : <span className="block font-semibold">{c.nombre}</span>}
                {pending && <Missing label={`nombre y hex del color ${i + 1}`} compact short="nombre y hex" className="mt-1" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActiveColorName({ active }: { active: string }) {
  const i = colores.findIndex((c) => c.id === active);
  const c = colores[i];
  const pending = isPending(c.nombre) || isPending(c.hex);
  return (
    <div className="flex shrink-0 flex-col items-end gap-1 pb-0.5" aria-hidden>
      <span className="flex items-center gap-1.5 font-mono text-[0.66rem] tracking-[0.14em] text-mist uppercase">
        <span className="size-2.5 rounded-full" style={{ background: hexColor(c) }} />
        {isPending(c.nombre) ? `Color ${pad(i + 1)}` : c.nombre}
      </span>
      {pending && <Missing label={`nombre y hex del color ${i + 1}`} compact short="nombre/hex" />}
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
    window.__lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
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
      <button type="button" aria-label="Cerrar" tabIndex={-1} onClick={close} className={`absolute inset-0 bg-ink/60 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Qué incluye este equipamiento"
        tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 max-h-[78svh] overflow-y-auto bg-graphite px-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-bone transition-transform duration-300 ease-[var(--ease-out-expo)] outline-none sm:px-6 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-3 h-1 w-10 bg-line" aria-hidden />
        <div className="flex items-start justify-between gap-4">
          <EqName eq={eq} count={`${pad(eq.n)} / ${pad(equipamientos.length)}`} />
          <button type="button" onClick={close} aria-label="Cerrar" className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center text-mist hover:text-bone">
            <IconClose className="size-5" />
          </button>
        </div>
        <p className="mt-2 text-bone/80">{isPending(eq.descripcion) ? <Missing label={eq.descripcion} /> : eq.descripcion}</p>
        <div className="mt-5">
          <Includes eq={eq} />
        </div>
        <PriceCtas onQuiero={onQuiero} onShare={onShare} />
      </div>
    </div>
  );
}

/* ───────────────────────── Pista de primera visita ───────────────────────── */

function Hint({ className = "" }: { className?: string }) {
  return (
    <p aria-hidden className={`fade-up pointer-events-none min-w-0 items-center gap-2 bg-bone px-2.5 py-1.5 font-mono text-[0.66rem] font-semibold tracking-[0.1em] whitespace-nowrap text-ink uppercase sm:text-[0.68rem] ${className}`}>
      <span className="hint-nudge inline-block">⟷</span>
      <span className="lg:hidden">Tocá o deslizá para cambiar</span>
      <span className="hidden lg:inline">Elegí equipamiento y color · ← → ↑ ↓</span>
    </p>
  );
}

