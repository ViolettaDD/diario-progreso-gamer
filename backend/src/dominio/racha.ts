/**
 * Rachas (RN-01, RN-02, RN-20). Función pura sobre días 'AAAA-MM-DD' de todo el historial del juego.
 *   rachaActual = días seguidos que terminan hoy (si hoy hay partida) o ayer (si no); 0 si el último día jugado es anterior a ayer
 *   mejorRacha  = secuencia más larga de días seguidos del historial (siempre ≥ rachaActual)
 * Varias partidas el mismo día cuentan como un día; las de días posteriores a «hoy» se ignoran (RN-10).
 */
import { sumarDias } from './semana';

export interface Rachas {
  rachaActual: number;
  mejorRacha: number;
}

export function calcularRachas(partidas: readonly { dia: string }[], hoy: string): Rachas {
  const dias = [...new Set(partidas.map((p) => p.dia).filter((dia) => dia <= hoy))].sort();
  if (dias.length === 0) return { rachaActual: 0, mejorRacha: 0 };

  let mejorRacha = 1;
  let tramo = 1;
  for (let i = 1; i < dias.length; i++) {
    tramo = dias[i] === sumarDias(dias[i - 1], 1) ? tramo + 1 : 1;
    mejorRacha = Math.max(mejorRacha, tramo);
  }

  const ultimo = dias[dias.length - 1];
  const sigueViva = ultimo === hoy || ultimo === sumarDias(hoy, -1);
  // Si sigue viva, el último tramo recorrido (el que termina en `ultimo`) es la racha actual.
  const rachaActual = sigueViva ? tramo : 0;

  return { rachaActual, mejorRacha };
}
