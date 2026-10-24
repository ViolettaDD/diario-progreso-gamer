import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { actualizarVideojuego, crearVideojuego, obtenerVideojuego } from '../api/videojuegosApi';
import { EstadoCarga } from '../components/EstadoCarga';
import { ESTADOS, ETIQUETAS_ESTADO, ETIQUETAS_GENERO, ETIQUETAS_PLATAFORMA, GENEROS, PLATAFORMAS, mensajeDeError } from '../tipos';
import type { Estado, Genero, LogroInput, Plataforma, VideojuegoInput } from '../tipos';

const VACIO: VideojuegoInput = { nombre: '', plataforma: 'PC', genero: 'accion', estado: 'jugando', logros: [] };

export function FormularioVideojuego() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = Boolean(id);
  const [form, setForm] = useState<VideojuegoInput>(VACIO);
  const [cargando, setCargando] = useState(editando);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallida, setFallida] = useState(false);

  useEffect(() => {
    if (!id) {
      setForm(VACIO);
      setCargando(false);
      return;
    }
    let vigente = true;
    setCargando(true);
    setError(null);
    setFallida(false);
    obtenerVideojuego(id)
      .then((v) => {
        if (!vigente) return;
        setForm({
          nombre: v.nombre,
          plataforma: v.plataforma,
          genero: v.genero,
          estado: v.estado,
          logros: v.logros.map((l) => ({ _id: l._id, nombre: l.nombre, obtenido: l.obtenido })),
        });
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setError(mensajeDeError(e, 'No se pudo cargar el videojuego.'));
        setFallida(true);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [id]);

  function cambiarLogro(indice: number, cambios: Partial<LogroInput>) {
    setForm((f) => ({ ...f, logros: f.logros.map((l, i) => (i === indice ? { ...l, ...cambios } : l)) }));
  }

  function agregarLogro() {
    setForm((f) => ({ ...f, logros: [...f.logros, { nombre: '', obtenido: false }] }));
  }

  function quitarLogro(indice: number) {
    setForm((f) => ({ ...f, logros: f.logros.filter((_, i) => i !== indice) }));
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const nombre = form.nombre.trim();
    if (!nombre) {
      setError('Escribe el nombre del juego.');
      return;
    }
    const datos: VideojuegoInput = {
      ...form,
      nombre,
      logros: form.logros.map((l) => ({ ...l, nombre: l.nombre.trim() })).filter((l) => l.nombre),
    };
    setGuardando(true);
    try {
      const guardado = id ? await actualizarVideojuego(id, datos) : await crearVideojuego(datos);
      navigate(`/videojuegos/${guardado._id}`);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar el juego.'));
      setGuardando(false);
    }
  }

  if (cargando) return <EstadoCarga cargando error={null} />;

  return (
    <section className="pagina-formulario">
      <Link to={id ? `/videojuegos/${id}` : '/'} className="volver">
        {id ? 'Volver al juego' : 'Volver a mis juegos'}
      </Link>
      <h1>{editando ? 'Editar juego' : 'Agregar juego'}</h1>

      {error && (
        <p className="estado estado-error" role="alert">
          {error}
        </p>
      )}

      {!fallida && (
        <form onSubmit={enviar} className="formulario">
          <fieldset disabled={guardando}>
            <label className="campo">
              Nombre
              <input required maxLength={100} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </label>

            <div className="fila">
              <label className="campo">
                Plataforma
                <select value={form.plataforma} onChange={(e) => setForm({ ...form, plataforma: e.target.value as Plataforma })}>
                  {PLATAFORMAS.map((p) => (
                    <option key={p} value={p}>
                      {ETIQUETAS_PLATAFORMA[p]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="campo">
                Género
                <select value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value as Genero })}>
                  {GENEROS.map((g) => (
                    <option key={g} value={g}>
                      {ETIQUETAS_GENERO[g]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="campo">
                Estado
                <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as Estado })}>
                  {ESTADOS.map((s) => (
                    <option key={s} value={s}>
                      {ETIQUETAS_ESTADO[s]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="editor-logros">
              <div className="encabezado-panel">
                <h2>Logros</h2>
                <button type="button" className="boton boton-secundario" onClick={agregarLogro}>
                  Agregar logro
                </button>
              </div>
              {form.logros.length === 0 ? (
                <p className="nota">Sin logros por ahora. Puedes agregarlos más tarde.</p>
              ) : (
                form.logros.map((logro, i) => (
                  <div className="fila-logro" key={logro._id ?? `nuevo-${i}`}>
                    <input
                      aria-label={`Nombre del logro ${i + 1}`}
                      placeholder="Ej.: Derrotar al primer jefe"
                      maxLength={100}
                      value={logro.nombre}
                      onChange={(e) => cambiarLogro(i, { nombre: e.target.value })}
                    />
                    <label className="casilla">
                      <input type="checkbox" checked={logro.obtenido} onChange={(e) => cambiarLogro(i, { obtenido: e.target.checked })} />
                      Obtenido
                    </label>
                    <button type="button" className="boton-texto" onClick={() => quitarLogro(i)}>
                      Quitar
                    </button>
                  </div>
                ))
              )}
            </div>

            <button type="submit" className="boton">
              {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar juego'}
            </button>
          </fieldset>
        </form>
      )}
    </section>
  );
}
