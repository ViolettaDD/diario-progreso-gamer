import { Videojuego, ESTADOS } from '../modelos/Videojuego.model';
import { Partida } from '../modelos/Partida.model';
import { ApiError } from '../apiError';
import { elegirCampos, exigirObjeto, exigirObjectId } from '../validacion';

const CAMPOS = ['nombre', 'plataforma', 'genero', 'estado', 'logros'] as const;

export async function listar(estado?: string) {
  if (estado && !(ESTADOS as readonly string[]).includes(estado)) {
    throw new ApiError(400, `Filtro de estado inválido. Usa: ${ESTADOS.join(', ')}`);
  }
  return Videojuego.find(estado ? { estado } : {}).sort({ updatedAt: -1, _id: -1 });
}

export async function obtener(id: string) {
  const juego = await Videojuego.findById(id); // id mal formado → CastError → 400
  if (!juego) throw new ApiError(404, 'Videojuego no encontrado');
  return juego;
}

export async function crear(body: unknown) {
  return Videojuego.create(elegirCampos(body, CAMPOS));
}

export async function actualizar(id: string, body: unknown) {
  const cambios = elegirCampos(body, CAMPOS, true);
  const juego = await Videojuego.findByIdAndUpdate(id, { $set: cambios }, { new: true, runValidators: true });
  if (!juego) throw new ApiError(404, 'Videojuego no encontrado');
  return juego;
}

/** Elimina el videojuego y, en cascada, sus partidas para no dejar referencias huérfanas. */
export async function eliminar(id: string) {
  await obtener(id);
  await Partida.deleteMany({ videojuego: id });
  await Videojuego.findByIdAndDelete(id);
}

/** Actualización de un sub-documento embebido: marcar o desmarcar un logro como obtenido. */
export async function actualizarLogro(id: string, logroId: string, body: unknown) {
  const datos = exigirObjeto(body);
  if (typeof datos.obtenido !== 'boolean') {
    throw new ApiError(400, 'El campo "obtenido" debe ser true o false');
  }
  exigirObjectId(logroId, 'el logro');

  const juego = await obtener(id);
  const logros = (juego.toObject() as unknown as { logros: Array<{ _id: unknown }> }).logros;
  const indice = logros.findIndex((logro) => String(logro._id) === logroId);
  if (indice === -1) throw new ApiError(404, 'Logro no encontrado en este videojuego');

  juego.set(`logros.${indice}.obtenido`, datos.obtenido);
  await juego.save();
  return juego;
}
