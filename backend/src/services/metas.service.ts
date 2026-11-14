import { Meta } from '../modelos/Meta.model';
import { Videojuego } from '../modelos/Videojuego.model';
import { ApiError } from '../apiError';
import { elegirCampos } from '../validacion';
import { puedeTenerMetaActiva } from '../dominio/meta';

const CAMPOS_CREAR = ['videojuego', 'horasSemanales', 'diasPorSemana', 'hitos', 'activa'] as const;

export const MENSAJE_YA_HAY_META_ACTIVA =
  'Este juego ya tiene una meta activa. Edítala o desactívala antes de crear otra';
export const MENSAJE_ESTADO_SIN_META = 'Solo los juegos en estado jugando o pausado pueden tener una meta activa';

/**
 * Reglas para que una meta quede activa en un videojuego (409 "conflicto" si no se cumplen):
 *   RN-07: el juego debe estar «jugando» o «pausado».
 *   RN-09: no puede haber otra meta activa del mismo juego (se excluye la propia meta).
 */
async function exigirPuedeQuedarActiva(videojuegoId: unknown, estado: string, excluirMetaId?: unknown) {
  if (!puedeTenerMetaActiva(estado)) throw new ApiError(409, MENSAJE_ESTADO_SIN_META);
  const filtro: Record<string, unknown> = { videojuego: videojuegoId, activa: true };
  if (excluirMetaId !== undefined) filtro._id = { $ne: excluirMetaId };
  if (await Meta.exists(filtro)) throw new ApiError(409, MENSAJE_YA_HAY_META_ACTIVA);
}

export async function obtener(id: string) {
  const meta = await Meta.findById(id); // id mal formado → CastError → 400
  if (!meta) throw new ApiError(404, 'Meta no encontrada');
  return meta;
}

export async function crear(body: unknown) {
  const meta = new Meta(elegirCampos(body, CAMPOS_CREAR));
  await meta.validate(); // 1) validación de esquema → 400
  const juego = await Videojuego.findById(meta.videojuego); // 2) referencia inexistente → 404
  if (!juego)
    throw new ApiError(
      404,
      `El videojuego referenciado no existe: ${String(meta.videojuego)}`,
      'referencia_inexistente',
    );
  // 3) RN-07 y RN-09 solo aplican a metas activas (crear una meta inactiva no las dispara).
  if (meta.activa) await exigirPuedeQuedarActiva(juego._id, juego.estado);
  return meta.save(); // el índice único parcial cubre la carrera entre dos peticiones (E11000 → 409)
}

const CAMPOS_EDITAR = ['horasSemanales', 'diasPorSemana', 'hitos', 'activa'] as const;

/**
 * PUT: solo horasSemanales, diasPorSemana, hitos y activa (videojuego y cualquier otro campo se ignoran).
 * Se carga y se guarda con save() para que corran todas las validaciones y el recorte de los hitos.
 * «Reactivar» es pasar activa de false a true: solo entonces aplican RN-07 y RN-09.
 */
export async function actualizar(id: string, body: unknown) {
  const cambios = elegirCampos(body, CAMPOS_EDITAR, true);
  const meta = await obtener(id);
  const reactivando = meta.activa === false && cambios.activa === true;
  meta.set(cambios);
  await meta.validate(); // → 400
  if (reactivando) {
    const juego = await Videojuego.findById(meta.videojuego);
    if (!juego) throw new ApiError(404, 'Videojuego no encontrado');
    await exigirPuedeQuedarActiva(juego._id, juego.estado, meta._id);
  }
  return meta.save();
}

/** PATCH /desactivar: deja la meta inactiva; si ya lo estaba, responde igual sin cambiar nada. */
export async function desactivar(id: string) {
  const meta = await obtener(id);
  if (meta.activa) {
    meta.activa = false;
    await meta.save();
  }
  return meta;
}

/** Ruta anidada GET /api/videojuegos/:id/metas: activas e inactivas, la más reciente primero (historial). */
export async function listarPorVideojuego(videojuegoId: string) {
  const existe = await Videojuego.exists({ _id: videojuegoId }); // id mal formado → CastError → 400
  if (!existe) throw new ApiError(404, 'Videojuego no encontrado');
  return Meta.find({ videojuego: videojuegoId }).sort({ createdAt: -1, _id: -1 });
}
