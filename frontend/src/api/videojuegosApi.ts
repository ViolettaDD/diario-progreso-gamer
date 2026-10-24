import { http } from './http';
import type { Resumen, Videojuego, VideojuegoInput } from '../tipos';

const BASE = '/api/videojuegos';

export async function listarVideojuegos(estado = ''): Promise<Videojuego[]> {
  const query = estado ? `?estado=${encodeURIComponent(estado)}` : '';
  return (await http<{ videojuegos: Videojuego[] }>(BASE + query)).videojuegos;
}

export async function obtenerVideojuego(id: string): Promise<Videojuego> {
  return (await http<{ videojuego: Videojuego }>(`${BASE}/${id}`)).videojuego;
}

export async function crearVideojuego(datos: VideojuegoInput): Promise<Videojuego> {
  return (await http<{ videojuego: Videojuego }>(BASE, { method: 'POST', body: JSON.stringify(datos) })).videojuego;
}

export async function actualizarVideojuego(id: string, datos: VideojuegoInput): Promise<Videojuego> {
  return (await http<{ videojuego: Videojuego }>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(datos) })).videojuego;
}

export async function eliminarVideojuego(id: string): Promise<void> {
  await http<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

/** Resumen calculado por el backend (no se calcula en el frontend). */
export async function obtenerResumen(id: string): Promise<Resumen> {
  return http<Resumen>(`${BASE}/${id}/resumen`);
}

export async function marcarLogro(id: string, logroId: string, obtenido: boolean): Promise<Videojuego> {
  const ruta = `${BASE}/${id}/logros/${logroId}`;
  return (await http<{ videojuego: Videojuego }>(ruta, { method: 'PATCH', body: JSON.stringify({ obtenido }) })).videojuego;
}
