/**
 * Progreso de la semana actual (diagnóstico §7.3, RN-02, RN-05, RN-12, RN-18). Función pura.
 *   horasSemana       = minutos de la semana / 60, con 1 decimal
 *   diasJugadosSemana = días distintos con partida en la semana
 *   porcentajeHoras   = min(100, round(horasSemana / horasSemanales × 100)); null sin meta activa
 * Solo cuentan las partidas entre el lunes de la semana y «hoy» (las futuras se ignoran, RN-10).
 */
import type { PartidaDia } from './resumen';
import { semanaDe } from './semana';

export interface MetaSemanal {
  horasSemanales: number;
  diasPorSemana: number;
}

export interface ProgresoSemana {
  horasSemana: number;
  diasJugadosSemana: number;
  porcentajeHoras: number | null;
}

export function progresoDeSemana(
  partidas: readonly PartidaDia[],
  hoy: string,
  meta: MetaSemanal | null,
): ProgresoSemana {
  const { inicio } = semanaDe(hoy);
  const deLaSemana = partidas.filter((p) => p.dia >= inicio && p.dia <= hoy);

  const minutos = deLaSemana.reduce((suma, p) => suma + p.duracionMinutos, 0);
  const horasSemana = Math.round((minutos / 60) * 10) / 10;
  const diasJugadosSemana = new Set(deLaSemana.map((p) => p.dia)).size;
  const porcentajeHoras = meta ? Math.min(100, Math.round((horasSemana / meta.horasSemanales) * 100)) : null;

  return { horasSemana, diasJugadosSemana, porcentajeHoras };
}
