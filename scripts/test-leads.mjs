/**
 * Prueba de punta a punta del formulario: manda un lead de cada categoría
 * (más un caso con SUV, uno inválido y uno de spam) a /api/lead y verifica la respuesta.
 * Uso: npm run dev   (en otra terminal)   →   npm run test:leads
 * Con BASE_URL=https://... se puede correr contra el sitio publicado.
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const base = (over = {}) => ({
  respuestas: {
    aventurero: "n4",
    viaje: "offroad",
    etapa: "activo",
    inversion: "disponible",
    plazo: "proximamente",
    equipamiento: "eq3",
    origen: "instagram",
    comentario: "Prueba automática",
    vehiculo: { tipo: "camioneta", marca: "Toyota", modelo: "Hilux", anio: "2022" },
    ...over.respuestas,
  },
  contacto: { nombre: "Prueba Test", whatsapp: "0341 15 564-1103", email: "", localidad: "Rosario", provincia: "Santa Fe", ...over.contacto },
  consentimiento: true,
  seleccion: { eq: 3, color: "c5", elegida: true, ...over.seleccion },
  attrib: { utm_source: "test", utm_medium: "script", landing: "/" },
  startedAt: Date.now() - 60_000,
  ...over.extra,
});

const casos = [
  { nombre: "caliente (100)", body: base(), esperado: { status: 200, categoria: "caliente" } },
  {
    nombre: "tibio (56)",
    body: base({
      respuestas: { aventurero: "n2", etapa: "comparando", inversion: "organizando", plazo: "3a6", equipamiento: "asesoramiento", vehiculo: { tipo: "camioneta", marca: "", modelo: "", anio: "" } },
      seleccion: { eq: 2, color: "c3" },
    }),
    esperado: { status: 200, categoria: "tibio" },
  },
  {
    nombre: "frío (4)",
    body: base({ respuestas: { aventurero: "n1", etapa: "averiguando", inversion: "sin_definir", plazo: "sin_fecha", equipamiento: "eq1", vehiculo: { tipo: "camioneta" } }, seleccion: { eq: 1, color: "c1", elegida: false } }),
    esperado: { status: 200, categoria: "frio" },
  },
  {
    nombre: "SUV (no resta)",
    body: base({ respuestas: { vehiculo: { tipo: "suv", marca: "Jeep", modelo: "Compass", anio: "2021" } } }),
    esperado: { status: 200, categoria: "caliente" },
  },
  { nombre: "WhatsApp inválido", body: base({ contacto: { whatsapp: "123" } }), esperado: { status: 400 } },
  { nombre: "color inexistente", body: base({ seleccion: { color: "fucsia" } }), esperado: { status: 400 } },
  { nombre: "honeypot (spam)", body: base({ extra: { empresa: "bot s.a." } }), esperado: { status: 200, categoria: "frio" } },
];

let fallas = 0;
for (const c of casos) {
  const res = await fetch(`${BASE}/api/lead`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 250)}` },
    body: JSON.stringify(c.body),
  });
  const json = await res.json();
  const ok = res.status === c.esperado.status && (!c.esperado.categoria || json.categoria === c.esperado.categoria) && !("puntaje" in json);
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${c.nombre.padEnd(20)} → ${res.status} ${JSON.stringify(json).slice(0, 140)}`);
}
console.log(fallas ? `\n${fallas} caso(s) fallaron` : "\nTodo OK · el puntaje nunca viaja al navegador");
process.exitCode = fallas ? 1 : 0;
