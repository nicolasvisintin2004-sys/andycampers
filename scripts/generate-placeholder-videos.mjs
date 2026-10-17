/**
 * Genera los 16 videos DEMO del selector "Armá tu P70" (4 equipamientos × 4 colores).
 *
 * Una escena simple de Three.js (un camper low-poly genérico: caja con ruedas)
 * gira 360° sobre el fondo liso del sitio, pintada con el color de cada
 * combinación y con una ETIQUETA ROJA "DEMO · Equipamiento N · Color X".
 * Se renderiza cuadro por cuadro en Chrome (playwright-core) y se codifica con
 * ffmpeg-static, sin depender de un ffmpeg instalado.
 *
 * Cumplen las mismas reglas que los renders finales (ver README):
 *   - 10 s, 30 fps, un giro completo, loop perfecto (el cuadro 300 sería el 0)
 *   - misma cámara, encuadre, luz y ángulo inicial en los 16
 *   - MP4 H.264 + WebM VP9, sin audio · desktop 1920×1080 y mobile 1280×720
 *   - poster .jpg (primer cuadro)
 *   - nombres p70-eq{n}-{color}.mp4 en public/media/p70/{desktop,mobile,posters}
 *
 * Uso:
 *   npm run videos:demo                 → los 16
 *   npm run videos:demo -- --only=eq2-c3 → una sola combinación
 *   npm run videos:demo -- --frames=60   → prueba rápida (no hace loop de 10 s)
 *
 * Necesita Google Chrome instalado (usa el canal "chrome" de Playwright).
 * Si Chrome está en otro lado: CHROME_PATH="C:\\…\\chrome.exe" npm run videos:demo
 */
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";
import { chromium } from "playwright-core";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "media", "p70");
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));

/* ───────── Datos desde config/p70.ts (equipamientos, colores, fondo, duración) ───────── */
const cfg = readFileSync(join(ROOT, "config", "p70.ts"), "utf8");
const bloque = (nombre) => cfg.slice(cfg.indexOf(`export const ${nombre}`), cfg.indexOf("];", cfg.indexOf(`export const ${nombre}`)));
const eqs = [...bloque("equipamientos").matchAll(/\bn:\s*(\d)/g)].map((m) => Number(m[1]));
const colores = [...bloque("colores").matchAll(/\{\s*id:\s*"([^"]+)",\s*nombre:\s*(?:"([^"]*)"|falta\([^)]*\)),\s*hex:\s*(?:"(#[0-9a-fA-F]{6})"|falta\([^)]*\)),\s*hexDemo:\s*"(#[0-9a-fA-F]{6})"/g)].map(
  (m, i) => ({ id: m[1], nombre: m[2] ?? `Color ${i + 1}`, hex: m[3] ?? m[4] }),
);
const fondo = cfg.match(/fondo:\s*"(#[0-9a-fA-F]{6})"/)[1];
const duracion = Number(cfg.match(/duracion:\s*(\d+)/)[1]);
const pisoY = Number(cfg.match(/pisoY:\s*([\d.]+)/)[1]);
if (eqs.length !== 4 || colores.length !== 4) throw new Error(`Esperaba 4 equipamientos y 4 colores en config/p70.ts (encontré ${eqs.length} y ${colores.length})`);

const FPS = 30;
const FRAMES = Number(args.frames ?? duracion * FPS);
const W = 1920;
const H = 1080;

let combos = eqs.flatMap((eq) => colores.map((c) => ({ eq, color: c })));
if (args.only) combos = combos.filter((c) => `eq${c.eq}-${c.color.id}` === args.only);
if (!combos.length) throw new Error(`No hay combinación ${args.only}`);

for (const d of ["desktop", "mobile", "posters"]) mkdirSync(join(OUT, d), { recursive: true });

