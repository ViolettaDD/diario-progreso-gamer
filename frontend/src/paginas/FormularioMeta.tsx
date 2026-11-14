import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { actualizarMeta, crearMeta, obtenerMeta } from '../api/metasApi';
import { EstadoCarga } from '../components/EstadoCarga';
import { mensajeDeError } from '../tipos';
import type { Hito } from '../tipos';

const MAX_HITOS = 5;
const MENSAJE_HORAS = 'Las horas por semana deben ser mayores que 0 y como máximo 100.';
const MENSAJE_DIAS = 'Los días por semana deben ser un número entero entre 1 y 7.';
const MENSAJE_OBJETIVO = 'El objetivo de cada hito debe estar entre 1 % y 100 %.';
const MENSAJE_TEXTO = 'Cada hito necesita un texto de 1 a 60 caracteres.';
const MENSAJE_API = 'No se pudo guardar la meta. Revisa los datos e inténtalo de nuevo.';

/** Los campos se guardan como texto para aceptar «0,5» y para que los mensajes sean los de la spec (regla 14). */
interface HitoForm {
  descripcion: string;
  porcentajeObjetivo: string;
}
interface MetaForm {
  horasSemanales: string;
  diasPorSemana: string;
  hitos: HitoForm[];
}

const VACIO: MetaForm = { horasSemanales: '', diasPorSemana: '', hitos: [] };

/** «0,5» o «0.5» → 0.5; texto vacío o no numérico → NaN. */
function numero(texto: string): number {
  const limpio = texto.trim().replace(',', '.');
  return limpio === '' ? NaN : Number(limpio);
}

/** Valida en el orden de la regla 14 y devuelve el primer mensaje, o null si todo está bien. */
function validar(horas: number, dias: number, hitos: Hito[]): string | null {
  if (!(horas > 0 && horas <= 100)) return MENSAJE_HORAS;
  if (!(Number.isInteger(dias) && dias >= 1 && dias <= 7)) return MENSAJE_DIAS;
  if (hitos.some((h) => !(h.porcentajeObjetivo >= 1 && h.porcentajeObjetivo <= 100))) return MENSAJE_OBJETIVO;
  if (hitos.some((h) => h.descripcion.length < 1 || h.descripcion.length > 60)) return MENSAJE_TEXTO;
  return null;
}

/**
 * Crear meta (/videojuegos/:videojuegoId/meta/nueva) y editar meta (/metas/:metaId/editar). T-27.
 * Las reglas de negocio (RN-07, RN-09) las aplica la API; aquí solo se muestra su mensaje.
 */
