import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { listarVideojuegos } from '../api/videojuegosApi';
import { actualizarPartida, crearPartida, obtenerPartida } from '../api/partidasApi';
import { EstadoCarga } from '../components/EstadoCarga';
import { hoyISO, mensajeDeError } from '../tipos';
import type { PartidaInput, Videojuego } from '../tipos';

/** Registrar partida (/partidas/nueva) y editar partida (/partidas/:id/editar, T-30). */
export function FormularioPartida() {
  const { id } = useParams();
  const editando = Boolean(id);
  const [nombreJuego, setNombreJuego] = useState('');
  const [query] = useSearchParams();
  const preseleccion = query.get('videojuegoId') ?? '';
  const navigate = useNavigate();
  const [juegos, setJuegos] = useState<Videojuego[]>([]);
  const [form, setForm] = useState<PartidaInput>({
    videojuego: '',
    fecha: hoyISO(),
    duracionMinutos: 60,
    porcentajeAvance: 0,
    notas: '',
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallida, setFallida] = useState(false);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    setFallida(false);
    if (id) {
      // Modo edición: el juego viene poblado y no se puede cambiar (supuesto 6).
      obtenerPartida(id)
        .then((partida) => {
          if (!vigente) return;
          if (!partida.videojuego || typeof partida.videojuego === 'string') {
            throw new Error('No se encontró el juego de esta partida.');
          }
          setNombreJuego(partida.videojuego.nombre);
          setForm({
            videojuego: partida.videojuego._id,
            // La API devuelve fecha-hora ISO y el backend solo acepta AAAA-MM-DD (D-P2.2).
            fecha: partida.fecha.slice(0, 10),
            duracionMinutos: partida.duracionMinutos,
            porcentajeAvance: partida.porcentajeAvance,
            notas: partida.notas ?? '',
          });
        })
        .catch((e: unknown) => {
          if (!vigente) return;
          setError(mensajeDeError(e, 'No se pudo cargar la partida.'));
          setFallida(true);
        })
        .finally(() => {
          if (vigente) setCargando(false);
        });
      return () => {
        vigente = false;
      };
    }
    listarVideojuegos()
      .then((lista) => {
        if (!vigente) return;
        setJuegos(lista);
        const elegido = lista.some((v) => v._id === preseleccion) ? preseleccion : (lista[0]?._id ?? '');
        setForm((f) => ({ ...f, videojuego: elegido }));
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setError(mensajeDeError(e, 'No se pudieron cargar tus juegos.'));
        setFallida(true);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [id, preseleccion, recarga]);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!form.videojuego) {
      setError('Elige el juego de esta partida.');
      return;
    }
    if (form.duracionMinutos < 1) {
      setError('La duración debe ser de al menos 1 minuto.');
      return;
    }
    if (form.porcentajeAvance < 0 || form.porcentajeAvance > 100) {
      setError('El avance debe estar entre 0 y 100.');
      return;
    }
    setGuardando(true);
    try {
      if (id) {
        const { fecha, duracionMinutos, porcentajeAvance } = form;
        await actualizarPartida(id, { fecha, duracionMinutos, porcentajeAvance, notas: form.notas.trim() });
      } else {
        await crearPartida({ ...form, notas: form.notas.trim() });
      }
      // Volver al detalle: el resumen se recalcula en el backend con la partida nueva.
      navigate(`/videojuegos/${form.videojuego}`);
    } catch (err) {
      setError(mensajeDeError(err, editando ? 'No se pudo guardar la partida.' : 'No se pudo registrar la partida.'));
      setGuardando(false);
    }
  }

  const titulo = editando ? 'Editar partida' : 'Registrar partida';

  if (cargando) return <EstadoCarga cargando error={null} />;

  if (fallida) {
    return (
      <section className="pagina-formulario">
        <h1>{titulo}</h1>
        <EstadoCarga cargando={false} error={error} onReintentar={() => setRecarga((x) => x + 1)} />
      </section>
    );
  }

  return (
    <section className="pagina-formulario">
      <Link
        to={editando ? `/videojuegos/${form.videojuego}` : preseleccion ? `/videojuegos/${preseleccion}` : '/partidas'}
        className="volver"
      >
        Volver
      </Link>
      <h1>{titulo}</h1>

      {!editando && juegos.length === 0 ? (
        <p className="estado estado-vacio">
          Para registrar una partida primero necesitas un juego.{' '}
          <Link to="/videojuegos/nuevo">Agrega tu primer juego.</Link>
        </p>
      ) : (
        <>
          {error && (
            <p className="estado estado-error" role="alert">
              {error}
            </p>
          )}
          <form onSubmit={enviar} className="formulario">
            <fieldset disabled={guardando}>
              <label className="campo">
                Juego
                {editando ? (
                  <select disabled value={form.videojuego}>
                    <option value={form.videojuego}>{nombreJuego}</option>
                  </select>
                ) : (
                  <select
                    required
                    value={form.videojuego}
                    onChange={(e) => setForm({ ...form, videojuego: e.target.value })}
                  >
                    {juegos.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <div className="fila">
                <label className="campo">
                  Fecha
                  <input
                    required
                    type="date"
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  />
                </label>
                <label className="campo">
                  Duración (minutos)
                  <input
                    required
                    type="number"
                    min={1}
                    max={1440}
                    value={form.duracionMinutos}
                    onChange={(e) => setForm({ ...form, duracionMinutos: Number(e.target.value) })}
                  />
                </label>
                <label className="campo">
                  Avance al terminar (%)
                  <input
                    required
                    type="number"
                    min={0}
                    max={100}
                    value={form.porcentajeAvance}
                    onChange={(e) => setForm({ ...form, porcentajeAvance: Number(e.target.value) })}
                  />
                </label>
              </div>

              <label className="campo">
                Notas (opcional)
                <textarea
                  maxLength={500}
                  rows={3}
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                />
              </label>

              {editando ? (
                <button type="submit" className="boton boton-secundario">
                  {guardando ? 'Guardando…' : 'Guardar partida'}
                </button>
              ) : (
                <button type="submit" className="boton">
                  {guardando ? 'Registrando…' : 'Registrar partida'}
                </button>
              )}
            </fieldset>
          </form>
        </>
      )}
    </section>
  );
}
