import { forwardRef } from "react";
import { videoSelector } from "@/config/p70";

/**
 * Pedestal giratorio del "garage": va ENCIMA del video, en el mismo cuadro 16:9,
 * así sus coordenadas coinciden con el piso de los renders (config/p70.ts → pedestal).
 *
 * - Plinto con marcas de goniómetro en el canto (fijo).
 * - Disco superior con marcas de grados que GIRAN con el camper: el selector
 *   actualiza el `transform` del grupo `ref` en cada cuadro (sin re-render).
 * - La mitad de atrás se desvanece en el centro, donde la taparía el camper.
 */
const W = 1600;
const H = 900;
const { pisoY, pedestal } = videoSelector;
// Elipse del piso: en perspectiva, su centro cae por debajo del punto de contacto.
const RX = pedestal.rx * W;
const RY = ((pedestal.frente + pedestal.fondo) / 2) * H;
const CX = W / 2;
const CY = pisoY * H + ((pedestal.frente - pedestal.fondo) / 2) * H;
const CANTO = 26;

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const rad = (d: number) => (d * Math.PI) / 180;

// Marcas del canto (frente del plinto): cada 5°, mayores cada 15°, rótulo cada 30°.
const canto = range(37).map((i) => {
  const deg = i * 5;
  const x = CX + RX * Math.cos(rad(deg));
  const y = CY + RY * Math.sin(rad(deg));
  return { deg, x, y, major: deg % 15 === 0, label: deg % 30 === 0 && deg > 0 && deg < 180 };
});
const CANTO_TICKS = canto.map((t) => `M${t.x.toFixed(1)} ${(t.y + 3).toFixed(1)} v${t.major ? 12 : 6}`).join(" ");

// Disco: marcas en un círculo unitario (el grupo lo escala a la elipse).
const DISCO_MENORES = range(72)
  .filter((i) => i % 6 !== 0)
  .map((i) => {
    const a = rad(i * 5);
    return `M${(0.94 * Math.cos(a)).toFixed(4)} ${(0.94 * Math.sin(a)).toFixed(4)} L${(0.975 * Math.cos(a)).toFixed(4)} ${(0.975 * Math.sin(a)).toFixed(4)}`;
  })
  .join(" ");
const DISCO_MAYORES = range(12)
  .map((i) => {
    const a = rad(i * 30);
    return `M${(0.88 * Math.cos(a)).toFixed(4)} ${(0.88 * Math.sin(a)).toFixed(4)} L${(0.975 * Math.cos(a)).toFixed(4)} ${(0.975 * Math.sin(a)).toFixed(4)}`;
  })
  .join(" ");

export const pedestalTransform = (turn: number) => `translate(${CX} ${CY}) scale(${RX} ${RY}) rotate(${(-turn * 360).toFixed(2)})`;

export const Pedestal = forwardRef<SVGGElement, { className?: string }>(function Pedestal({ className = "" }, ref) {
  const frontArc = `M${CX - RX} ${CY} A${RX} ${RY} 0 0 0 ${CX + RX} ${CY}`;
  const backArc = `M${CX - RX} ${CY} A${RX} ${RY} 0 0 1 ${CX + RX} ${CY}`;
  const face = `${frontArc} v${CANTO} A${RX} ${RY} 0 0 1 ${CX - RX} ${CY + CANTO} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={`pointer-events-none ${className}`} aria-hidden fill="none">
      <defs>
        {/* Lo que queda detrás del camper se desvanece en el centro */}
        <linearGradient id="ped-occ-g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.22" stopColor="#fff" />
          <stop offset="0.36" stopColor="#000" />
          <stop offset="0.64" stopColor="#000" />
          <stop offset="0.78" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <linearGradient id="ped-occ-v" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id="ped-occ" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect width={W} height={H} fill="#fff" />
          <rect x={CX - RX - 4} y={CY - RY - 4} width={RX * 2 + 8} height={RY + 10} fill="url(#ped-occ-g)" />
        </mask>
        <radialGradient id="ped-top" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ece7df" stopOpacity="0.10" />
          <stop offset="0.7" stopColor="#ece7df" stopOpacity="0.05" />
          <stop offset="1" stopColor="#ece7df" stopOpacity="0.02" />
        </radialGradient>
        <linearGradient id="ped-face" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2f3338" />
          <stop offset="1" stopColor="#121417" />
        </linearGradient>
        <linearGradient id="ped-face-h" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Canto del plinto con goniómetro */}
      <path d={face} fill="url(#ped-face)" />
      <path d={face} fill="url(#ped-face-h)" />
      <path d={CANTO_TICKS} stroke="#ece7df" strokeOpacity="0.32" strokeWidth="1.2" />
      <g fontFamily="var(--font-jetbrains), monospace" fontSize="11" fill="#ece7df" fillOpacity="0.38" textAnchor="middle">
        {canto
          .filter((t) => t.label)
          .map((t) => (
            <text key={t.deg} x={t.x} y={t.y + CANTO - 4}>
              {String(Math.round(Math.abs(90 - t.deg))).padStart(3, "0")}
            </text>
          ))}
      </g>
      <path d={`M${CX - RX} ${CY + CANTO} A${RX} ${RY} 0 0 0 ${CX + RX} ${CY + CANTO}`} stroke="#ece7df" strokeOpacity="0.12" strokeWidth="1" />

      <g mask="url(#ped-occ)">
        {/* Disco superior */}
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="url(#ped-top)" style={{ mixBlendMode: "screen" }} />
        <path d={backArc} stroke="#ece7df" strokeOpacity="0.22" strokeWidth="1.2" />
        <path d={frontArc} stroke="#ece7df" strokeOpacity="0.5" strokeWidth="1.6" />
        <ellipse cx={CX} cy={CY} rx={RX * 0.72} ry={RY * 0.72} stroke="#ece7df" strokeOpacity="0.1" strokeDasharray="2 7" />

        {/* Marcas que giran con el camper */}
        <g ref={ref} transform={pedestalTransform(0)}>
          <path d={DISCO_MENORES} stroke="#ece7df" strokeOpacity="0.3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={DISCO_MAYORES} stroke="#ece7df" strokeOpacity="0.55" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
          <path d="M0 0.86 L0 0.985" stroke="#f07a52" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </g>
      </g>
    </svg>
  );
});
