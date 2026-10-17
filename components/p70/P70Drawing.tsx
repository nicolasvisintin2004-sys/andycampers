/**
 * Alzado lateral esquemático del P70 (plano técnico, no a escala).
 * Se dibuja a partir de las fotos del producto: enganche a la izquierda,
 * eje simple con rueda off-road y guardabarros facetado.
 * Las cotas reales todavía no existen → se muestran como cartel rojo "FALTA".
 */

export type DrawingTone = "blueprint" | "acero";

export interface Hotspot {
  id: string;
  n: string;
  x: number;
  y: number;
  /** Hacia dónde sale la línea de cota con la etiqueta. */
  dx: number;
  dy: number;
  /** Lado hacia el que sale la etiqueta (por defecto, el de dx). */
  side?: "left" | "right";
  titulo: string;
  dato: string;
  texto: string;
  /** viewBox para el zoom en mobile. */
  zoom: string;
}

export const hotspots: Hotspot[] = [
  {
    id: "chasis",
    n: "01",
    x: 470,
    y: 402,
    dx: -60,
    dy: 62,
    titulo: "Chasis vehicular",
    dato: "Corte láser",
    texto:
      "Chapa plegada con corte láser: no es caño ni perfiles de construcción. Es un chasis vehicular, homologado y con patente.",
    zoom: "100 300 600 240",
  },
  {
    id: "suspension",
    n: "02",
    x: 735,
    y: 470,
    dx: -150,
    dy: 50,
    titulo: "Suspensión Hard & Soft",
    dato: "165 km/h",
    texto:
      "Inteligente: responde suave en los pozos para cuidar el interior y le da estabilidad en ruta. Probada a 165 km/h.",
    zoom: "560 330 540 220",
  },
  {
    id: "frenos",
    n: "03",
    x: 780,
    y: 430,
    dx: 130,
    dy: 60,
    titulo: "Frenos eléctricos",
    dato: "Automáticos",
    texto: "Se accionan solos cuando pisás el freno de la camioneta. No tenés que hacer nada distinto al manejar.",
    zoom: "640 320 520 230",
  },
  {
    id: "aislamiento",
    n: "04",
    x: 880,
    y: 220,
    dx: 130,
    dy: -95,
    titulo: "Aislamiento térmico",
    dato: "80 mm",
    texto: "Las paredes de acero llevan 80 mm de aislamiento térmico y la pintura exterior es antirrayones.",
    zoom: "760 90 440 300",
  },
  {
    id: "portones",
    n: "05",
    x: 1000,
    y: 300,
    dx: 60,
    dy: -238,
    side: "left",
    titulo: "Dos portones traseros",
    dato: "Cocina + técnico",
    texto: "Uno abre la cocina, con mesada y alacenas iluminadas; el otro, el espacio técnico para herramientas y equipo.",
    zoom: "760 40 440 330",
  },
];

// Detalles repetitivos como un solo <path> cada uno (menos nodos en el DOM).
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const GROUND_TICKS = range(58).map((i) => `M${30 + i * 20} 500 L${20 + i * 20} 512`).join(" ");
const CHASSIS_HOLES = range(12).map((i) => `M${333 + i * 28} 396 h8 a3 3 0 0 1 0 6 h-8 a3 3 0 0 1 0 -6 Z`).join(" ");
const RACK_POSTS = range(10).map((i) => `M${450 + i * 56} 126 V134`).join(" ");
const INSULATION_HATCH = range(10).map((i) => `M868 ${186 + i * 11} L890 ${178 + i * 11}`).join(" ");

const palettes: Record<DrawingTone, { body: string; line: string; detail: string; tire: string; ground: string; hatch?: string }> = {
  blueprint: { body: "transparent", line: "#ece7df", detail: "rgb(236 231 223 / .45)", tire: "transparent", ground: "rgb(236 231 223 / .35)" },
  acero: { body: "#3a4046", line: "#ece7df", detail: "rgb(236 231 223 / .35)", tire: "#121417", ground: "rgb(236 231 223 / .35)" },
};

