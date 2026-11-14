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
