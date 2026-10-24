import { ApiError } from './apiError';

const PATRON_OBJECT_ID = /^[a-f\d]{24}$/i;

/** Exige que el cuerpo de la petición sea un objeto JSON. */
export function exigirObjeto(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Se requiere un objeto JSON en el cuerpo');
  }
  return body as Record<string, unknown>;
}

/** Lista blanca: copia solo los campos permitidos (evita operadores y campos internos como _id). */
export function elegirCampos(body: unknown, permitidos: readonly string[], exigirAlguno = false): Record<string, unknown> {
  const datos = exigirObjeto(body);
  const resultado: Record<string, unknown> = {};
  for (const campo of permitidos) {
    if (campo in datos) resultado[campo] = datos[campo];
  }
  if (exigirAlguno && Object.keys(resultado).length === 0) {
    throw new ApiError(400, `El cuerpo no contiene campos válidos. Permitidos: ${permitidos.join(', ')}`);
  }
  return resultado;
}

/** Comprueba el formato de un ObjectId cuando Mongoose no lo valida por nosotros. */
export function exigirObjectId(valor: string, descripcion: string): string {
  if (!PATRON_OBJECT_ID.test(valor)) {
    throw new ApiError(400, `Identificador mal formado para ${descripcion}: ${valor}`, 'id_mal_formado');
  }
  return valor;
}

/** Lee un parámetro de query opcional de tipo texto. */
export function queryTexto(valor: unknown): string | undefined {
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string') throw new ApiError(400, 'Filtro inválido');
  return valor.trim() || undefined;
}
