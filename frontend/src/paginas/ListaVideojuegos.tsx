import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarVideojuegos } from '../api/videojuegosApi';
import { EstadoCarga } from '../components/EstadoCarga';
import { ESTADOS, ETIQUETAS_ESTADO, ETIQUETAS_GENERO, ETIQUETAS_PLATAFORMA, mensajeDeError } from '../tipos';
import type { Videojuego } from '../tipos';

export function ListaVideojuegos() {
  const [estado, setEstado] = useState('');
  const [recarga, setRecarga] = useState(0);
  const [datos, setDatos] = useState<Videojuego[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    listarVideojuegos(estado)
      .then((lista) => {
        if (vigente) setDatos(lista);
      })
      .catch((e: unknown) => {
        if (vigente) setError(mensajeDeError(e, 'No se pudieron cargar los videojuegos.'));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [estado, recarga]);

  const mensajeVacio = estado
    ? `No tienes juegos en estado "${ETIQUETAS_ESTADO[estado as keyof typeof ETIQUETAS_ESTADO]}". Prueba con otro filtro.`
    : 'Todavía no registras juegos. Agrega el primero para empezar tu diario.';

  return (
    <section>
      <div className="encabezado-pagina">
        <h1>Mis juegos</h1>
        <Link to="/videojuegos/nuevo" className="boton">
          Agregar juego
        </Link>
      </div>

      <div className="filtros">
        <label htmlFor="filtro-estado">Mostrar</label>
        <select id="filtro-estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {ETIQUETAS_ESTADO[s]}
            </option>
          ))}
        </select>
      </div>

      <EstadoCarga
        cargando={cargando}
        error={error}
        vacio={!datos.length}
        mensajeVacio={mensajeVacio}
        onReintentar={() => setRecarga((x) => x + 1)}
      />

      {!cargando && !error && datos.length > 0 && (
        <ul className="ranuras">
          {datos.map((juego) => {
            const obtenidos = juego.logros.filter((l) => l.obtenido).length;
            return (
              <li key={juego._id} className={`ranura ranura-${juego.estado}`}>
                <Link to={`/videojuegos/${juego._id}`} className="ranura-titulo">
                  {juego.nombre}
                </Link>
                <div className="etiquetas">
                  <span className="etiqueta">{ETIQUETAS_PLATAFORMA[juego.plataforma]}</span>
                  <span className="etiqueta">{ETIQUETAS_GENERO[juego.genero]}</span>
                  <span className={`etiqueta etiqueta-estado estado-${juego.estado}`}>{ETIQUETAS_ESTADO[juego.estado]}</span>
                </div>
                <p className="ranura-logros">
                  {juego.logros.length ? `${obtenidos} de ${juego.logros.length} logros` : 'Sin logros'}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
