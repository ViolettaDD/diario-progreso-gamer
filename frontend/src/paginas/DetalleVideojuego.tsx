import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { eliminarVideojuego, marcarLogro, obtenerResumen, obtenerVideojuego } from '../api/videojuegosApi';
import { eliminarPartida, listarPartidasDeVideojuego } from '../api/partidasApi';
import { EstadoCarga } from '../components/EstadoCarga';
import { BloqueResumen } from '../components/BloqueResumen';
import { ETIQUETAS_ESTADO, ETIQUETAS_GENERO, ETIQUETAS_PLATAFORMA, formatearFecha, mensajeDeError } from '../tipos';
import type { Logro, Partida, Resumen, Videojuego } from '../tipos';

export function DetalleVideojuego() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [juego, setJuego] = useState<Videojuego | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    Promise.all([obtenerVideojuego(id), obtenerResumen(id), listarPartidasDeVideojuego(id)])
      .then(([v, r, p]) => {
        if (!vigente) return;
        setJuego(v);
        setResumen(r);
        setPartidas(p);
      })
      .catch((e: unknown) => {
        if (vigente) setError(mensajeDeError(e, 'No se pudo cargar el videojuego.'));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [id, recarga]);

  /** Vuelve a pedir resumen y partidas al backend (tras eliminar una partida). */
  async function refrescarProgreso() {
    const [r, p] = await Promise.all([obtenerResumen(id), listarPartidasDeVideojuego(id)]);
    setResumen(r);
    setPartidas(p);
  }

  async function alternarLogro(logro: Logro) {
    setOcupado(true);
    setAviso(null);
    try {
      setJuego(await marcarLogro(id, logro._id, !logro.obtenido));
    } catch (e) {
      setAviso(mensajeDeError(e, 'No se pudo actualizar el logro.'));
    } finally {
      setOcupado(false);
    }
  }

  async function borrarPartida(partida: Partida) {
    if (!window.confirm(`¿Eliminar la partida del ${formatearFecha(partida.fecha)}?`)) return;
    setOcupado(true);
    setAviso(null);
    try {
      await eliminarPartida(partida._id);
      await refrescarProgreso();
    } catch (e) {
      setAviso(mensajeDeError(e, 'No se pudo eliminar la partida.'));
    } finally {
      setOcupado(false);
    }
  }

  async function borrarJuego() {
    if (!juego) return;
    const extra = partidas.length ? ` y sus ${partidas.length} partida(s)` : '';
    if (!window.confirm(`¿Eliminar "${juego.nombre}"${extra}? No se puede deshacer.`)) return;
    setOcupado(true);
    setAviso(null);
    try {
      await eliminarVideojuego(id);
      navigate('/');
    } catch (e) {
      setAviso(mensajeDeError(e, 'No se pudo eliminar el videojuego.'));
      setOcupado(false);
    }
  }

  if (cargando) return <EstadoCarga cargando error={null} />;

  if (error || !juego) {
    return (
      <section>
        <Link to="/" className="volver">
          Volver a mis juegos
        </Link>
        <EstadoCarga cargando={false} error={error ?? 'Videojuego no encontrado.'} onReintentar={() => setRecarga((x) => x + 1)} />
      </section>
    );
  }

  const obtenidos = juego.logros.filter((l) => l.obtenido).length;

  return (
    <section>
      <Link to="/" className="volver">
        Volver a mis juegos
      </Link>

      <div className="encabezado-pagina">
        <div>
          <h1>{juego.nombre}</h1>
          <div className="etiquetas">
            <span className="etiqueta">{ETIQUETAS_PLATAFORMA[juego.plataforma]}</span>
            <span className="etiqueta">{ETIQUETAS_GENERO[juego.genero]}</span>
            <span className={`etiqueta etiqueta-estado estado-${juego.estado}`}>{ETIQUETAS_ESTADO[juego.estado]}</span>
          </div>
        </div>
        <div className="acciones">
          <Link to={`/videojuegos/${id}/editar`} className="boton boton-secundario">
            Editar juego
          </Link>
          <button type="button" className="boton boton-peligro" disabled={ocupado} onClick={borrarJuego}>
            Eliminar juego
          </button>
        </div>
      </div>

      {aviso && (
        <p className="estado estado-error" role="alert">
          {aviso}
        </p>
      )}

      {resumen && <BloqueResumen resumen={resumen} />}

      <div className="columnas">
        <section className="panel" aria-labelledby="titulo-logros">
          <h2 id="titulo-logros">
            Logros <span className="contador">{obtenidos}/{juego.logros.length}</span>
          </h2>
          {juego.logros.length === 0 ? (
            <p className="estado estado-vacio">
              Este juego aún no tiene logros. <Link to={`/videojuegos/${id}/editar`}>Agrégalos al editar el juego.</Link>
            </p>
          ) : (
            <ul className="lista-logros">
              {juego.logros.map((logro) => (
                <li key={logro._id}>
                  <label className={logro.obtenido ? 'logro logro-obtenido' : 'logro'}>
                    <input type="checkbox" checked={logro.obtenido} disabled={ocupado} onChange={() => alternarLogro(logro)} />
                    <span>{logro.nombre}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel" aria-labelledby="titulo-partidas">
          <div className="encabezado-panel">
            <h2 id="titulo-partidas">Partidas</h2>
            <Link to={`/partidas/nueva?videojuegoId=${id}`} className="boton">
              Registrar partida
            </Link>
          </div>
          {partidas.length === 0 ? (
            <p className="estado estado-vacio">Aún no registras partidas de este juego. Registra la primera para ver tu progreso.</p>
          ) : (
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Duración</th>
                    <th scope="col">Avance</th>
                    <th scope="col">Notas</th>
                    <th scope="col">
                      <span className="solo-lector">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {partidas.map((p) => (
                    <tr key={p._id}>
                      <td>{formatearFecha(p.fecha)}</td>
                      <td>{p.duracionMinutos} min</td>
                      <td>{p.porcentajeAvance}%</td>
                      <td>{p.notas || '—'}</td>
                      <td>
                        <button type="button" className="boton-texto" disabled={ocupado} onClick={() => borrarPartida(p)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
