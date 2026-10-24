import { http } from './http';
import type { Partida, PartidaInput } from '../tipos';

const BASE = '/api/partidas';

export async function listarPartidas(): Promise<Partida[]> {
  return (await http<{ partidas: Partida[] }>(BASE)).partidas;
}

/** Ruta anidada del backend: GET /api/videojuegos/:id/partidas */
export async function listarPartidasDeVideojuego(videojuegoId: string): Promise<Partida[]> {
  return (await http<{ partidas: Partida[] }>(`/api/videojuegos/${videojuegoId}/partidas`)).partidas;
}

export async function obtenerPartida(id: string): Promise<Partida> {
  return (await http<{ partida: Partida }>(`${BASE}/${id}`)).partida;
}

export async function crearPartida(datos: PartidaInput): Promise<Partida> {
  return (await http<{ partida: Partida }>(BASE, { method: 'POST', body: JSON.stringify(datos) })).partida;
}

export async function actualizarPartida(id: string, datos: Partial<PartidaInput>): Promise<Partida> {
  return (await http<{ partida: Partida }>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(datos) })).partida;
}

export async function eliminarPartida(id: string): Promise<void> {
  await http<void>(`${BASE}/${id}`, { method: 'DELETE' });
}
