/**
 * "P70" con la tipografía del folleto: el vector que pasó Andrés (Logo P70.svg, 19/11).
 * Toma el color del texto (currentColor); el tamaño, de la clase (alto o ancho).
 * `a10grados`: la variante del inicio, con las tres piezas a 10° como la itálica de
 * "Viajá distinto." (Andrés, 22/11). El original tiene la P a 8,6° y el 0 derecho.
 */
const D = [
  "M12386 12180c0,0 6287,0 6287,0 0,0 -312,1829 -312,1829 0,0 -4007,6158 -4007,6158 0,0 -3125,0 -3125,0 0,0 4118,-5864 4118,-5864 0,0 -3382,0 -3382,0 0,0 423,-2123 423,-2123z",
  "M21476 12180c0,0 1384,0 1384,0 1488,0 2706,1218 2706,2706 0,0 0,2576 0,2576 0,1488 -1218,2706 -2706,2706 0,0 -1384,0 -1384,0 -1488,0 -2706,-1218 -2706,-2706 0,0 0,-2576 0,-2576 0,-1488 1218,-2706 2706,-2706zm561 1952c0,0 0,0 0,0 2,0 5,0 7,0 52,0 195,0 247,0 2,0 4,0 7,0 0,0 0,0 0,0 2,0 5,0 7,0 495,4 898,410 898,905 0,0 0,2273 0,2273 0,493 -399,897 -889,905 -5,0 -11,0 -16,0 0,0 0,0 0,0 -6,0 -12,0 -17,0 -46,-1 -181,-1 -228,0 -5,0 -11,0 -16,0 0,0 0,0 0,0 -6,0 -11,0 -17,0 -491,-9 -888,-413 -888,-905 0,0 0,-2273 0,-2273 0,-496 404,-902 899,-905 2,0 4,0 7,0z",
  "M11209 15890c122,-531 274,-1573 175,-2148 -140,-809 -1182,-1551 -2177,-1551 0,0 -3890,-1 -3890,-1 0,0 -1196,7915 -1196,7915 0,0 2415,61 2415,61 0,0 404,-2630 404,-2630 0,0 1579,4 1579,4 821,2 2347,-157 2689,-1651zm-2733 -162c0,0 -1201,0 -1201,0 0,0 274,-1719 274,-1719 0,0 1033,6 1033,6 303,2 569,141 504,585 0,0 -91,619 -91,619 -60,410 -261,509 -518,509z",
];

/** El 7 con sus dos cortes a 10° (en el original, 11,3° y 9,7°). */
const SIETE_10 =
  "M12386 12180c0,0 6287,0 6287,0 0,0 -323,1829 -323,1829 0,0 -4007,6158 -4007,6158 0,0 -3125,0 -3125,0 0,0 4118,-5864 4118,-5864 0,0 -3325,0 -3325,0 0,0 375,-2123 375,-2123z";
/** Cuánto se inclina cada pieza de D para quedar a 10°: el 7 ya viene corregido, el 0 gira sobre su centro y la P sobre su base. */
const A_10 = [undefined, "translate(0 16175) skewX(-10.02) translate(0 -16175)", "translate(0 20170) skewX(-1.47) translate(0 -20170)"];

export function LogoP70({ className = "", title = "P70", a10grados = false }: { className?: string; title?: string | null; a10grados?: boolean }) {
  return (
    <svg viewBox={a10grados ? "4110 12170 22000 8010" : "4110 12170 21470 8010"} className={className} fill="currentColor" fillRule="evenodd" {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}>
      {D.map((d, i) => (
        <path key={d.slice(0, 12)} d={a10grados && i === 0 ? SIETE_10 : d} transform={a10grados ? A_10[i] : undefined} />
      ))}
    </svg>
  );
}
