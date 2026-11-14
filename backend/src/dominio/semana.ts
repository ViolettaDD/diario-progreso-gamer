/**
 * Semana de lunes a domingo (RN-11). Funciones puras sobre días 'AAAA-MM-DD':
 * la aritmética se hace en UTC para que ningún día se corra por la zona horaria del servidor.
 */

export interface Semana {
  inicio: string;
  fin: string;
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

function aFechaUTC(dia: string): Date {
  const [anio, mes, d] = dia.split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, d));
}

/** Suma (o resta, con n negativo) días de calendario a un día 'AAAA-MM-DD'. */
export function sumarDias(dia: string, n: number): string {
  return new Date(aFechaUTC(dia).getTime() + n * MS_POR_DIA).toISOString().slice(0, 10);
}

/** Semana (lunes a domingo, ambos incluidos) que contiene el día `hoy`. */
export function semanaDe(hoy: string): Semana {
  const diaSemana = aFechaUTC(hoy).getUTCDay(); // 0 = domingo … 6 = sábado
  const desdeLunes = (diaSemana + 6) % 7;
  const inicio = sumarDias(hoy, -desdeLunes);
  return { inicio, fin: sumarDias(inicio, 6) };
}
