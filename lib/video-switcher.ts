"use client";

import { colores, equipamientos, videoUrl, type Resolucion } from "@/config/p70";

/**
 * Motor de video del selector "Armá tu P70".
 *
 * Dos <video> apilados (A/B). Al cambiar de combinación se carga la nueva en el
 * de atrás, se lleva a la MISMA fracción del giro que la actual, se espera el
 * `seeked`, se reproduce y recién ahí se hace el fundido: el camper "cambia de
 * piel" sin saltar de ángulo.
 *
 * Precarga: los videos se bajan enteros a memoria (Blob) en tiempo ocioso, de a
 * uno, empezando por los "vecinos" de la combinación actual; al pasar el mouse
 * (o apoyar el dedo) sobre una opción, esa se prepara ya sincronizada en el
 * video de atrás, así el clic solo dispara el fundido.
 */

export type Key = `${number}:${string}`;
export const key = (eq: number, color: string): Key => `${eq}:${color}`;
const parse = (k: Key) => {
  const [eq, color] = k.split(":");
  return { eq: Number(eq), color };
};

type Prepared = HTMLVideoElement & { _key?: Key; _prep?: Promise<boolean> };

export interface SwitcherState {
  front: 0 | 1;
  /** La combinación pedida todavía no está lista (se muestra su poster). */
  loading: boolean;
  /** Alguno de los dos videos ya está mostrando cuadros. */
  started: boolean;
}

const once = (el: HTMLElement, ev: string, timeout = 8000) =>
  new Promise<boolean>((resolve) => {
    const done = (ok: boolean) => {
      el.removeEventListener(ev, onEv);
      el.removeEventListener("error", onErr);
      clearTimeout(t);
      resolve(ok);
    };
    const onEv = () => done(true);
    const onErr = () => done(false);
    const t = setTimeout(() => done(false), timeout);
    el.addEventListener(ev, onEv);
    el.addEventListener("error", onErr);
  });

/** Espera a que el video presente un cuadro nuevo (o un tick, si no hay rVFC). */
const nextFrame = (v: HTMLVideoElement) =>
  new Promise<void>((resolve) => {
    if ("requestVideoFrameCallback" in v) {
      const t = setTimeout(resolve, 120);
      v.requestVideoFrameCallback(() => {
        clearTimeout(t);
        resolve();
      });
    } else requestAnimationFrame(() => resolve());
  });

export class VideoSwitcher {
  private vids: [Prepared, Prepared];
  private front: 0 | 1 = 0;
  private current: Key | null = null;
  private showSeq = 0;
  private showing = false;
  private blobs = new Map<Key, Promise<string>>();
  private ready = new Map<Key, string>();
  private queue: Key[] = [];
  private draining = false;
  private active = false;
  private started = false;
  private loadingTimer = 0;
  private fadeTimer = 0;

  /** Reproducir automáticamente (false con prefers-reduced-motion hasta que se toque play). */
  allowPlay: boolean;
  /** Sin precarga (ahorro de datos / conexión lenta). */
  readonly noPreload: boolean;
  /** Última latencia clic → fundido, en ms (para medir el criterio de < 100 ms). */
  lastLatency = 0;

  constructor(
    a: HTMLVideoElement,
    b: HTMLVideoElement,
    private res: Resolucion,
    private ext: "mp4" | "webm",
    opts: { allowPlay: boolean; noPreload: boolean },
    private onState: (s: SwitcherState) => void,
  ) {
    this.vids = [a, b];
    this.allowPlay = opts.allowPlay;
    this.noPreload = opts.noPreload;
  }

  private url = (k: Key) => {
    const { eq, color } = parse(k);
    return videoUrl(eq, color, this.res, this.ext);
  };
  private emit(loading = false) {
    this.onState({ front: this.front, loading, started: this.started });
  }

  /* ───────────── Precarga (Blob en memoria) ───────────── */

