/**
 * Normaliza un celular argentino a formato internacional de WhatsApp (549 + área + número).
 * Acepta las formas habituales: "341 564-1103", "0341 15 564-1103",
 * "+54 9 341 5641103", "11 2345 6789". Devuelve null si no es válido.
 */
export function normalizeArPhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("54")) d = d.slice(2);
  if (d.startsWith("9")) d = d.slice(1);
  if (d.startsWith("0")) d = d.slice(1);

  // Con el "15" local el número tiene 12 dígitos: área (2 a 4) + 15 + abonado.
  if (d.length === 12) {
    for (const areaLen of [2, 3, 4]) {
      if (d.slice(areaLen, areaLen + 2) === "15") {
        d = d.slice(0, areaLen) + d.slice(areaLen + 2);
        break;
      }
    }
  }

  // Área + abonado siempre suman 10 dígitos en Argentina y el área no empieza con 0.
  if (!/^[1-9]\d{9}$/.test(d)) return null;
  return `549${d}`;
}