/* ───────────────────────── Escena (corre dentro de Chrome) ───────────────────────── */
const PAGE = /* html */ `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;background:${fondo}}canvas{display:block}</style>
<script type="importmap">{"imports":{"three":"/three/three.module.js"}}</script></head><body>
<script type="module">
import * as THREE from "three";
const W=${W},H=${H},FONDO="${fondo}",PISO_Y=${pisoY};

const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(W,H);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setClearColor(new THREE.Color(FONDO),1);
// El fondo tiene que salir EXACTO (sin tone mapping): se pinta aparte.
const scene=new THREE.Scene();

/* Luces: cenital (con sombra de contacto), relleno frío y contraluz */
scene.add(new THREE.HemisphereLight(0xdfe6ee,0x1a1c1f,0.9));
const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(1.5,9,3);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);key.shadow.radius=6;key.shadow.bias=-0.0004;
Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:1,far:20});scene.add(key);
const rim=new THREE.DirectionalLight(0xcfd8ff,1.4);rim.position.set(-6,4,-7);scene.add(rim);
const fill=new THREE.DirectionalLight(0xffeedd,1.1);fill.position.set(2,3,10);scene.add(fill);

/* Piso invisible que solo recibe la sombra */
const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({opacity:0.55}));
floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);

/* ── Camper low-poly genérico ── */
const camper=new THREE.Group();scene.add(camper);
const std=(color,o={})=>new THREE.MeshStandardMaterial({color,flatShading:true,roughness:0.62,metalness:0.18,...o});
const dark=std(0x16181b,{roughness:0.8}),steel=std(0x2a2e33,{roughness:0.55,metalness:0.5}),tire=std(0x0e0f11,{roughness:0.95,metalness:0});
const body=std(0xffffff);
const add=(geo,mat,x,y,z,o={})=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);if(o.rx)m.rotation.x=o.rx;if(o.ry)m.rotation.y=o.ry;if(o.rz)m.rotation.z=o.rz;m.castShadow=true;m.receiveShadow=true;camper.add(m);return m;};

// Perfil lateral facetado (x = largo, y = alto), extruido al ancho del camper
const s=new THREE.Shape();
[[-1.38,0.62],[-1.38,1.5],[-1.12,1.86],[1.22,1.9],[1.46,1.64],[1.46,0.76],[1.3,0.58],[-1.24,0.58]].forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));
const ANCHO=1.62;
const g=new THREE.ExtrudeGeometry(s,{depth:ANCHO,bevelEnabled:true,bevelThickness:0.07,bevelSize:0.07,bevelSegments:1});
g.translate(0,0,-ANCHO/2);add(g,body,0,0,0);

// Puerta, ventana y portones (paneles oscuros apenas salientes)
for(const z of [ANCHO/2+0.075,-ANCHO/2-0.075]){
  add(new THREE.BoxGeometry(0.62,0.98,0.02),steel,-0.55,1.12,z);
  add(new THREE.BoxGeometry(0.4,0.46,0.03),dark,-0.55,1.32,z);
  add(new THREE.BoxGeometry(0.5,0.5,0.03),dark,0.62,1.42,z);
}
add(new THREE.BoxGeometry(0.03,0.62,1.2),steel,1.54,1.34,0);
add(new THREE.BoxGeometry(0.03,0.42,1.2),steel,1.54,0.84,0);

// Chasis, guardabarros y ruedas
add(new THREE.BoxGeometry(2.9,0.16,1.1),dark,0.05,0.5,0);
for(const z of [1,-1]){
  add(new THREE.BoxGeometry(1.02,0.08,0.4),steel,0.35,1.0,z*(ANCHO/2+0.22));
  add(new THREE.BoxGeometry(0.08,0.36,0.4),steel,-0.14,0.84,z*(ANCHO/2+0.22),{rz:-0.5});
  add(new THREE.BoxGeometry(0.08,0.36,0.4),steel,0.84,0.84,z*(ANCHO/2+0.22),{rz:0.5});
  add(new THREE.CylinderGeometry(0.42,0.42,0.32,18),tire,0.35,0.42,z*(ANCHO/2+0.2),{rx:Math.PI/2});
  add(new THREE.CylinderGeometry(0.24,0.24,0.33,12),steel,0.35,0.42,z*(ANCHO/2+0.2),{rx:Math.PI/2});
  add(new THREE.TorusGeometry(0.255,0.035,6,24),body,0.35,0.42,z*(ANCHO/2+0.2+0.165));
}
// Lanza en A, baulera frontal, rueda jockey y enganche
const lanza=new THREE.BoxGeometry(1.7,0.1,0.1);
add(lanza,dark,-2.0,0.5,0.3,{ry:0.33});add(lanza,dark,-2.0,0.5,-0.3,{ry:-0.33});
add(new THREE.BoxGeometry(0.55,0.66,1.24),steel,-1.78,0.92,0);
add(new THREE.BoxGeometry(0.2,0.1,0.14),dark,-2.86,0.5,0);
add(new THREE.CylinderGeometry(0.035,0.035,0.5,8),steel,-2.42,0.3,0.22);
add(new THREE.CylinderGeometry(0.08,0.08,0.05,12),tire,-2.42,0.08,0.22,{rx:Math.PI/2});
// Porta equipajes
add(new THREE.BoxGeometry(2.1,0.04,1.3),dark,0.05,2.06,0);
for(const x of [-0.95,0.05,1.05])for(const z of [0.6,-0.6])add(new THREE.BoxGeometry(0.05,0.14,0.05),dark,x,1.98,z);

// El conjunto (caja + lanza) gira alrededor de su centro: el radio queda mínimo
const CENTRO_X=-0.7;camper.children.forEach((m)=>m.position.x-=CENTRO_X);

/* ── Cámara: elevación baja, el contacto con el piso en PISO_Y del cuadro ── */
const cam=new THREE.PerspectiveCamera(24,W/H,0.5,60);
const ELEV=THREE.MathUtils.degToRad(9),DIST=10.6;
cam.position.set(0,Math.sin(ELEV)*DIST,Math.cos(ELEV)*DIST);
let ty=0.9;
for(let i=0;i<40;i++){cam.lookAt(0,ty,0);cam.updateMatrixWorld();const y=(1-new THREE.Vector3(0,0,0).project(cam).y)/2;ty+=(PISO_Y-y)*3;}
cam.lookAt(0,ty,0);cam.updateMatrixWorld();

/* Geometría del pedestal de la web (fracciones del cuadro) para config/p70.ts */
const proj=(x,z)=>{const v=new THREE.Vector3(x,0,z).project(cam);return{x:(v.x+1)/2,y:(1-v.y)/2};};
const R=2.45;
window.__pedestal={radio:R,cx:proj(0,0).x,cy:proj(0,0).y,rx:proj(R,0).x-proj(0,0).x,frente:proj(0,R).y-proj(0,0).y,fondo:proj(0,0).y-proj(0,-R).y};

/* ── Composición final con la etiqueta DEMO (canvas 2D) ── */
const out=document.createElement("canvas");out.width=W;out.height=H;const ctx=out.getContext("2d");
const ANG0=THREE.MathUtils.degToRad(-38);

window.renderFrame=(i,frames,colorHex,label)=>{
  body.color.set(colorHex);
  camper.rotation.y=ANG0+(i/frames)*Math.PI*2;
  renderer.render(scene,cam);
  ctx.fillStyle=FONDO;ctx.fillRect(0,0,W,H);
  ctx.drawImage(renderer.domElement,0,0);
  // Etiqueta roja: arriba al centro (fuera del recorte de los bordes en la web)
  ctx.font="700 38px Arial, sans-serif";
  const tw=ctx.measureText(label).width,pw=tw+64,ph=74,px=(W-pw)/2,py=70;
  ctx.fillStyle="#E00000";ctx.fillRect(px,py,pw,ph);
  ctx.setLineDash([6,6]);ctx.lineWidth=3;ctx.strokeStyle="#ffffff";ctx.strokeRect(px+6,py+6,pw-12,ph-12);ctx.setLineDash([]);
  ctx.fillStyle="#ffffff";ctx.textBaseline="middle";ctx.textAlign="center";ctx.fillText(label,W/2,py+ph/2+2);
  ctx.font="500 24px Arial, sans-serif";ctx.fillStyle="rgba(255,255,255,.72)";
  ctx.fillText("Video provisorio · no es el render del producto real",W/2,py+ph+34);
  return out.toDataURL("image/jpeg",0.93).slice(23);
};
window.__ready=true;
</script></body></html>`;