  preload(k: Key) {
    if (this.noPreload || this.blobs.has(k)) return this.blobs.get(k);
    const p = fetch(this.url(k))
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      })
      .then((b) => {
        const u = URL.createObjectURL(b);
        this.ready.set(k, u);
        return u;
      })
      // Sin CORS en el CDN o sin red: se usa la URL directa (streaming).
      .catch(() => this.url(k));
    this.blobs.set(k, p);
    return p;
  }

  /** Vecinos: los otros colores del equipamiento actual y los otros equipamientos del color actual. */
  queueNeighbors(eq: number, color: string) {
    if (this.noPreload) return;
    const next: Key[] = [
      ...colores.filter((c) => c.id !== color).map((c) => key(eq, c.id)),
      ...equipamientos.filter((e) => e.n !== eq).map((e) => key(e.n, color)),
    ];
    this.queue = next.filter((k) => !this.blobs.has(k));
    this.drain();
  }

  private drain() {
    if (this.draining) return;
    const k = this.queue.shift();
    if (!k) return;
    this.draining = true;
    const idle = (cb: () => void) =>
      "requestIdleCallback" in window ? window.requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 300);
    idle(() => {
      Promise.resolve(this.preload(k)).finally(() => {
        this.draining = false;
        this.drain();
      });
    });
  }

  /* ───────────── Preparar un video: cargar, sincronizar, reproducir ───────────── */

  private frac() {
    const f = this.vids[this.front];
    return f.duration && this.started ? f.currentTime / f.duration : 0;
  }

  private prepare(el: Prepared, k: Key): Promise<boolean> {
    if (el._key === k && el._prep) return el._prep;
    el._key = k;
    el._prep = (async () => {
      el.src = this.ready.get(k) ?? this.url(k);
      el.load();
      if (el.readyState < 1 && !(await once(el, "loadedmetadata"))) return false;
      if (el._key !== k) return false;
      const corre = this.allowPlay && this.active;
      // En pausa: mismo cuadro exacto que el visible (sin adelanto) y búsqueda forzada,
      // así el video nuevo muestra ese cuadro y no queda en negro.
      await this.seekToFront(el, corre ? 0.05 : 0, !corre);
      if (el._key !== k) return false;
      if (corre) await el.play().catch(() => {});
      return true;
    })();
    return el._prep;
  }

  /** Lleva `el` a la misma fracción del giro que el video visible (+ adelanto por la demora del seek). */
  private async seekToFront(el: HTMLVideoElement, lead: number, force = false) {
    if (!el.duration) return;
    const t = (this.frac() * el.duration + lead) % el.duration;
    const drift = Math.abs(el.currentTime - t);
    if (!force && (drift < 1 / 20 || el.duration - drift < 1 / 20)) return;
    el.currentTime = t;
    await once(el, "seeked", 3000);
  }

  /** Hover / foco / dedo apoyado: deja esa combinación lista en el video de atrás. */
  prime(eq: number, color: string) {
    const k = key(eq, color);
    if (k === this.current || this.showing || !this.started) return;
    this.preload(k);
    void this.prepare(this.vids[1 - this.front], k);
  }

  /** Primera combinación: va directo al video de adelante (streaming, sin esperar la precarga). */
  init(eq: number, color: string) {
    const k = key(eq, color);
    this.current = k;
    const el = this.vids[this.front];
    el.addEventListener(
      "playing",
      () => {
        this.started = true;
        this.emit();
      },
      { once: true },
    );
    el._key = k;
    el._prep = Promise.resolve(true);
    el.src = this.url(k);
    el.load();
    if (this.allowPlay && this.active) el.play().catch(() => {});
  }

  async show(eq: number, color: string, t0 = performance.now()) {
    const k = key(eq, color);
    if (k === this.current) return;
    this.current = k;
    const seq = ++this.showSeq;
    this.showing = true;
    this.preload(k);
    clearTimeout(this.loadingTimer);

    // Antes de arrancar (o sin reproducción automática): solo se cambia la fuente.
    if (!this.started) {
      const el = this.vids[this.front];
      el._key = undefined;
      await this.prepare(el, k);
      this.showing = false;
      return;
    }

    const back = this.vids[1 - this.front];
    const primed = back._key === k;
    if (!primed || back.readyState < 2) this.loadingTimer = window.setTimeout(() => seq === this.showSeq && this.emit(true), 120);
    const ok = await this.prepare(back, k);
    if (seq !== this.showSeq) return;
    if (!ok) {
      this.showing = false;
      this.emit(false);
      return;
    }
    // El de atrás venía corriendo en paralelo (hover): solo se corrige si se desfasó.
    if (primed) await this.seekToFront(back, this.allowPlay && this.active ? 0.03 : 0);
    if (this.allowPlay && this.active && back.paused) await back.play().catch(() => {});
    if (this.allowPlay && this.active) await nextFrame(back);
    if (seq !== this.showSeq) return;

    clearTimeout(this.loadingTimer);
    const old = this.vids[this.front];
    this.front = (1 - this.front) as 0 | 1;
    this.lastLatency = Math.round(performance.now() - t0);
    this.showing = false;
    this.emit(false);
    if (process.env.NODE_ENV !== "production") console.debug(`[p70] ${k} · fundido a los ${this.lastLatency} ms ${primed ? "(precargado)" : ""}`);

    // Cuando terminó el fundido, el de atrás se pausa (queda listo para la próxima).
    clearTimeout(this.fadeTimer);
    this.fadeTimer = window.setTimeout(() => {
      if (this.vids[this.front] !== old) old.pause();
    }, 360);
  }

  /** Sección visible / no visible: se reproduce solo cuando se ve. */
  setActive(on: boolean) {
    this.active = on;
    const f = this.vids[this.front];
    if (on && this.allowPlay) f.play().catch(() => {});
    if (!on) this.vids.forEach((v) => v.pause());
  }

  /** Movimiento reducido: el usuario tocó play. */
  play() {
    this.allowPlay = true;
    this.vids[this.front].play().catch(() => {});
  }
  pause() {
    this.allowPlay = false;
    this.vids.forEach((v) => v.pause());
  }

  /** Fracción del giro (0–1) del video visible: la usa el pedestal para girar sus marcas. */
  angle() {
    return this.frac();
  }

  dispose() {
    clearTimeout(this.loadingTimer);
    clearTimeout(this.fadeTimer);
    this.vids.forEach((v) => {
      v.pause();
      v.removeAttribute("src");
      v.load();
    });
    this.ready.forEach((u) => URL.revokeObjectURL(u));
  }
}
