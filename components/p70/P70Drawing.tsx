/**
 * Croquis del P70: la captura del modelo 3D que pasó Andrés (16/11), con su fondo,
 * las cotas (largo, ancho y alto) y los puntos de las piezas clave. Sin textos al lado
 * de las líneas: Andrés (14/11) dice que no se llegan a leer; la info está en los
 * botones de abajo. Coordenadas = píxeles de la imagen (1222 × 740); el lienzo
 * sigue 100 px más abajo, con el mismo fondo, para que entre la cota del largo.
 */

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
    x: 420,
    y: 512,
    dx: -60,
    dy: 70,
    titulo: "Chasis",
    dato: "Corte láser de precisión",
    texto:
      "Fabricado en chapa plegada con corte láser (no es caño ni perfil de construcción). Es un chasis vehicular con precisión láser, homologado y con patente.",
  },
  {
    id: "suspension",
    n: "02",
    // Sale de abajo, de la suspensión que asoma detrás de la rueda, no del guardabarros (Andrés, 20/11).
    x: 783,
    y: 527,
    dx: -70,
    dy: 80,
    titulo: "Suspensión Hard & Soft",
    dato: "Probado a 165 km/h",
    texto:
      "Inteligente: responde suave en los pozos para cuidar la carga del interior y le da estabilidad en ruta. Probado en ripio y a 165 km/h en autopista.",
  },
  {
    id: "frenos",
    n: "03",
    x: 908,
    y: 553,
    dx: 90,
    dy: 60,
    titulo: "Frenos eléctricos",
    dato: "Automático",
    texto:
      "Se accionan automáticamente al pisar el freno de la camioneta. Al entrar pasado a una curva, alinean rápidamente al camper detrás de la camioneta.",
  },
  {
    id: "aislamiento",
    n: "04",
    x: 700,
    y: 250,
    dx: 50,
    dy: -110,
    titulo: "Aislamiento térmico",
    dato: "80 mm",
    texto: "Toda la carrocería de acero lleva en su interior un conjunto de 3 cuerpos, llegando a los 80 mm de aislante térmico.",
  },
  {
    // Antes "Dos portones traseros" (Andrés, 20/11). El punto va en la puerta.
    id: "aberturas",
    n: "05",
    x: 640,
    y: 400,
    dx: -80,
    dy: -70,
    titulo: "Aberturas estanco",
    dato: "Puertas y portones probados",
    texto:
      "Las puertas y portones son otro de nuestros fuertes: un diseño que expulsa el agua de lluvia en ruta, con burletes dispuestos estratégicamente para no permitir el ingreso de polvillo al habitáculo. Calidad probada.",
  },
];

/** La imagen y las cotas: largo de punta del acople a la cola, ancho de rueda a rueda, alto del piso a la parrilla. */
const IMG = { src: "/media/p70/croquis-p70-3d.webp", w: 1222, h: 740, fondo: "#2e333f" };
const LIENZO_H = 840;
/**
 * Las cotas del piso siguen la perspectiva (Andrés, 22/11), se dibujan derechas y se giran:
 * el largo con el riel del chasis (7,5°; no con la lanza, que va al centro y es más chata)
 * y el ancho con los travesaños y el eje (18,1°).
 */
const LARGO = { x: 50, y: 800, largo: 990, grados: -7.5 };
const ANCHO = { x: 429, y: 565, largo: 344, grados: 18.1 };
const ALTO = { x: 1110, y1: 52, y2: 652 };

export function P70Drawing({
  // Durazno de los flyers: la pieza activa se lee sobre el bloque verde.
  accent = "#fbe3c7",
  line = "#ece7df",
  active,
  showHotspots = false,
  className = "",
  title = "Modelo 3D del camper P70, con sus medidas",
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
    <svg viewBox={`0 0 ${IMG.w} ${LIENZO_H}`} className={className} role="img" aria-label={title} fill="none" strokeLinejoin="round">
      <title>{title}</title>

      <rect width={IMG.w} height={LIENZO_H} fill={IMG.fondo} />
      <image href={IMG.src} width={IMG.w} height={IMG.h} />

      {/* Cotas: largo 4 m y alto 2 m (Andrés, 14/11), ancho 2,10 m (22/11) */}
      {/* En el celu el croquis se ve chico (85% del ancho): las medidas van más grandes (en px del viewBox). */}
      <g fontFamily="var(--font-jetbrains), monospace" fontWeight="600" fill={line} className="text-[46px] sm:text-[26px]">
        <g transform={`translate(${LARGO.x} ${LARGO.y}) rotate(${LARGO.grados})`}>
          <line x1={0} y1={0} x2={LARGO.largo} y2={0} stroke={detalle} strokeWidth="1.5" />
          <line x1={0} y1={-12} x2={0} y2={12} stroke={detalle} strokeWidth="1.5" />
          <line x1={LARGO.largo} y1={-12} x2={LARGO.largo} y2={12} stroke={detalle} strokeWidth="1.5" />
          <path d={`M0 0 l16 -6 v12 Z M${LARGO.largo} 0 l-16 -6 v12 Z`} fill={line} stroke="none" />
          {/* Corrido hacia adelante para no chocar con el 2,10 m */}
          <text x={380} y={-14} textAnchor="middle">
            4 m
          </text>
        </g>
        <g transform={`translate(${ANCHO.x} ${ANCHO.y}) rotate(${ANCHO.grados})`}>
          <line x1={0} y1={0} x2={ANCHO.largo} y2={0} stroke={detalle} strokeWidth="1.5" />
          <line x1={0} y1={-12} x2={0} y2={12} stroke={detalle} strokeWidth="1.5" />
          <line x1={ANCHO.largo} y1={-12} x2={ANCHO.largo} y2={12} stroke={detalle} strokeWidth="1.5" />
          <path d={`M0 0 l16 -6 v12 Z M${ANCHO.largo} 0 l-16 -6 v12 Z`} fill={line} stroke="none" />
          {/* dy en em: baja lo mismo que crece la letra en el celu */}
          <text x={ANCHO.largo / 2} y={8} dy="0.88em" textAnchor="middle">
            2,10 m
          </text>
        </g>

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
