import { EstadoCarga } from './EstadoCarga';
import { formatearDiaCreacion, formatearHoras } from '../tipos';
import type { Meta } from '../tipos';

interface Props {
  metas: Meta[];
  /** Error al cargar la lista de metas. */
  error: string | null;
  onReintentar: () => void;
  /** Mensaje de la API si una reactivación se rechaza (RN-07, RN-09). */
  errorAccion: string | null;
  onReactivar: (meta: Meta) => void;
  ocupado: boolean;
}

/**
 * «Metas anteriores» (T-28): solo aparece si el juego tiene metas inactivas.
 * No hay acción para borrar metas (RN-16): solo «Reactivar».
 */
export function HistorialMetas({ metas, error, onReintentar, errorAccion, onReactivar, ocupado }: Props) {
  const inactivas = metas.filter((m) => !m.activa);
  if (!error && inactivas.length === 0) return null;

  return (
    <section className="panel progreso-seccion" aria-labelledby="titulo-historial">
      <h2 id="titulo-historial">Metas anteriores</h2>
      {error ? (
        <EstadoCarga cargando={false} error={error} onReintentar={onReintentar} />
      ) : (
        <>
          {errorAccion && (
            <p className="estado estado-error" role="alert">
              {errorAccion}
            </p>
          )}
          <ul className="historial-lista">
            {inactivas.map((meta) => (
              <li key={meta._id} className="encabezado-panel">
                <span>
                  {formatearHoras(meta.horasSemanales)} · {meta.diasPorSemana}{' '}
                  {meta.diasPorSemana === 1 ? 'día' : 'días'} · creada el {formatearDiaCreacion(meta.createdAt)}
                </span>
                <button
                  type="button"
                  className="boton boton-secundario"
                  disabled={ocupado}
                  onClick={() => onReactivar(meta)}
                >
                  Reactivar
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
