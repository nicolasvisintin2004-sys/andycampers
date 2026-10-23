/**
 * Revisa los 15 videos del selector contra las especificaciones de los renders
 * (README → "Videos del selector"). Sirve para los demo y, sobre todo, para
 * controlar los renders finales de Andrés antes de subirlos al CDN.
 *
 *   npm run videos:check                       → revisa public/media/p70
 *   npm run videos:check -- --dir=entregas/p70 → revisa otra carpeta con la misma estructura
 *
 * Controla: que estén los 5 archivos de cada combinación (desktop mp4/webm,
 * mobile mp4/webm, poster jpg), duración igual en todos (8–16 s), resolución,
 * 30 fps, sin audio y menos de 4 MB por archivo.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import ffmpegPath from "ffmpeg-static";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const DIR = resolve(args.dir ?? "public/media/p70");
const cfg = readFileSync("config/p70.ts", "utf8");
const bloque = (n) => cfg.slice(cfg.indexOf(`export const ${n}`), cfg.indexOf("];", cfg.indexOf(`export const ${n}`)));
const eqs = [...bloque("equipamientos").matchAll(/\bn:\s*(\d)/g)].map((m) => m[1]);
const colores = [...bloque("colores").matchAll(/\{\s*id:\s*"([^"]+)"/g)].map((m) => m[1]);
const MAX = 4 * 1024 * 1024;

const probe = (file) => {
  let out = "";
  try {
    execFileSync(ffmpegPath, ["-hide_banner", "-i", file], { stdio: "pipe" });
  } catch (e) {
    out = String(e.stderr);
  }
  const d = out.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const v = out.match(/Video: .*?, (\d{3,5})x(\d{3,5}).*?, ([\d.]+) fps/);
  return {
    dur: d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : NaN,
    w: v ? Number(v[1]) : 0,
    h: v ? Number(v[2]) : 0,
    fps: v ? Number(v[3]) : 0,
    audio: /Audio:/.test(out),
  };
};

const problemas = [];
const duraciones = new Set();
for (const eq of eqs)
  for (const c of colores) {
    const base = `p70-eq${eq}-${c}`;
    const files = [
      ["desktop", "mp4", 1920, 1080],
      ["desktop", "webm", 1920, 1080],
      ["mobile", "mp4", 1280, 720],
      ["mobile", "webm", 1280, 720],
    ];
    for (const [res, ext, w, h] of files) {
      const f = join(DIR, res, `${base}.${ext}`);
      if (!existsSync(f)) {
        problemas.push(`${res}/${base}.${ext}: no está`);
        continue;
      }
      const p = probe(f);
      const size = statSync(f).size;
      duraciones.add(p.dur.toFixed(1));
      if (p.w !== w || p.h !== h) problemas.push(`${res}/${base}.${ext}: ${p.w}×${p.h} (esperado ${w}×${h})`);
      if (Math.round(p.fps) !== 30) problemas.push(`${res}/${base}.${ext}: ${p.fps} fps (esperado 30)`);
      if (p.audio) problemas.push(`${res}/${base}.${ext}: tiene audio (debe ir sin audio)`);
      if (!(p.dur >= 8 && p.dur <= 16.05)) problemas.push(`${res}/${base}.${ext}: dura ${p.dur.toFixed(2)} s (8 a 16 s)`);
      if (size > MAX) problemas.push(`${res}/${base}.${ext}: ${(size / 1048576).toFixed(1)} MB (máximo 4 MB)`);
    }
    if (!existsSync(join(DIR, "posters", `${base}.jpg`))) problemas.push(`posters/${base}.jpg: no está`);
  }
if (duraciones.size > 1) problemas.push(`Las duraciones no son todas iguales: ${[...duraciones].join(", ")} s`);

console.log(`${eqs.length * colores.length} combinaciones en ${DIR}`);
if (problemas.length) {
  console.log(`\n✗ ${problemas.length} problema(s):`);
  problemas.forEach((p) => console.log("  - " + p));
  process.exitCode = 1;
} else console.log(`✓ Todo en regla · duración ${[...duraciones][0]} s · sin audio · < 4 MB`);