export function P70Drawing({
  tone = "blueprint",
  accent = "#e4572e",
  active,
  showHotspots = false,
  showDims = true,
  viewBox = "0 40 1200 520",
  className = "",
  title = "Esquema lateral del camper P70",
  idPrefix = "p70",
}: {
  tone?: DrawingTone;
  accent?: string;
  active?: string | null;
  showHotspots?: boolean;
  showDims?: boolean;
  viewBox?: string;
  className?: string;
  title?: string;
  idPrefix?: string;
}) {
  const p = palettes[tone];
  const hatchId = `${idPrefix}-hatch`;
  const bodyFill = p.hatch ? `url(#${hatchId})` : p.body;

  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label={title} fill="none" strokeLinejoin="round">
      <title>{title}</title>
      <defs>
        {p.hatch && (
          <pattern id={hatchId} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="10" height="10" fill={p.body} />
            <line x1="0" y1="0" x2="0" y2="10" stroke={p.hatch} strokeWidth="1.2" opacity=".35" />
          </pattern>
        )}
      </defs>

      {/* Suelo */}
      <line x1="20" y1="500" x2="1180" y2="500" stroke={p.ground} strokeWidth="1.5" />
      <path d={GROUND_TICKS} stroke={p.ground} strokeWidth="1" />

      {/* Lanza y enganche */}
      <path d="M300 396 L90 408 L90 418 L300 410 Z" fill={p.body === "transparent" ? "none" : "#1b1d20"} stroke={p.line} strokeWidth="2" />
      <rect x="48" y="404" width="44" height="18" rx="4" fill={p.body === "transparent" ? "none" : "#1b1d20"} stroke={p.line} strokeWidth="2" />
      {/* Rueda jockey / pata estabilizadora */}
      <rect x="145" y="360" width="12" height="110" stroke={p.line} strokeWidth="2" fill={p.body === "transparent" ? "none" : "#2a2e33"} />
      <circle cx="151" cy="484" r="15" stroke={p.line} strokeWidth="2" fill={p.tire} />

      {/* Baulera frontal */}
      <path d="M185 300 L280 300 L292 312 L292 394 L185 394 L176 384 L176 310 Z" fill={bodyFill} stroke={p.line} strokeWidth="2" />
      <line x1="185" y1="318" x2="282" y2="318" stroke={p.detail} strokeWidth="1.5" />

      {/* Rueda (atrás del cuerpo) */}
      <g>
        <circle cx="780" cy="430" r="70" fill={p.tire} stroke={p.line} strokeWidth="2.5" />
        <circle cx="780" cy="430" r="58" stroke={p.detail} strokeWidth="1.5" strokeDasharray="6 5" />
        <circle cx="780" cy="430" r="40" fill={p.tire === "transparent" ? "none" : "#0d0f11"} stroke={p.line} strokeWidth="2" />
        <circle cx="780" cy="430" r="36" stroke={accent} strokeWidth="6" />
        <circle cx="780" cy="430" r="10" stroke={p.line} strokeWidth="2" />
      </g>

      {/* Chasis */}
      <rect x="296" y="392" width="700" height="14" fill={p.body === "transparent" ? "none" : "#1b1d20"} stroke={p.line} strokeWidth="2" />
      <path d={CHASSIS_HOLES} stroke={p.detail} strokeWidth="1" />

      {/* Carrocería con arco de rueda */}
      <path
        d="M300 392 L300 205 L348 150 L470 134 L962 134 L1002 176 L1002 360 L978 392 L872 392 L854 346 L706 346 L688 392 Z"
        fill={bodyFill}
        stroke={p.line}
        strokeWidth="2.5"
      />
      {/* Guardabarros facetado */}
      <path d="M672 394 L696 330 L864 330 L892 394 L874 394 L852 346 L708 346 L690 394 Z" fill={p.body === "transparent" ? "none" : "#2b3035"} stroke={p.line} strokeWidth="2" />

      {/* Paneles y costuras */}
      <path d="M318 380 L318 214 L356 172 L590 160 L590 380" stroke={p.detail} strokeWidth="1.5" />
      <line x1="940" y1="150" x2="940" y2="384" stroke={p.detail} strokeWidth="1.5" />
      <rect x="626" y="168" width="58" height="104" stroke={p.line} strokeWidth="1.8" />
      <rect x="712" y="160" width="110" height="140" stroke={p.line} strokeWidth="1.8" />
      <rect x="806" y="172" width="10" height="16" fill={p.line} opacity=".7" />

      {/* Puerta lateral con ventana */}
      <path d="M432 172 L546 172 L562 188 L562 352 L546 366 L432 366 L416 352 L416 188 Z" stroke={p.line} strokeWidth="2" />
      <rect x="444" y="196" width="90" height="108" rx="16" fill={p.body === "transparent" ? "none" : "#15181b"} stroke={p.line} strokeWidth="2" />
      <line x1="452" y1="210" x2="526" y2="210" stroke={p.detail} strokeWidth="1" strokeDasharray="2 4" />
      <rect x="540" y="292" width="12" height="22" stroke={p.line} strokeWidth="1.5" />

      {/* Gráficas de color */}
      <path d="M346 378 L430 336 L560 336 L560 352 L438 352 L366 388 Z" fill={accent} />
      <path d="M604 304 L716 304 L704 326 L604 326 Z" fill={accent} />
      <text x="618" y="321" fill="#fff" fontFamily="var(--font-archivo), sans-serif" fontStyle="italic" fontWeight="900" fontSize="17">
        P70
      </text>
      <path d="M902 372 L986 336 L986 352 L914 384 Z" fill={accent} />

      {/* Luces traseras */}
      <rect x="1002" y="236" width="12" height="26" fill={p.body === "transparent" ? "none" : "#c0392b"} stroke={p.line} strokeWidth="1.5" />

      {/* Porta equipajes y toldo */}
      <line x1="430" y1="126" x2="968" y2="126" stroke={p.line} strokeWidth="2" />
      <path d={RACK_POSTS} stroke={p.line} strokeWidth="2" />
      <rect x="500" y="88" width="440" height="36" rx="16" fill={p.body === "transparent" ? "none" : "#1b1d20"} stroke={p.line} strokeWidth="2" />
      <rect x="870" y="96" width="52" height="12" fill={p.body === "transparent" ? "none" : "#ece7df"} stroke={p.line} strokeWidth="1" opacity=".8" />
      {/* Claraboya */}
      <path d="M372 140 L436 134 L436 146 L380 152 Z" stroke={p.line} strokeWidth="1.5" />

      {/* Corte de aislamiento (detalle 80 mm) */}
      <g opacity={active === "aislamiento" || showHotspots ? 1 : 0.5}>
        <rect x="868" y="178" width="22" height="120" fill="none" stroke={p.line} strokeWidth="1.2" strokeDasharray="3 3" />
        <path d={INSULATION_HATCH} stroke={p.detail} strokeWidth="1" />
      </g>

      {/* Cotas: las medidas reales están pendientes */}
      {showDims && (
        <g fontFamily="var(--font-jetbrains), monospace" fontSize="13">
          <line x1="300" y1="538" x2="1002" y2="538" stroke={p.detail} strokeWidth="1" />
          <line x1="300" y1="528" x2="300" y2="548" stroke={p.detail} />
          <line x1="1002" y1="528" x2="1002" y2="548" stroke={p.detail} />
          <path d="M300 538 l12 -5 v10 Z M1002 538 l-12 -5 v10 Z" fill={p.detail} />
          <rect x="560" y="527" width="190" height="22" fill="#e00000" />
          <text x="655" y="543" textAnchor="middle" fill="#fff" fontWeight="600">
            ⚠ FALTA: LARGO CAJA
          </text>

          <line x1="1080" y1="88" x2="1080" y2="500" stroke={p.detail} strokeWidth="1" />
          <line x1="1070" y1="88" x2="1090" y2="88" stroke={p.detail} />
          <line x1="1070" y1="500" x2="1090" y2="500" stroke={p.detail} />
          <path d="M1080 88 l-5 12 h10 Z M1080 500 l-5 -12 h10 Z" fill={p.detail} />
          <g transform="translate(1094 300) rotate(-90)">
            <rect x="-70" y="-15" width="140" height="22" fill="#e00000" />
            <text x="0" y="1" textAnchor="middle" fill="#fff" fontWeight="600">
              ⚠ FALTA: ALTO
            </text>
          </g>
        </g>
      )}

      {/* Hotspots */}
      {showHotspots &&
        hotspots.map((h) => {
          const on = active === h.id;
          const ex = h.x + h.dx;
          const ey = h.y + h.dy;
          const right = (h.side ?? (h.dx > 0 ? "right" : "left")) === "right";
          return (
            <g key={h.id} style={{ opacity: active && !on ? 0.35 : 1, transition: "opacity .5s" }}>
              <path
                d={`M${h.x} ${h.y} L${ex} ${ey} L${ex + (right ? 70 : -70)} ${ey}`}
                stroke={on ? accent : p.line}
                strokeWidth="1.5"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={on ? 0 : 1}
                style={{ transition: "stroke-dashoffset .8s cubic-bezier(.16,1,.3,1)" }}
              />
              {on && (
                <circle cx={h.x} cy={h.y} r="10" fill="none" stroke={accent} strokeWidth="2" style={{ transformOrigin: `${h.x}px ${h.y}px`, animation: "pulse-ring 1.6s ease-out infinite" }} />
              )}
              <circle cx={h.x} cy={h.y} r="7" fill={on ? accent : "#25282c"} stroke={on ? "#fff" : p.line} strokeWidth="2" />
              <text
                x={ex + (right ? 74 : -74)}
                y={ey + 5}
                textAnchor={right ? "start" : "end"}
                fill={on ? "#fff" : p.line}
                fontFamily="var(--font-jetbrains), monospace"
                fontSize="15"
                fontWeight="600"
                style={{ opacity: on ? 1 : 0, transition: "opacity .4s" }}
              >
                {h.n} · {h.dato.toUpperCase()}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
