import { Partida } from '../modelos/Partida.model';
import { Videojuego } from '../modelos/Videojuego.model';
import { ApiError } from '../apiError';
import { elegirCampos } from '../validacion';
import { esFechaCalendario, esFutura, hoyEnEcuador } from '../dominio/fechas';
import { calcularResumen, type PartidaDia } from '../dominio/resumen';

const CAMPOS = ['videojuego', 'fecha', 'duracionMinutos', 'porcentajeAvance', 'notas'] as const;

/**
 * La fecha de una partida es un día de calendario 'AAAA-MM-DD' (se guarda a medianoche UTC)
 * y no puede ser posterior al «hoy» de America/Guayaquil. Si no viene, decide el esquema.
 */
function validarFecha(fecha: unknown) {
  if (fecha === undefined) return;
  if (!esFechaCalendario(fecha)) {
    throw new ApiError(400, 'La fecha debe ser un día de calendario válido con formato AAAA-MM-DD');
  }
  const hoy = hoyEnEcuador(new Date());
  if (esFutura(fecha, hoy)) {
    throw new ApiError(400, `La fecha no puede ser posterior a hoy (${hoy})`);
  }
}

/** Validación de referencia: el videojuego indicado debe existir (404 si no existe). */
async function comprobarVideojuegoReferenciado(id: string) {
  const existe = await Videojuego.exists({ _id: id }); // id mal formado → CastError → 400
  if (!existe) throw new ApiError(404, `El videojuego referenciado no existe: ${id}`, 'referencia_inexistente');
}

async function exigirVideojuego(id: string) {
  const existe = await Videojuego.exists({ _id: id });
  if (!existe) throw new ApiError(404, 'Videojuego no encontrado');
}

export async function listar() {
  return Partida.find().populate('videojuego').sort({ fecha: -1, createdAt: -1 });
}

/** Ruta anidada: GET /api/videojuegos/:id/partidas */
export async function listarPorVideojuego(videojuegoId: string) {
  await exigirVideojuego(videojuegoId);
  return Partida.find({ videojuego: videojuegoId }).sort({ fecha: -1, createdAt: -1 });
}

export async function obtener(id: string) {
  const partida = await Partida.findById(id).populate('videojuego');
  if (!partida) throw new ApiError(404, 'Partida no encontrada');
  return partida;
}

export async function crear(body: unknown) {
  const datos = elegirCampos(body, CAMPOS);
  validarFecha(datos.fecha); // formato AAAA-MM-DD y no futura → 400
  const partida = new Partida(datos);
  await partida.validate(); // 1) validación de esquema → 400
  await comprobarVideojuegoReferenciado(String(partida.videojuego)); // 2) referencia inexistente → 404
  return partida.save();
}

export async function actualizar(id: string, body: unknown) {
  const cambios = elegirCampos(body, CAMPOS, true);
  validarFecha(cambios.fecha); // formato AAAA-MM-DD y no futura → 400
  if (cambios.videojuego !== undefined) {
    await comprobarVideojuegoReferenciado(String(cambios.videojuego));
  }
  const partida = await Partida.findByIdAndUpdate(id, { $set: cambios }, { new: true, runValidators: true });
  if (!partida) throw new ApiError(404, 'Partida no encontrada');
  return partida;
}

export async function eliminar(id: string) {
  const partida = await Partida.findByIdAndDelete(id);
  if (!partida) throw new ApiError(404, 'Partida no encontrada');
}

/** Partidas de un videojuego en la forma que usa el dominio (el día sale de la parte de fecha en UTC). */
export async function partidasDiaDeVideojuego(videojuegoId: string): Promise<PartidaDia[]> {
  const partidas = await Partida.find({ videojuego: videojuegoId }).lean();
  return partidas.map((p) => ({
    dia: new Date(p.fecha).toISOString().slice(0, 10),
    duracionMinutos: p.duracionMinutos ?? 0,
    porcentajeAvance: p.porcentajeAvance ?? 0,
    createdAt: new Date(p.createdAt),
  }));
}

/** Resumen calculado en cada petición (nunca se guarda). La fórmula vive en dominio/resumen.ts. */
export async function resumenDeVideojuego(videojuegoId: string) {
  await exigirVideojuego(videojuegoId);
  return calcularResumen(await partidasDiaDeVideojuego(videojuegoId), hoyEnEcuador(new Date()));
}
