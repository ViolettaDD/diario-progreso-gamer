import { Schema, model } from 'mongoose';

export const MAX_HITOS = 5;

/**
 * Sub-documento EMBEBIDO: un hito solo existe dentro de su meta y la lista es corta (máximo 5).
 * Si el avance actual del juego llega a su objetivo, el hito está alcanzado (se calcula, no se guarda).
 */
const hitoSchema = new Schema(
  {
    descripcion: {
      type: String,
      required: [true, 'Cada hito necesita un texto'],
      trim: true,
      minlength: [1, 'El texto del hito no puede estar vacío'],
      maxlength: [60, 'El texto del hito admite máximo 60 caracteres'],
    },
    porcentajeObjetivo: {
      type: Number,
      required: [true, 'Cada hito necesita un porcentaje objetivo'],
      min: [1, 'El objetivo de un hito debe ser al menos 1 %'],
      max: [100, 'El objetivo de un hito debe ser como máximo 100 %'],
    },
  },
  { _id: false },
);

/**
 * Meta semanal de un videojuego (colección REFERENCIADA al videojuego, como Partida).
 * Un videojuego tiene como máximo una meta activa: lo garantiza el servicio (409) y,
 * ante dos peticiones simultáneas, el índice único parcial de abajo (E11000 → 409).
 */
const metaSchema = new Schema(
  {
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: 'Videojuego',
      required: [true, 'La meta debe indicar su videojuego'],
    },
    horasSemanales: {
      type: Number,
      required: [true, 'Las horas por semana son obligatorias'],
      validate: {
        validator: (v: number) => v > 0 && v <= 100,
        message: 'Las horas por semana deben ser mayores que 0 y como máximo 100',
      },
    },
    diasPorSemana: {
      type: Number,
      required: [true, 'Los días por semana son obligatorios'],
      validate: {
        validator: (v: number) => Number.isInteger(v) && v >= 1 && v <= 7,
        message: 'Los días por semana deben ser un número entero entre 1 y 7',
      },
    },
    activa: { type: Boolean, default: true },
    hitos: {
      type: [hitoSchema],
      default: [],
      validate: [(lista: unknown[]) => lista.length <= MAX_HITOS, `Máximo ${MAX_HITOS} hitos por meta`],
    },
  },
  { timestamps: true, collection: 'metas' },
);

// Red de seguridad de RN-09: solo puede existir una meta con activa = true por videojuego.
metaSchema.index({ videojuego: 1 }, { unique: true, partialFilterExpression: { activa: true } });

export const Meta = model('Meta', metaSchema);
