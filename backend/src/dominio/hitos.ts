/**
 * Hitos de la meta activa (RN-06, RN-15). Función pura.
 *   alcanzado = avanceActual >= porcentajeObjetivo
 *   avanceActual = porcentajeAvance de la partida más reciente hasta «hoy» (la misma regla del resumen), o 0
 * Sin meta activa no hay hitos. Se devuelven en el orden en que se guardaron. Nada de esto se guarda.
 */
import { partidaMasReciente, type PartidaDia } from './resumen';

export interface Hito {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface HitoEvaluado extends Hito {
  alcanzado: boolean;
}

export function evaluarHitos(
  meta: { hitos: readonly Hito[] } | null,
  partidas: readonly PartidaDia[],
  hoy: string,
): HitoEvaluado[] {
  if (!meta) return [];
  const avanceActual = partidaMasReciente(partidas, hoy)?.porcentajeAvance ?? 0;
  return meta.hitos.map((h) => ({
    descripcion: h.descripcion,
    porcentajeObjetivo: h.porcentajeObjetivo,
    alcanzado: avanceActual >= h.porcentajeObjetivo,
  }));
}
