/**
 * Genera las descargas del pie de la página a partir de las páginas internas
 * /descargas/* (que leen config/p70.ts y content/faq.ts):
 *   - public/descargas/andycampers-p70-preguntas-frecuentes.pdf (A4)
 *   - public/descargas/andycampers-p70-{nivel}.jpg, una por nivel (1080×1920, para el celular)
 *
 * Uso (con el sitio corriendo): npm run build && npm run start   →   npm run descargas
 *   BASE_URL=http://localhost:3101 npm run descargas   (otro puerto)
 * Volver a correrlo cada vez que cambien los niveles, los precios o las preguntas.
 * Necesita Google Chrome instalado (canal "chrome" de Playwright).
 */
import { mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "descargas");
const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const kb = (p) => `${Math.round(statSync(p).size / 1024)} KB`;
const listo = async (page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15_000 });
};

// PDF de preguntas frecuentes
{
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.goto(`${BASE}/descargas/preguntas`, { waitUntil: "networkidle" });
  await listo(page);
  const f = join(OUT, "andycampers-p70-preguntas-frecuentes.pdf");
  await page.pdf({ path: f, format: "A4", printBackground: true, preferCSSPageSize: true });
  console.log(`✓ ${f.replace(ROOT, ".")} · ${kb(f)}`);
  await page.close();
}

// Catálogo: una imagen por nivel
{
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/descargas/catalogo`, { waitUntil: "networkidle" });
  const niveles = await page.$$eval("[data-nivel]", (as) => as.map((a) => a.getAttribute("data-nivel")));
  for (const n of niveles) {
    await page.goto(`${BASE}/descargas/catalogo/${n}`, { waitUntil: "networkidle" });
    await listo(page);
    const f = join(OUT, `andycampers-p70-${n}.jpg`);
    await page.locator("[data-pieza]").screenshot({ path: f, type: "jpeg", quality: 88 });
    console.log(`✓ ${f.replace(ROOT, ".")} · ${kb(f)}`);
  }
  await page.close();
}

await browser.close();
