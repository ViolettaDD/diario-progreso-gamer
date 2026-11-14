import { http } from './http';
import type { Meta, MetaInput, ProgresoSemanal } from '../tipos';

const BASE = '/api/metas';

export async function crearMeta(datos: MetaInput): Promise<Meta> {
  return (await http<{ meta: Meta }>(BASE, { method: 'POST', body: JSON.stringify(datos) })).meta;
}

export async function obtenerMeta(id: string): Promise<Meta> {
  return (await http<{ meta: Meta }>(`${BASE}/${id}`)).meta;
}

/** PUT: solo horasSemanales, diasPorSemana, hitos y activa. Reactivar = { activa: true }. */
export async function actualizarMeta(id: string, datos: Partial<MetaInput>): Promise<Meta> {
  return (await http<{ meta: Meta }>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(datos) })).meta;
}

export async function desactivarMeta(id: string): Promise<Meta> {
  return (await http<{ meta: Meta }>(`${BASE}/${id}/desactivar`, { method: 'PATCH' })).meta;
}

/** Ruta anidada del backend: GET /api/videojuegos/:id/metas (activas e inactivas, la más reciente primero). */
export async function listarMetasDeVideojuego(videojuegoId: string): Promise<Meta[]> {
  return (await http<{ metas: Meta[] }>(`/api/videojuegos/${videojuegoId}/metas`)).metas;
}

/** Progreso de la semana actual calculado por el backend (el frontend no recalcula nada). */
export async function obtenerProgresoSemanal(videojuegoId: string): Promise<ProgresoSemanal> {
  return http<ProgresoSemanal>(`/api/videojuegos/${videojuegoId}/progreso-semanal`);
}