export function FormularioMeta() {
  const { videojuegoId: idJuegoRuta, metaId } = useParams();
  const editando = Boolean(metaId);
  const navigate = useNavigate();
  const [form, setForm] = useState<MetaForm>(VACIO);
  const [videojuegoId, setVideojuegoId] = useState(idJuegoRuta ?? '');
  const [cargando, setCargando] = useState(editando);
  const [fallida, setFallida] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    if (!metaId) {
      setForm(VACIO);
      setVideojuegoId(idJuegoRuta ?? '');
      setCargando(false);
      return;
    }
    let vigente = true;
    setCargando(true);
    setFallida(false);
    setError(null);
    obtenerMeta(metaId)
      .then((m) => {
        if (!vigente) return;
        setVideojuegoId(m.videojuego);
        setForm({
          horasSemanales: String(m.horasSemanales).replace('.', ','),
          diasPorSemana: String(m.diasPorSemana),
          hitos: m.hitos.map((h) => ({ descripcion: h.descripcion, porcentajeObjetivo: String(h.porcentajeObjetivo) })),
        });
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setError(mensajeDeError(e, 'No se pudo cargar la meta.'));
        setFallida(true);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [metaId, idJuegoRuta, recarga]);

  function cambiarHito(indice: number, cambios: Partial<HitoForm>) {
    setForm((f) => ({ ...f, hitos: f.hitos.map((h, i) => (i === indice ? { ...h, ...cambios } : h)) }));
  }

  function agregarHito() {
    setForm((f) =>
      f.hitos.length >= MAX_HITOS ? f : { ...f, hitos: [...f.hitos, { descripcion: '', porcentajeObjetivo: '' }] },
    );
  }

  function quitarHito(indice: number) {
    setForm((f) => ({ ...f, hitos: f.hitos.filter((_, i) => i !== indice) }));
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    // Recorte de espacios antes de validar y de enviar (regla 13).
    const hitos: Hito[] = form.hitos.map((h) => ({
      descripcion: h.descripcion.trim(),
      porcentajeObjetivo: numero(h.porcentajeObjetivo),
    }));
    const horasSemanales = numero(form.horasSemanales);
    const diasPorSemana = numero(form.diasPorSemana);
    const problema = validar(horasSemanales, diasPorSemana, hitos);
    if (problema) {
      setError(problema);
      return;
    }
    setGuardando(true);
    try {
      if (metaId) {
        await actualizarMeta(metaId, { horasSemanales, diasPorSemana, hitos });
      } else {
        await crearMeta({ videojuego: videojuegoId, horasSemanales, diasPorSemana, hitos });
      }
      navigate(`/videojuegos/${videojuegoId}`);
    } catch (err) {
      setError(mensajeDeError(err, MENSAJE_API));
      setGuardando(false);
    }
  }

  const titulo = editando ? 'Editar meta' : 'Crear meta';

  if (cargando) return <EstadoCarga cargando error={null} />;

  if (fallida) {
    return (
      <section className="pagina-formulario">
        <h1>{titulo}</h1>
        <EstadoCarga cargando={false} error={error} onReintentar={() => setRecarga((x) => x + 1)} />
      </section>
    );
  }

  const lleno = form.hitos.length >= MAX_HITOS;

  return (
    <section className="pagina-formulario">
      <Link to={`/videojuegos/${videojuegoId}`} className="volver">
        Volver al juego
      </Link>
      <h1>{titulo}</h1>

      {error && (
        <p className="estado estado-error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={enviar} className="formulario" noValidate>
        <fieldset disabled={guardando}>
          <div className="fila">
            <label className="campo">
              Horas por semana
              <input
                type="text"
                inputMode="decimal"
                value={form.horasSemanales}
                onChange={(e) => setForm({ ...form, horasSemanales: e.target.value })}
              />
            </label>
            <label className="campo">
              Días por semana
              <input
                type="text"
                inputMode="numeric"
                value={form.diasPorSemana}
                onChange={(e) => setForm({ ...form, diasPorSemana: e.target.value })}
              />
            </label>
          </div>

          <div className="editor-logros">
            <div className="encabezado-panel">
              <h2>Hitos</h2>
              <div className="acciones">
                <button type="button" className="boton boton-secundario" disabled={lleno} onClick={agregarHito}>
                  Agregar hito
                </button>
                {lleno && <span className="meta-limite">Máximo 5 hitos</span>}
              </div>
            </div>
            {form.hitos.length === 0 ? (
              <p className="estado estado-vacio">Esta meta aún no tiene hitos. Son opcionales.</p>
            ) : (
              form.hitos.map((hito, i) => (
                <div className="fila-logro" key={i}>
                  <label className="campo">
                    Hito {i + 1}
                    <input
                      type="text"
                      value={hito.descripcion}
                      onChange={(e) => cambiarHito(i, { descripcion: e.target.value })}
                    />
                  </label>
                  <label className="campo">
                    Objetivo (%)
                    <input
                      type="text"
                      inputMode="numeric"
                      value={hito.porcentajeObjetivo}
                      onChange={(e) => cambiarHito(i, { porcentajeObjetivo: e.target.value })}
                    />
                  </label>
                  <button type="button" className="boton boton-secundario" onClick={() => quitarHito(i)}>
                    Quitar
                  </button>
                </div>
              ))
            )}
          </div>

          <button type="submit" className="boton boton-secundario">
            {guardando ? 'Guardando…' : 'Guardar meta'}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
