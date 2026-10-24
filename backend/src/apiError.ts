export type TipoError = 'validacion' | 'id_mal_formado' | 'no_encontrado' | 'referencia_inexistente' | 'interno';

/** Error controlado por la API: lleva el status HTTP y un tipo legible para el cliente. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public tipo: TipoError = status === 404 ? 'no_encontrado' : status >= 500 ? 'interno' : 'validacion',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
