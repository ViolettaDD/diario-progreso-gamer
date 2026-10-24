interface Props {
  cargando: boolean;
  error: string | null;
  vacio?: boolean;
  mensajeVacio?: string;
  onReintentar?: () => void;
}

/** Muestra los 3 estados de una pantalla que depende de la API: loading, error y empty. */
export function EstadoCarga({ cargando, error, vacio = false, mensajeVacio = 'No hay resultados.', onReintentar }: Props) {
  if (cargando) {
    return (
      <p className="estado estado-carga" role="status">
        Cargando…
      </p>
    );
  }
  if (error) {
    return (
      <div className="estado estado-error" role="alert">
        <p>{error}</p>
        {onReintentar && (
          <button type="button" className="boton boton-secundario" onClick={onReintentar}>
            Reintentar
          </button>
        )}
      </div>
    );
  }
  if (vacio) return <p className="estado estado-vacio">{mensajeVacio}</p>;
  return null;
}
