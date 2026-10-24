import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eliminarPartida, listarPartidas } from '../api/partidasApi';
import { EstadoCarga } from '../components/EstadoCarga';
import { formatearFecha, idVideojuego, mensajeDeError, nombreVideojuego } from '../tipos';
import type { Partida } from '../tipos';

export function ListaPartidas() {
  const [datos, setDatos] = useState<Partida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    listarPartidas()
      .then((lista) => {
        if (vigente) setDatos(lista);
      })
      .catch((e: unknown) => {
        if (vigente) setError(mensajeDeError(e, 'No se pudieron cargar las partidas.'));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [recarga]);

  async function borrar(partida: Partida) {
    if (!window.confirm(`¿Eliminar la partida del ${formatearFecha(partida.fecha)}?`)) return;
    setOcupado(true);
    setAviso(null);
    try {
      await eliminarPartida(partida._id);
      setDatos((lista) => lista.filter((p) => p._id !== partida._id));
    } catch (e) {
      setAviso(mensajeDeError(e, 'No se pudo eliminar la partida.'));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section>
      <div className="encabezado-pagina">
        <h1>Partidas</h1>
        <Link to="/partidas/nueva" className="boton">
          Registrar partida
        </Link>
      </div>

      {aviso && (
        <p className="estado estado-error" role="alert">
          {aviso}
        </p>
      )}

      <EstadoCarga
        cargando={cargando}
        error={error}
        vacio={!datos.length}
        mensajeVacio="Aún no registras partidas. Registra una sesión para empezar a medir tu progreso."
        onReintentar={() => setRecarga((x) => x + 1)}
      />

      {!cargando && !error && datos.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Juego</th>
                <th scope="col">Duración</th>
                <th scope="col">Avance</th>
                <th scope="col">Notas</th>
                <th scope="col">
                  <span className="solo-lector">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {datos.map((p) => {
                const juegoId = idVideojuego(p.videojuego);
                return (
                  <tr key={p._id}>
                    <td>{formatearFecha(p.fecha)}</td>
                    <td>{juegoId ? <Link to={`/videojuegos/${juegoId}`}>{nombreVideojuego(p.videojuego)}</Link> : nombreVideojuego(p.videojuego)}</td>
                    <td>{p.duracionMinutos} min</td>
                    <td>{p.porcentajeAvance}%</td>
                    <td>{p.notas || '—'}</td>
                    <td>
                      <button type="button" className="boton-texto" disabled={ocupado} onClick={() => borrar(p)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
