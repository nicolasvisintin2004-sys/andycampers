/**
 * Función programada de Netlify: todos los lunes a las 9:00 de Argentina
 * (12:00 UTC; Argentina no tiene horario de verano) llama al endpoint del
 * resumen semanal con el secreto compartido.
 */
export default async () => {
  const base = process.env.URL; // URL pública del sitio, la define Netlify
  const res = await fetch(`${base}/api/cron/weekly-summary`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  console.log("weekly-summary", res.status, await res.text());
};

export const config = { schedule: "0 12 * * 1" };
