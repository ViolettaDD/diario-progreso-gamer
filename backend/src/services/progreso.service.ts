import { Meta } from '../modelos/Meta.model';
import { Videojuego } from '../modelos/Videojuego.model';
import { ApiError } from '../apiError';
import { partidasDiaDeVideojuego } from './partidas.service';
import { hoyEnEcuador } from '../dominio/fechas';
import { semanaDe } from '../dominio/semana';
import { progresoDeSemana } from '../dominio/progreso';
import { calcularRachas } from '../dominio/racha';
import { evaluarHitos } from '../dominio/hitos';

/**
 * GET /api/videojuegos/:id/progreso-semanal (diagnóstico §7.3). El servicio solo consulta:
 * «hoy» se calcula aquí en America/Guayaquil y todos los cálculos son funciones puras de dominio/.
 */
export async function progresoSemanalDeVideojuego(videojuegoId: string) {
  const existe = await Videojuego.exists({ _id: videojuegoId }); // id mal formado → CastError → 400
  if (!existe) throw new ApiError(404, 'Videojuego no encontrado');

  const [partidas, meta] = await Promise.all([
    partidasDiaDeVideojuego(videojuegoId),
    Meta.findOne({ videojuego: videojuegoId, activa: true }).lean(),
  ]);
  const hoy = hoyEnEcuador(new Date());
  const metaSemanal = meta ? { horasSemanales: meta.horasSemanales, diasPorSemana: meta.diasPorSemana } : null;
  const progreso = progresoDeSemana(partidas, hoy, metaSemanal);
  const rachas = calcularRachas(partidas, hoy);

  return {
    semana: semanaDe(hoy),
    meta: metaSemanal,
    horasSemana: progreso.horasSemana,
    porcentajeHoras: progreso.porcentajeHoras,
    diasJugadosSemana: progreso.diasJugadosSemana,
    rachaActual: rachas.rachaActual,
    mejorRacha: rachas.mejorRacha,
    hitos: evaluarHitos(meta ? { hitos: meta.hitos } : null, partidas, hoy),
  };
}
