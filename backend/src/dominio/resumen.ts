/**
 * Resumen de un videojuego (deuda P5). Funciones puras: sin Mongoose y sin leer la hora del sistema.
 *   totalPartidas          = cantidad de partidas hasta «hoy»
 *   horasTotales           = suma(duracionMinutos) / 60, redondeado a 2 decimales
 *   ultimaPartida          = día de la partida más reciente en ISO (medianoche UTC), o null
 *   porcentajeAvanceActual = porcentajeAvance de la partida más reciente, o 0
 * Las partidas con día posterior a «hoy» no cuentan (RN-10).
 */

/** Partida tal como la usa el dominio: su día de calendario 'AAAA-MM-DD' y los datos que entran en los cálculos. */
export interface PartidaDia {
  dia: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  createdAt: Date;
}

export interface Resumen {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number;
}

/** Partidas con día igual o anterior a `hoy` ('AAAA-MM-DD'). */
export function partidasHastaHoy<T extends { dia: string }>(partidas: readonly T[], hoy: string): T[] {
  return partidas.filter((p) => p.dia <= hoy);
}

/** Partida más reciente hasta `hoy`: mayor día y, si empatan, la registrada después (mayor createdAt). */
export function partidaMasReciente(partidas: readonly PartidaDia[], hoy: string): PartidaDia | null {
  let reciente: PartidaDia | null = null;
  for (const p of partidasHastaHoy(partidas, hoy)) {
    if (
      !reciente ||
      p.dia > reciente.dia ||
      (p.dia === reciente.dia && p.createdAt.getTime() > reciente.createdAt.getTime())
    ) {
      reciente = p;
    }
  }
  return reciente;
}

export function calcularResumen(partidas: readonly PartidaDia[], hoy: string): Resumen {
  const validas = partidasHastaHoy(partidas, hoy);
  const totalMinutos = validas.reduce((suma, p) => suma + p.duracionMinutos, 0);
  const reciente = partidaMasReciente(validas, hoy);
  return {
    totalPartidas: validas.length,
    horasTotales: Math.round((totalMinutos / 60) * 100) / 100,
    ultimaPartida: reciente ? `${reciente.dia}T00:00:00.000Z` : null,
    porcentajeAvanceActual: reciente ? reciente.porcentajeAvance : 0,
  };
}
