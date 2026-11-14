/**
 * Qué estados de un videojuego admiten una meta activa (RN-07). Función pura.
 * Lista propia de estados: el dominio no importa nada de modelos/ (los modelos importan Mongoose).
 */
export const ESTADOS_CON_META_ACTIVA = ['jugando', 'pausado'] as const;

export function puedeTenerMetaActiva(estado: string): boolean {
  return (ESTADOS_CON_META_ACTIVA as readonly string[]).includes(estado);
}
