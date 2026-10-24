import { Schema, model } from 'mongoose';

/**
 * Colección REFERENCIADA: cada partida apunta a su videojuego por ObjectId.
 * Crece sin límite y se consulta también por separado (GET /api/partidas).
 */
const partidaSchema = new Schema(
  {
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: 'Videojuego',
      required: [true, 'La partida debe indicar su videojuego'],
    },
    fecha: { type: Date, required: [true, 'La fecha es obligatoria'] },
    duracionMinutos: {
      type: Number,
      required: [true, 'La duración en minutos es obligatoria'],
      min: [1, 'La duración mínima es 1 minuto'],
      max: [1440, 'La duración máxima es 1440 minutos (24 horas)'],
    },
    porcentajeAvance: {
      type: Number,
      required: [true, 'El porcentaje de avance es obligatorio'],
      min: [0, 'El porcentaje de avance mínimo es 0'],
      max: [100, 'El porcentaje de avance máximo es 100'],
    },
    notas: { type: String, trim: true, maxlength: [500, 'Las notas admiten máximo 500 caracteres'], default: '' },
  },
  { timestamps: true, collection: 'partidas' },
);

// Acelera la ruta anidada y el resumen: partidas de un videojuego ordenadas por fecha.
partidaSchema.index({ videojuego: 1, fecha: -1 });

export const Partida = model('Partida', partidaSchema);
