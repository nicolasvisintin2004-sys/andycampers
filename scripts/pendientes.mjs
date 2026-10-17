/**
 * Lista todos los datos pendientes (carteles rojos) con archivo y línea, y
 * genera docs/pendientes.md para mandarle a Andrés.
 *
 *   npm run pendientes          → lista + docs/pendientes.md
 *   node scripts/pendientes.mjs --check
 *       Lo corre `npm run build`. Con NEXT_PUBLIC_DEMO=false (sitio publicado), si
 *       queda algún dato pendiente el build FALLA y dice cuáles: así no se publica
 *       un sitio con carteles rojos. En modo demo solo avisa.
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

const ROOTS = ["app", "components", "config", "content", "lib"];
const PATTERNS = [
  /falta\(\s*"([^"]+)"\s*\)/g, // falta("…") en datos y config
  /<Missing(?:Media)?\s+label="([^"]+)"/g, // carteles escritos directo en un componente
  /FALTA: ([A-ZÁÉÍÓÚÑ ]{3,})</g, // cotas del plano del P70
  /falta:\s*"([^"]+)"/g, // listas con espacios faltantes (ej. clips de "En acción")
];

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(name)) files.push(p);
  }
};
ROOTS.forEach(walk);

const found = new Map(); // label → [ubicaciones]
for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const re of PATTERNS) {
      for (const m of line.matchAll(re)) {
        const label = m[1].trim();
        if (label === "qué va acá" || label === "…") continue; // ejemplos en comentarios
        const at = `${relative(".", f).replaceAll("\\", "/")}:${i + 1}`;
        found.set(label, [...(found.get(label) ?? []), at]);
      }
    }
  });
}

const items = [...found.entries()].sort((a, b) => a[1][0].localeCompare(b[1][0]));
const demo = process.env.NEXT_PUBLIC_DEMO !== "false";

if (process.argv.includes("--check")) {
  if (!items.length) {
    console.log("✓ Sin datos pendientes.");
  } else if (demo) {
    console.log(`⚠ ${items.length} datos pendientes (modo demo: se muestran en rojo). Detalle: npm run pendientes`);
  } else {
    console.error(`✗ No se puede publicar: quedan ${items.length} datos pendientes y demo está en false.\n`);
    for (const [label, at] of items) console.error(`  - ${label}  (${at[0]})`);
    console.error("\nCompletalos o volvé a poner demo: true en config/site.ts.");
    process.exit(1);
  }
  process.exit(0);
}

for (const [label, at] of items) console.log(`- ${label}\n    ${at.join(", ")}`);
console.log(`\n${items.length} datos pendientes.`);

mkdirSync("docs", { recursive: true });
const md = `# Datos pendientes · landing P70

Generado con \`npm run pendientes\` el ${new Date().toLocaleDateString("es-AR")}. Cada ítem aparece en el sitio como un cartel rojo
("FALTA: …"). Se completa en el archivo indicado reemplazando \`falta("…")\` por el dato real.

${items.map(([label, at]) => `- [ ] **${label}** — \`${at[0]}\`${at.length > 1 ? ` (+${at.length - 1})` : ""}`).join("\n")}
`;
writeFileSync("docs/pendientes.md", md);
console.log("→ docs/pendientes.md");
