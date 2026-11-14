import { EstadoCarga } from './EstadoCarga';
import { formatearHoras } from '../tipos';
import type { Estado, ProgresoSemanal } from '../tipos';

const SEGMENTOS = 10;

/** Las fechas de la semana llegan del backend como AAAA-MM-DD; se leen en UTC para no correr el día. */
const formatoMes = new Intl.DateTimeFormat('es-EC', { timeZone: 'UTC', month: 'long' });

function partesDia(dia: string): { numero: number; mes: string } {
  return { numero: Number(dia.slice(8, 10)), mes: formatoMes.format(new Date(`${dia}T00:00:00.000Z`)) };
}

/** «Semana del 9 al 15 de noviembre» o, si cruza de mes, «Semana del 30 de noviembre al 6 de diciembre». */
function textoSemana({ inicio, fin }: ProgresoSemanal['semana']): string {
  const a = partesDia(inicio);
  const b = partesDia(fin);
  return a.mes === b.mes
    ? `Semana del ${a.numero} al ${b.numero} de ${b.mes}`
    : `Semana del ${a.numero} de ${a.mes} al ${b.numero} de ${b.mes}`;
}

function dias(n: number): string {
  return n === 1 ? 'día' : 'días';
}

interface Props {
  progreso: ProgresoSemanal | null;
  cargando: boolean;
  error: string | null;
  onReintentar: () => void;
  /** Estado del juego, para el aviso de RN-19 (T-26). */
  estadoJuego: Estado;
}

/**
 * Sección «Esta semana» del detalle (T-25). Solo muestra lo que calcula el backend:
 * la única operación es Math.round(porcentajeHoras / 10) para los segmentos de la barra.
 */
export function SeccionProgreso({ progreso, cargando, error, onReintentar, estadoJuego }: Props) {
  return (
    <section className="panel progreso-seccion" aria-labelledby="titulo-progreso">
      <h2 id="titulo-progreso">Esta semana</h2>
      {error || !progreso ? (
        <EstadoCarga cargando={cargando} error={error} onReintentar={onReintentar} />
      ) : (
        <ContenidoProgreso progreso={progreso} estadoJuego={estadoJuego} />
      )}
    </section>
  );
}

function ContenidoProgreso({ progreso, estadoJuego }: { progreso: ProgresoSemanal; estadoJuego: Estado }) {
  const { meta, porcentajeHoras } = progreso;
  const conMeta = meta !== null && porcentajeHoras !== null;
  const juegoTerminado = estadoJuego === 'completado' || estadoJuego === 'abandonado';

  return (
    <>
      <p className="progreso-semana">{textoSemana(progreso.semana)}</p>

      {conMeta && juegoTerminado && (
        <p className="estado meta-aviso" role="status">
          Este juego está {estadoJuego} y su meta sigue activa. Desactívala cuando ya no la necesites.
        </p>
      )}

      <dl className="resumen-datos progreso-datos">
        <div>
          <dt>Horas</dt>
          <dd>
            {conMeta
              ? `${formatearHoras(progreso.horasSemana)} de ${formatearHoras(meta.horasSemanales)}`
              : `${formatearHoras(progreso.horasSemana)} esta semana`}
          </dd>
        </div>
        {conMeta && (
          <div>
            <dt>Meta de horas</dt>
            <dd>{porcentajeHoras} %</dd>
          </div>
        )}
        <div>
          <dt>Días</dt>
          <dd>
            {conMeta
              ? `${progreso.diasJugadosSemana} de ${meta.diasPorSemana} ${dias(meta.diasPorSemana)}`
              : `${progreso.diasJugadosSemana} ${progreso.diasJugadosSemana === 1 ? 'día jugado' : 'días jugados'}`}
          </dd>
        </div>
      </dl>

      {conMeta && (
        <div
          className="xp"
          role="progressbar"
          aria-label="Horas de la semana"
          aria-valuenow={porcentajeHoras}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {Array.from({ length: SEGMENTOS }, (_, i) => (
            <span key={i} className={i < Math.round(porcentajeHoras / 10) ? 'xp-segmento xp-lleno' : 'xp-segmento'} />
          ))}
        </div>
      )}

      <dl className="resumen-datos progreso-datos">
        <div>
          <dt>Racha actual</dt>
          <dd>
            <span className="resumen-porcentaje progreso-cifra">{progreso.rachaActual}</span>{' '}
            {dias(progreso.rachaActual)}
          </dd>
        </div>
        <div>
          <dt>Mejor racha</dt>
          <dd>
            <span className="resumen-porcentaje progreso-cifra">{progreso.mejorRacha}</span> {dias(progreso.mejorRacha)}
          </dd>
        </div>
      </dl>

      {conMeta && progreso.hitos.length > 0 && (
        <>
          <h3>Hitos</h3>
          <ul className="hito-lista">
            {progreso.hitos.map((hito, i) => (
              <li key={i}>
                {hito.descripcion} · {hito.porcentajeObjetivo} % ·{' '}
                <strong className={hito.alcanzado ? 'hito-alcanzado' : 'hito-pendiente'}>
                  {hito.alcanzado ? 'Alcanzado' : 'Pendiente'}
                </strong>
              </li>
            ))}
          </ul>
        </>
      )}

      {!conMeta && (
        <p className="estado estado-vacio">Aún no tienes una meta para este juego. Crea una para seguir tu semana.</p>
      )}
    </>
  );
}
