import { Partida } from '../modelos/Partida.model';
import { Videojuego } from '../modelos/Videojuego.model';
import { ApiError } from '../apiError';
import { elegirCampos } from '../validacion';

const CAMPOS = ['videojuego', 'fecha', 'duracionMinutos', 'porcentajeAvance', 'notas'] as const;

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
  const partida = new Partida(elegirCampos(body, CAMPOS));
  await partida.validate(); // 1) validación de esquema → 400
  await comprobarVideojuegoReferenciado(String(partida.videojuego)); // 2) referencia inexistente → 404
  return partida.save();
}

export async function actualizar(id: string, body: unknown) {
  const cambios = elegirCampos(body, CAMPOS, true);
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

/**
 * Resumen calculado (lógica de negocio en la capa de servicio). Se calcula en cada petición,
 * nunca se guarda, así que refleja al instante cualquier partida nueva o eliminada.
 *   totalPartidas          = cantidad de partidas del videojuego
 *   horasTotales           = suma(duracionMinutos) / 60, redondeado a 2 decimales
 *   ultimaPartida          = fecha de la partida más reciente (null si no hay partidas)
 *   porcentajeAvanceActual = porcentajeAvance de la partida más reciente (0 si no hay partidas)
 * "Más reciente" = mayor fecha; si dos partidas tienen la misma fecha, gana la registrada después.
 */
export async function resumenDeVideojuego(videojuegoId: string) {
  await exigirVideojuego(videojuegoId);
  const partidas = await Partida.find({ videojuego: videojuegoId }).sort({ fecha: -1, createdAt: -1 }).lean();

  const totalMinutos = partidas.reduce((suma, partida) => suma + (partida.duracionMinutos ?? 0), 0);
  const masReciente = partidas[0];

  return {
    totalPartidas: partidas.length,
    horasTotales: Math.round((totalMinutos / 60) * 100) / 100,
    ultimaPartida: masReciente?.fecha ? new Date(masReciente.fecha).toISOString() : null,
    porcentajeAvanceActual: masReciente?.porcentajeAvance ?? 0,
  };
}
