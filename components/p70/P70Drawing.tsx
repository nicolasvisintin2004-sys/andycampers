/**
 * Croquis del P70: la captura del modelo 3D que pasó Andrés (16/11), con su fondo,
 * las cotas (largo, alto y ancho, en perspectiva) y los puntos de las piezas clave. Sin textos al lado
 * de las líneas: Andrés (14/11) dice que no se llegan a leer; la info está en los
 * botones de abajo. Coordenadas = píxeles de la imagen (1222 × 740); en el lienzo la imagen
 * baja ARRIBA px y el resto tiene el mismo fondo, para que entren las cotas.
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

/** La imagen; el lienzo la deja ARRIBA px más abajo para que entre la cota del ancho arriba del camper. */
const IMG = { src: "/media/p70/croquis-p70-3d.webp", w: 1222, h: 740, fondo: "#2e333f" };
const ARRIBA = 135;
const LIENZO_H = ARRIBA + 875;

type Pt = readonly [number, number];
/**
 * Cotas en perspectiva real (Andrés, 27/11), en píxeles de la imagen: puntos 3D del camper proyectados con
 * la cámara que se resolvió para esta captura (entregas/22-11/giro/fuente/medidas.json). Ejes: X hacia atrás
 * desde el eje, Y arriba desde el piso, Z hacia el costado que se ve.
 * - Largo: por el piso, 1,40 m afuera del costado, de la punta del acople (-3,24) a la cola (0,93).
 * - Alto: vertical desde la punta de atrás del largo hasta 2,10 m: las dos cotas casi se tocan.
 * - Ancho: arriba del techo (2,45 m), 0,30 m detrás del eje (Andrés, 27/11: más atrás), paralela a sus líneas, de -1,08 a 1,08 (2,16 m).
 */
const COTAS: { de: Pt; a: Pt; texto: string; dy: string; guias?: [Pt, Pt][] }[] = [
  {
    de: [236.3, 790.9],
    a: [1160.8, 642.0],
    texto: "4 m",
    dy: "1.15em",
    guias: [
      [[49.6, 570.3], [236.3, 790.9]],
      [[1071.8, 609.0], [1160.8, 642.0]],
    ],
  },
  { de: [1160.95, 631.6], a: [1168.5, 114.6], texto: "2,10 m", dy: "0.9em", guias: [[[1078.4, 87.7], [1168.5, 114.6]]] },
  { de: [684.7, -60.8], a: [987.6, 28.3], texto: "2,16 m", dy: "-0.5em" },
];

function Cota({ de, a, texto, dy, guias = [], trazo, relleno }: (typeof COTAS)[number] & { trazo: string; relleno: string }) {
  const largo = Math.hypot(a[0] - de[0], a[1] - de[1]);
  const grados = (Math.atan2(a[1] - de[1], a[0] - de[0]) * 180) / Math.PI;
  return (
    <g>
      {guias.map(([p, q], i) => (
        <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={trazo} strokeWidth="1.2" strokeDasharray="6 6" />
      ))}
      <g transform={`translate(${de[0]} ${de[1]}) rotate(${grados})`}>
        <line x1={0} y1={0} x2={largo} y2={0} stroke={trazo} strokeWidth="1.5" />
        <line x1={0} y1={-12} x2={0} y2={12} stroke={trazo} strokeWidth="1.5" />
        <line x1={largo} y1={-12} x2={largo} y2={12} stroke={trazo} strokeWidth="1.5" />
        <path d={`M0 0 l16 -6 v12 Z M${largo} 0 l-16 -6 v12 Z`} fill={relleno} stroke="none" />
        {/* dy en em: se separa de la línea lo mismo que crece la letra en el celu */}
        <text x={largo / 2} y={0} dy={dy} textAnchor="middle">
          {texto}
        </text>
      </g>
    </g>
  );
}

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
      <g transform={`translate(0 ${ARRIBA})`}>
        <image href={IMG.src} width={IMG.w} height={IMG.h} />

        {/* Cotas: largo 4 m, alto 2,10 m y ancho 2,16 m (Andrés, 27/11). En el celu el croquis se ve chico: van más grandes. */}
        <g fontFamily="var(--font-jetbrains), monospace" fontWeight="600" fill={line} className="text-[46px] sm:text-[26px]">
          {COTAS.map((c) => (
            <Cota key={c.texto} {...c} trazo={detalle} relleno={line} />
          ))}
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
      </g>
    </svg>
  );
}
