/**
 * Genera el croquis vectorial del P70 (components/p70/croquis-svg.ts), calcado
 * del render "Versión acero 100%" de los flyers. Coordenadas del render ampliado
 * 4x (1200 × 720); P70Drawing lo ubica con un transform.
 *
 *   node scripts/croquis-p70.mjs
 */
import { writeFileSync } from "node:fs";
const L = "#2e3033";
const P = (pts) => pts.map((p) => p.map((v) => +v.toFixed(1)).join(",")).join(" ");
const poly = (pts, fill, extra = "") =>
  `<polygon points="${P(pts)}" fill="${fill}"${/\bstroke=/.test(extra) ? "" : ` stroke="${L}"`}${/stroke-width=/.test(extra) ? "" : ' stroke-width="2.2"'} stroke-linejoin="round" ${extra}/>`;
const line = (a, b, w = 2, c = L, extra = "") =>
  `<line x1="${+a[0].toFixed(1)}" y1="${+a[1].toFixed(1)}" x2="${+b[0].toFixed(1)}" y2="${+b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const C = {
  top: "#d3d2ce", hood: "#c9c8c4", front: "#b9b8b4", side: "#acacaa", rear: "#97989a",
  box1: "#c9c8c5", box2: "#b6b5b2", boxTop: "#d9d8d4", chasis: "#26282b", glass: "#c8bea6",
  sky: "#cbbf9f", panel: "#d7dada", fender: "#f2aa3c", rim: "#e5783f", tire: "#cfccc5",
};

let s = "";
// Sombra en el piso
s += `<ellipse cx="620" cy="700" rx="560" ry="20" fill="#000" opacity=".2"/>`;

// ── Chasis y lanza (atrás de todo)
s += poly([[330, 538], [880, 546], [880, 574], [330, 566]], C.chasis);
s += poly([[96, 596], [340, 538], [346, 552], [100, 610]], C.chasis);
s += poly([[100, 606], [560, 576], [562, 590], [104, 620]], C.chasis);
s += `<rect x="34" y="600" width="74" height="24" rx="9" fill="${C.chasis}" stroke="${L}" stroke-width="2"/>`;
s += `<circle cx="44" cy="612" r="9" fill="#44474b"/>`;
s += `<rect x="190" y="598" width="176" height="11" rx="4" fill="#3a3d41" stroke="${L}" stroke-width="2"/>`;
s += `<rect x="241" y="556" width="30" height="70" rx="4" fill="#33363a" stroke="${L}" stroke-width="2"/>`;
s += `<ellipse cx="256" cy="630" rx="14" ry="12" fill="#1c1d1f"/>`;

// Detalles del chasis: agujeros de corte láser, cadenas y manija de la rueda jockey
for (let i = 0; i < 16; i++) s += `<rect x="${360 + i * 31}" y="549" width="14" height="6" rx="3" fill="#5b5f64"/>`;
s += `<path d="M118 618 q14 16 30 2 M128 620 q16 18 34 0" fill="none" stroke="#6d7176" stroke-width="2.5" stroke-dasharray="4 3"/>`;
s += `<rect x="234" y="548" width="44" height="9" rx="3" fill="#3f4246" stroke="${L}" stroke-width="1.5"/>`;
// Bajo carrocería / eje
s += poly([[560, 560], [880, 556], [868, 600], [720, 608], [604, 598]], "#2a2c2f");

// ── Carrocería
s += poly([[550, 272], [762, 170], [1095, 118], [1150, 332], [1112, 488], [1090, 522], [860, 532], [560, 528]], C.side);
s += poly([[540, 104], [640, 62], [1100, 94], [1095, 118], [762, 170]], C.top);
// Capot inclinado con claraboya
s += poly([[325, 195], [540, 104], [762, 170], [550, 272]], C.hood);
s += poly([[440, 190], [548, 138], [655, 168], [565, 228]], C.sky);
s += line([452, 191], [552, 144], 1.2, "#8c7f63");
s += line([558, 221], [645, 171], 1.2, "#8c7f63");
// Cara frontal (sobre la baulera)
s += poly([[325, 195], [550, 272], [550, 306], [330, 284]], C.front);
s += poly([[325, 195], [346, 203], [346, 286], [330, 284]], "#6c6d70");
// Esquina delantera derecha
s += poly([[505, 258], [550, 272], [552, 526], [505, 520]], "#bebdba");
s += line([520, 264], [521, 522], 1.4);
// Chaflán entre capot y lateral
s += poly([[550, 272], [762, 170], [767, 225], [553, 298]], "#bfbebb");
// Panel lateral delantero (puerta)
s += poly([[553, 298], [767, 225], [770, 506], [560, 520]], C.side);
s += poly([[560, 470], [770, 466], [770, 506], [560, 520]], "#9fa0a0");
s += poly([[598, 302], [655, 296], [655, 492], [610, 494], [598, 478]], "#b3b3b1");
s += `<rect x="603" y="318" width="40" height="7" rx="2" fill="#8f9092" stroke="${L}" stroke-width="1.2"/>`;
s += `<rect x="603" y="428" width="40" height="7" rx="2" fill="#8f9092" stroke="${L}" stroke-width="1.2"/>`;
s += poly([[657, 293], [758, 287], [758, 490], [657, 493]], "#b0b0ae");
s += `<rect x="668" y="303" width="78" height="142" rx="12" fill="${C.glass}" stroke="${L}" stroke-width="2.4"/>`;
s += `<rect x="675" y="310" width="64" height="128" rx="9" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>`;
s += `<rect x="789" y="342" width="11" height="34" rx="2" fill="#45484c"/>`;
s += `<rect x="764" y="374" width="24" height="9" fill="#e9e9e7" stroke="${L}" stroke-width="1"/>`;
s += line([767, 172], [771, 505], 3);

// Costuras y rejillas
s += line([585, 290], [588, 515], 1.2, "#7d7f82");
s += line([792, 186], [796, 462], 1.2, "#7d7f82");
for (let i = 0; i < 5; i++) s += line([800, 416 + i * 8], [826, 416 + i * 8], 2, "#5b5e62");
s += line([553, 300], [767, 228], 1.2, "#fff", 'stroke-opacity=".35"');
s += line([771, 183], [1092, 131], 1.2, "#fff", 'stroke-opacity=".35"');
// Sección trasera
s += line([771, 180], [1094, 128], 1.6);
s += line([771, 400], [1068, 395], 1.6);
s += poly([[834, 202], [962, 196], [962, 346], [838, 350]], "#3b3e42");
s += poly([[846, 212], [952, 207], [952, 337], [849, 340]], "#a9aaab");
s += line([872, 214], [873, 338], 2.2);
s += `<rect x="896" y="214" width="16" height="22" rx="3" fill="#6b6e72" stroke="${L}" stroke-width="1.2"/>`;
for (let i = 0; i < 7; i++) s += line([858, 236 + i * 14], [866, 236 + i * 14], 2, "#55585c");
s += poly([[962, 180], [1066, 172], [1068, 396], [963, 400]], "#a7a8a9");
s += poly([[972, 190], [1056, 184], [1058, 386], [973, 390]], "#b0b1b2", 'stroke-width="1.4"');
s += `<path d="M1010 206 v22 h12 v-22" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`;
s += poly([[1068, 172], [1095, 118], [1150, 332], [1112, 488], [1070, 492]], C.rear);
s += poly([[1098, 296], [1142, 300], [1142, 352], [1100, 350]], "#5d6064");
s += `<rect x="1106" y="306" width="28" height="18" rx="3" fill="#7a1f1a"/>`;
s += line([1084, 140], [1088, 486], 1.4);
s += poly([[1068, 396], [1070, 492], [1090, 522], [1036, 520], [1030, 470], [1060, 460]], "#8d8e90");

// ── Rueda
s += `<ellipse cx="962" cy="598" rx="110" ry="105" fill="#2f3134"/>`;
for (let i = 0; i < 32; i++) {
  const a = (i / 32) * Math.PI * 2;
  const x = 962 + Math.cos(a) * 112, y = 598 + Math.sin(a) * 107;
  s += `<rect x="${(x - 6).toFixed(1)}" y="${(y - 9).toFixed(1)}" width="12" height="18" rx="2" fill="#2f3134" transform="rotate(${((a * 180) / Math.PI + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
}
s += `<ellipse cx="974" cy="600" rx="92" ry="98" fill="${C.tire}" stroke="${L}" stroke-width="2.2"/>`;
s += `<ellipse cx="976" cy="600" rx="74" ry="82" fill="none" stroke="#b3afa6" stroke-width="2"/>`;
s += `<ellipse cx="978" cy="600" rx="52" ry="63" fill="${C.rim}" stroke="#8c3b17" stroke-width="2.4"/>`;
s += `<ellipse cx="978" cy="600" rx="40" ry="50" fill="none" stroke="#b9532a" stroke-width="2"/>`;
for (let i = 0; i < 10; i++) {
  const a = (i / 10) * Math.PI * 2;
  s += `<ellipse cx="${(978 + Math.cos(a) * 44).toFixed(1)}" cy="${(600 + Math.sin(a) * 54).toFixed(1)}" rx="4.5" ry="5.5" fill="#7a2e10"/>`;
}
s += `<ellipse cx="978" cy="600" rx="17" ry="21" fill="#7f8b96" stroke="${L}" stroke-width="2"/>`;
s += `<ellipse cx="978" cy="600" rx="6" ry="7" fill="#3c4147"/>`;

