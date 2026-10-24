/** Único lugar que llama a fetch. Las páginas usan videojuegosApi.ts y partidasApi.ts. */
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export async function http<T>(ruta: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  let respuesta: Response;
  try {
    respuesta = await fetch(BASE + ruta, { ...init, headers });
  } catch {
    throw new Error('No se pudo conectar con la API. Revisa que el backend esté encendido e inténtalo de nuevo.');
  }

  if (!respuesta.ok) {
    const cuerpo: unknown = await respuesta.json().catch(() => null);
    const datos = cuerpo && typeof cuerpo === 'object' ? (cuerpo as Record<string, unknown>) : {};
    const mensaje = typeof datos.error === 'string' ? datos.error : `Error HTTP ${respuesta.status}`;
    const detalles = Array.isArray(datos.detalles) ? `: ${datos.detalles.join('; ')}` : '';
    throw new Error(mensaje + detalles);
  }

  if (respuesta.status === 204) return undefined as T;
  return respuesta.json() as Promise<T>;
}
