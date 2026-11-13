/**
 * Fechas de calendario (deuda P2). Funciones puras: sin Mongoose y sin leer la hora del sistema.
 * Un día se representa como texto 'AAAA-MM-DD'; «hoy» siempre llega por parámetro.
 */

const PATRON_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;
const ZONA_ECUADOR = 'America/Guayaquil';

const formatoEcuador = new Intl.DateTimeFormat('en-US', {
  timeZone: ZONA_ECUADOR,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** true si el valor es exactamente 'AAAA-MM-DD' y ese día existe en el calendario (2026-02-30 no existe). */
export function esFechaCalendario(valor: unknown): valor is string {
  if (typeof valor !== 'string') return false;
  const partes = PATRON_DIA.exec(valor);
  if (!partes) return false;
  const [anio, mes, dia] = partes.slice(1).map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
}

/** Día de calendario ('AAAA-MM-DD') que corresponde al instante recibido en America/Guayaquil. */
export function hoyEnEcuador(instante: Date): string {
  const partes = formatoEcuador.formatToParts(instante);
  const valor = (tipo: Intl.DateTimeFormatPartTypes) => partes.find((p) => p.type === tipo)?.value ?? '';
  return `${valor('year')}-${valor('month')}-${valor('day')}`;
}

/** true si el día `fecha` es posterior a `hoy`. Ambos en 'AAAA-MM-DD', que se comparan bien como texto. */
export function esFutura(fecha: string, hoy: string): boolean {
  return fecha > hoy;
}