// ── Guardabarros
s += poly([[836, 488], [908, 434], [1034, 436], [1062, 486], [1046, 494], [1024, 458], [924, 458], [858, 505]], "#9c9d9f");
s += poly([[826, 360], [848, 345], [842, 484], [820, 492]], "#3a3c3f");
s += poly([[848, 345], [962, 342], [962, 415], [912, 433], [842, 484]], C.fender, 'stroke="#7d4d0c"');
s += line([852, 352], [956, 349], 1.4, "#fff", 'stroke-opacity=".45"');
for (const [x, y] of [[858, 356], [948, 354], [948, 404], [856, 466], [900, 434]]) s += `<circle cx="${x}" cy="${y}" r="3.2" fill="#9a5d10"/>`;


// ── Porta equipajes con panel solar
s += poly([[580, 98], [616, 80], [706, 92], [702, 124], [612, 140]], "#d2d1ce");
s += `<polygon points="${P([[565, 96], [650, 42], [1180, 50], [1112, 118]])}" fill="none" stroke="#1d1f22" stroke-width="9" stroke-linejoin="round"/>`;
for (let i = 1; i < 18; i++) s += line(lerp([565, 96], [1112, 118], i / 18), lerp([650, 42], [1180, 50], i / 18), 4, "#1d1f22");
s += line(lerp([565, 96], [650, 42], 0.5), lerp([1112, 118], [1180, 50], 0.5), 3, "#1d1f22");
s += line([572, 104], [1112, 126], 6, "#1d1f22");
s += poly([[712, 52], [850, 26], [975, 66], [818, 98]], C.panel, 'stroke-width="3"');
for (let i = 1; i < 4; i++) s += line(lerp([712, 52], [818, 98], i / 4), lerp([850, 26], [975, 66], i / 4), 1, "#9da2a3");
for (let i = 1; i < 5; i++) s += line(lerp([712, 52], [850, 26], i / 5), lerp([818, 98], [975, 66], i / 5), 1, "#9da2a3");
s += line([650, 36], [860, 12], 8, "#1d1f22");

