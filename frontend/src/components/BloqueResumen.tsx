import type { Resumen } from '../tipos';
import { formatearFecha } from '../tipos';

const SEGMENTOS = 10;

/** Bloque del resumen calculado por el backend (GET /api/videojuegos/:id/resumen). */
export function BloqueResumen({ resumen }: { resumen: Resumen }) {
  const llenos = Math.round(resumen.porcentajeAvanceActual / (100 / SEGMENTOS));

  return (
    <section className="resumen" aria-labelledby="titulo-resumen">
      <div className="resumen-cabecera">
        <h2 id="titulo-resumen">Tu progreso</h2>
        <p className="resumen-porcentaje">{resumen.porcentajeAvanceActual}%</p>
      </div>

      <div
        className="xp"
        role="progressbar"
        aria-label="Avance actual"
        aria-valuenow={resumen.porcentajeAvanceActual}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: SEGMENTOS }, (_, i) => (
          <span key={i} className={i < llenos ? 'xp-segmento xp-lleno' : 'xp-segmento'} />
        ))}
      </div>

      <dl className="resumen-datos">
        <div>
          <dt>Partidas jugadas</dt>
          <dd>{resumen.totalPartidas}</dd>
        </div>
        <div>
          <dt>Horas totales</dt>
          <dd>{resumen.horasTotales} h</dd>
        </div>
        <div>
          <dt>Última partida</dt>
          <dd>{resumen.ultimaPartida ? formatearFecha(resumen.ultimaPartida) : 'Sin partidas'}</dd>
        </div>
        <div>
          <dt>Avance actual</dt>
          <dd>{resumen.porcentajeAvanceActual}%</dd>
        </div>
      </dl>
      <p className="nota">El servidor recalcula este resumen con todas tus partidas cada vez que abres el juego.</p>
    </section>
  );
}
