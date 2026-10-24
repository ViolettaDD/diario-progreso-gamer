import { Schema, model } from 'mongoose';

export const PLATAFORMAS = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Movil'] as const;
export const GENEROS = ['accion', 'rol', 'estrategia', 'puzzle', 'deportes', 'otro'] as const;
export const ESTADOS = ['jugando', 'pausado', 'completado', 'abandonado'] as const;
export const MAX_LOGROS = 50;

/**
 * Sub-documento EMBEBIDO: un logro solo existe dentro de su videojuego,
 * se lee siempre junto con él y es una lista corta y acotada.
 */
const logroSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'Cada logro necesita un nombre'],
    trim: true,
    minlength: [1, 'El nombre del logro no puede estar vacío'],
    maxlength: [100, 'El nombre del logro admite máximo 100 caracteres'],
  },
  obtenido: { type: Boolean, default: false },
});

const videojuegoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [1, 'El nombre no puede estar vacío'],
      maxlength: [100, 'El nombre admite máximo 100 caracteres'],
    },
    plataforma: {
      type: String,
      required: [true, 'La plataforma es obligatoria'],
      enum: { values: [...PLATAFORMAS], message: 'Plataforma inválida: {VALUE}. Usa PC, PlayStation, Xbox, Switch o Movil' },
    },
    genero: {
      type: String,
      required: [true, 'El género es obligatorio'],
      enum: { values: [...GENEROS], message: 'Género inválido: {VALUE}. Usa accion, rol, estrategia, puzzle, deportes u otro' },
    },
    estado: {
      type: String,
      enum: { values: [...ESTADOS], message: 'Estado inválido: {VALUE}. Usa jugando, pausado, completado o abandonado' },
      default: 'jugando',
    },
    logros: {
      type: [logroSchema],
      default: [],
      validate: [(lista: unknown[]) => lista.length <= MAX_LOGROS, `Máximo ${MAX_LOGROS} logros por videojuego`],
    },
  },
  { timestamps: true, collection: 'videojuegos' },
);

export const Videojuego = model('Videojuego', videojuegoSchema);
