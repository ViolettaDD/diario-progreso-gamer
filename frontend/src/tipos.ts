export const PLATAFORMAS = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Movil'] as const;
export const GENEROS = ['accion', 'rol', 'estrategia', 'puzzle', 'deportes', 'otro'] as const;
export const ESTADOS = ['jugando', 'pausado', 'completado', 'abandonado'] as const;

export type Plataforma = (typeof PLATAFORMAS)[number];
export type Genero = (typeof GENEROS)[number];
export type Estado = (typeof ESTADOS)[number];

export const ETIQUETAS_PLATAFORMA: Record<Plataforma, string> = {
  PC: 'PC',
  PlayStation: 'PlayStation',
  Xbox: 'Xbox',
  Switch: 'Switch',
  Movil: 'Móvil',
};

export const ETIQUETAS_GENERO: Record<Genero, string> = {
  accion: 'Acción',
  rol: 'Rol',
  estrategia: 'Estrategia',
  puzzle: 'Puzzle',
  deportes: 'Deportes',
  otro: 'Otro',
};

export const ETIQUETAS_ESTADO: Record<Estado, string> = {
  jugando: 'Jugando',
  pausado: 'Pausado',
  completado: 'Completado',
  abandonado: 'Abandonado',
};

export interface Logro {
  _id: string;
  nombre: string;
  obtenido: boolean;
}

export interface Videojuego {
  _id: string;
  nombre: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: Estado;
  logros: Logro[];
  createdAt: string;
  updatedAt: string;
}

export interface LogroInput {
  _id?: string;
  nombre: string;
  obtenido: boolean;
}

export interface VideojuegoInput {
  nombre: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: Estado;
  logros: LogroInput[];
}

export interface Partida {
  _id: string;
  /** Objeto cuando la API hace populate; id cuando no; null si el videojuego ya no existe. */
  videojuego: Videojuego | string | null;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartidaInput {
  videojuego: string;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas: string;
}

/** Forma exacta de GET /api/videojuegos/:id/resumen */
export interface Resumen {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number;
}

export function nombreVideojuego(v: Partida['videojuego']): string {
  if (v === null) return 'Videojuego eliminado';
  return typeof v === 'string' ? `Videojuego ${v}` : v.nombre;
}

export function idVideojuego(v: Partida['videojuego']): string {
  if (v === null) return '';
  return typeof v === 'string' ? v : v._id;
}

/** Las fechas se guardan como medianoche UTC; se muestran en UTC para no correr el día. */
export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-EC', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' });
}

/** Fecha local de hoy en formato YYYY-MM-DD (valor por defecto del formulario de partida). */
export function hoyISO(): string {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function mensajeDeError(e: unknown, porDefecto: string): string {
  return e instanceof Error ? e.message : porDefecto;
}