// ── Baulera frontal
s += poly([[243, 290], [258, 270], [478, 292], [500, 305], [365, 325]], C.boxTop);
s += poly([[243, 290], [365, 325], [365, 548], [250, 512]], C.box1);
s += poly([[365, 325], [500, 305], [500, 522], [365, 548]], C.box2);
s += line([365, 325], [365, 548], 4);
s += line([250, 512], [365, 548], 4);
s += line([365, 548], [500, 522], 4);
s += `<rect x="359" y="343" width="12" height="22" rx="2" fill="#2a2c2f"/>`;
s += `<rect x="359" y="505" width="12" height="22" rx="2" fill="#2a2c2f"/>`;
s += `<rect x="458" y="404" width="34" height="22" rx="3" fill="#8b8d90" stroke="${L}" stroke-width="1.5"/>`;
s += `<rect x="227" y="324" width="18" height="24" rx="3" fill="#5a5d61" stroke="${L}" stroke-width="1.5"/>`;
s += line([254, 300], [360, 331], 1.2, "#fff", 'stroke-opacity=".5"');


// Baulera: refuerzos y bisagras
s += poly([[255, 305], [356, 334], [356, 532], [260, 503]], "none", 'stroke="#8d8e90" stroke-width="1.4"');
s += poly([[374, 334], [491, 316], [491, 514], [374, 537]], "none", 'stroke="#8d8e90" stroke-width="1.4"');
s += line([246, 300], [246, 506], 3, "#3a3c3f");

const out = `// Generado por scripts/croquis-p70.mjs: no editar a mano.
/** Croquis del P70 en SVG (coordenadas 1200 × 720). */
export const CROQUIS_SVG = ${JSON.stringify(s)};
`;
writeFileSync(new URL("../components/p70/croquis-svg.ts", import.meta.url), out);
console.log("✓ components/p70/croquis-svg.ts ·", (out.length / 1024).toFixed(1), "KB");