/* ───────────────────────── Chrome ───────────────────────── */
const browser = await chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }),
  headless: true,
  args: ["--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on("pageerror", (e) => console.error("página:", e.message));
const threeDir = join(ROOT, "node_modules", "three", "build");
await page.route("http://render.local/**", (route) => {
  const path = new URL(route.request().url()).pathname;
  if (path === "/") return route.fulfill({ contentType: "text/html", body: PAGE });
  if (path.startsWith("/three/")) return route.fulfill({ contentType: "text/javascript", body: readFileSync(join(threeDir, path.slice(7))) });
  return route.fulfill({ status: 404 });
});
await page.goto("http://render.local/");
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30_000 });
const ped = await page.evaluate(() => window.__pedestal);
console.log(`Pedestal (para el selector): centro ${ped.cx.toFixed(3)}, ${ped.cy.toFixed(3)} · rx ${ped.rx.toFixed(3)} · frente ${ped.frente.toFixed(3)} · fondo ${ped.fondo.toFixed(3)}`);
console.log(`${combos.length} combinaciones · ${FRAMES} cuadros c/u · fondo ${fondo}\n`);

/* ───────────────────────── ffmpeg ───────────────────────── */
const encode = (base) =>
  spawn(
    ffmpegPath,
    [
      "-hide_banner", "-loglevel", "error", "-y",
      "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      // Desktop 1080p · H.264 (keyframe cada 0,5 s: el selector salta de video a la misma fracción del giro)
      "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-maxrate", "3000k", "-bufsize", "6000k",
      "-g", "15", "-keyint_min", "15", "-sc_threshold", "0", "-profile:v", "high", "-pix_fmt", "yuv420p",
      "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
      "-movflags", "+faststart", join(OUT, "desktop", `${base}.mp4`),
      "-an", "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "2400k", "-g", "15", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4",
      "-pix_fmt", "yuv420p", join(OUT, "desktop", `${base}.webm`),
      // Mobile 720p
      "-an", "-vf", "scale=1280:720:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-maxrate", "1500k", "-bufsize", "3000k",
      "-g", "15", "-keyint_min", "15", "-sc_threshold", "0", "-profile:v", "high", "-pix_fmt", "yuv420p",
      "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
      "-movflags", "+faststart", join(OUT, "mobile", `${base}.mp4`),
      "-an", "-vf", "scale=1280:720:flags=lanczos", "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "1200k", "-g", "15", "-row-mt", "1",
      "-deadline", "good", "-cpu-used", "4", "-pix_fmt", "yuv420p", join(OUT, "mobile", `${base}.webm`),
      // Poster: el primer cuadro (mismo ángulo con el que arranca el video)
      "-vf", "scale=1280:720:flags=lanczos", "-frames:v", "1", "-q:v", "4", join(OUT, "posters", `${base}.jpg`),
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );

const kb = (p) => `${Math.round(statSync(p).size / 1024)} KB`;
const t0 = Date.now();
for (const [k, { eq, color }] of combos.entries()) {
  const base = `p70-eq${eq}-${color.id}`;
  const label = `DEMO · Equipamiento ${eq} · ${color.nombre}`;
  const ff = encode(base);
  const done = new Promise((ok, ko) => ff.on("close", (code) => (code === 0 ? ok() : ko(new Error(`ffmpeg salió con ${code}`)))));
  const t = Date.now();
  for (let i = 0; i < FRAMES; i++) {
    const b64 = await page.evaluate(([i, n, hex, l]) => window.renderFrame(i, n, hex, l), [i, FRAMES, color.hex, label]);
    if (!ff.stdin.write(Buffer.from(b64, "base64"))) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await done;
  const d = join(OUT, "desktop", base), m = join(OUT, "mobile", base);
  console.log(
    `✓ ${String(k + 1).padStart(2)}/${combos.length} ${base.padEnd(14)} ${((Date.now() - t) / 1000).toFixed(0)} s · desktop ${kb(d + ".mp4")} / ${kb(d + ".webm")} · mobile ${kb(m + ".mp4")} / ${kb(m + ".webm")}`,
  );
}
await browser.close();
console.log(`\nListo en ${((Date.now() - t0) / 60000).toFixed(1)} min → public/media/p70/`);
