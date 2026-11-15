/**
 * Croquis del P70: el render de la "Versión acero 100%" de los flyers, redibujado
 * en vector (scripts/croquis-p70.mjs → croquis-svg.ts) para que se vea nítido,
 * con las cotas (largo y alto) y los puntos de las piezas clave. Sin textos al
 * lado de las líneas: Andrés (14/11) dice que no se llegan a leer; la info está
 * en los botones de abajo.
 */

import { CROQUIS_SVG } from "./croquis-svg";

export interface Hotspot {
  id: string;
  n: string;
  /** Punto sobre la imagen (coordenadas del viewBox). */
  x: number;
  y: number;
  /** Hacia dónde sale la línea. */
  dx: number;
  dy: number;
  titulo: string;
  dato: string;
  texto: string;
}

export const hotspots: Hotspot[] = [
  {
    id: "chasis",
    n: "01",
    x: 510,
    y: 455,
    dx: -70,
    dy: 80,
    titulo: "Chasis",
    dato: "Corte láser de precisión",
    texto:
      "Fabricado en chapa plegada con corte láser (no es caño ni perfil de construcción). Es un chasis vehicular con precisión láser, homologado y con patente.",
  },
  {
    id: "suspension",
    n: "02",
    x: 740,
    y: 430,
    dx: -50,
    dy: 105,
    titulo: "Suspensión Hard & Soft",
    dato: "Probado a 165 km/h",
    texto:
      "Inteligente: responde suave en los pozos para cuidar la carga del interior y le da estabilidad en ruta. Probado en ripio y a 165 km/h en autopista.",
  },
  {
    id: "frenos",
    n: "03",
    x: 845,
    y: 478,
    dx: 95,
    dy: 57,
    titulo: "Frenos eléctricos",
    dato: "Automático al pisar el freno",
    texto: "Se accionan automáticamente al pisar el freno de la camioneta.",
  },
  {
    id: "aislamiento",
    n: "04",
    x: 870,
    y: 240,
    dx: 70,
    dy: -150,
    titulo: "Aislamiento térmico",
    dato: "80 mm",
    texto: "Toda la carrocería de acero lleva 80 mm de aislamiento térmico y la pintura exterior es antirrayones.",
  },
  {
    id: "portones",
    n: "05",
    x: 955,
    y: 290,
    dx: 50,
    dy: 70,
    titulo: "Dos portones traseros",
    dato: "Cocina + técnico",
    texto: "Uno abre la cocina, con mesada y alacenas iluminadas; el otro, el espacio técnico para herramientas y equipo.",
  },
];

/** Dónde va la imagen dentro del viewBox, y sus bordes reales (para las cotas). */
/** El dibujo está en coordenadas 1200 × 720; acá se ubica dentro del viewBox. */
const DIBUJO = "translate(113 34) scale(0.75)";
const LARGO = { x1: 139, x2: 976, y: 612 };
const ALTO = { x: 1052, y1: 45, y2: 560 };
const SUELO = 560;

export function P70Drawing({
  // Durazno de los flyers: la pieza activa se lee sobre el bloque verde.
  accent = "#fbe3c7",
  line = "#ece7df",
  active,
  showHotspots = false,
  className = "",
  title = "Croquis del camper P70 versión acero, con sus medidas",
}: {
  accent?: string;
  line?: string;
  active?: string | null;
  showHotspots?: boolean;
  className?: string;
  title?: string;
}) {
  const detalle = "rgb(236 231 223 / .55)";
  return (
    <svg viewBox="100 20 1060 650" className={className} role="img" aria-label={title} fill="none" strokeLinejoin="round">
      <title>{title}</title>

      {/* Suelo */}
      <line x1="110" y1={SUELO} x2="1130" y2={SUELO} stroke="rgb(236 231 223 / .3)" strokeWidth="1.5" />

      {/* Contenido fijo generado por el script (no viene de usuarios) */}
      <g transform={DIBUJO} dangerouslySetInnerHTML={{ __html: CROQUIS_SVG }} />

      {/* Cotas: largo 4 m y alto 2 m (Andrés, 14/11) */}
      {/* En el celu el croquis se ve chico: las medidas van más grandes (en px del viewBox). */}
      <g fontFamily="var(--font-jetbrains), monospace" fontWeight="600" fill={line} className="text-[40px] sm:text-[26px]">
        <line x1={LARGO.x1} y1={LARGO.y} x2={LARGO.x2} y2={LARGO.y} stroke={detalle} strokeWidth="1.5" />
        <line x1={LARGO.x1} y1={LARGO.y - 12} x2={LARGO.x1} y2={LARGO.y + 12} stroke={detalle} strokeWidth="1.5" />
        <line x1={LARGO.x2} y1={LARGO.y - 12} x2={LARGO.x2} y2={LARGO.y + 12} stroke={detalle} strokeWidth="1.5" />
        <path d={`M${LARGO.x1} ${LARGO.y} l16 -6 v12 Z M${LARGO.x2} ${LARGO.y} l-16 -6 v12 Z`} fill={line} stroke="none" />
        <text x={(LARGO.x1 + LARGO.x2) / 2} y={LARGO.y + 44} textAnchor="middle">
          4 m
        </text>

        <line x1={ALTO.x} y1={ALTO.y1} x2={ALTO.x} y2={ALTO.y2} stroke={detalle} strokeWidth="1.5" />
        <line x1={ALTO.x - 12} y1={ALTO.y1} x2={ALTO.x + 12} y2={ALTO.y1} stroke={detalle} strokeWidth="1.5" />
        <line x1={ALTO.x - 12} y1={ALTO.y2} x2={ALTO.x + 12} y2={ALTO.y2} stroke={detalle} strokeWidth="1.5" />
        <path d={`M${ALTO.x} ${ALTO.y1} l-6 16 h12 Z M${ALTO.x} ${ALTO.y2} l-6 -16 h12 Z`} fill={line} stroke="none" />
        <text x={ALTO.x + 16} y={(ALTO.y1 + ALTO.y2) / 2 + 12}>
          2 m
        </text>
      </g>

      {/* Piezas clave: punto y línea, sin texto */}
      {showHotspots &&
        hotspots.map((h) => {
          const on = active === h.id;
          const ex = h.x + h.dx;
          const ey = h.y + h.dy;
          return (
            <g key={h.id} style={{ opacity: active && !on ? 0.4 : 1, transition: "opacity .5s" }}>
              <path
                d={`M${h.x} ${h.y} L${ex} ${ey} L${ex + (h.dx > 0 ? 30 : -30)} ${ey}`}
                stroke={on ? accent : line}
                strokeWidth="2"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={on ? 0 : 1}
                style={{ transition: "stroke-dashoffset .8s cubic-bezier(.16,1,.3,1)" }}
              />
              {on && <circle cx={h.x} cy={h.y} r="20" fill="none" stroke={accent} strokeWidth="3" strokeOpacity="0.6" />}
              <circle cx={h.x} cy={h.y} r="11" fill={on ? accent : "#1f3f3b"} stroke={on ? "#fff" : line} strokeWidth="2.5" />
            </g>
          );
        })}
    </svg>
  );
}
