import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import { ListaVideojuegos } from './paginas/ListaVideojuegos';
import { DetalleVideojuego } from './paginas/DetalleVideojuego';
import { FormularioVideojuego } from './paginas/FormularioVideojuego';
import { ListaPartidas } from './paginas/ListaPartidas';
import { FormularioPartida } from './paginas/FormularioPartida';

export default function App() {
  return (
    <BrowserRouter>
      <header className="cabecera">
        <div className="cabecera-interior">
          <Link to="/" className="marca">
            <span aria-hidden="true">🎮</span> Diario de Progreso Gamer
          </Link>
          <nav className="nav" aria-label="Principal">
            <NavLink to="/" end>
              Mis juegos
            </NavLink>
            <NavLink to="/partidas" end>
              Partidas
            </NavLink>
            <Link to="/partidas/nueva" className="boton">
              Registrar partida
            </Link>
          </nav>
        </div>
      </header>

      <main className="contenedor">
        <Routes>
          <Route path="/" element={<ListaVideojuegos />} />
          <Route path="/videojuegos/nuevo" element={<FormularioVideojuego />} />
          <Route path="/videojuegos/:id" element={<DetalleVideojuego />} />
          <Route path="/videojuegos/:id/editar" element={<FormularioVideojuego />} />
          <Route path="/partidas" element={<ListaPartidas />} />
          <Route path="/partidas/nueva" element={<FormularioPartida />} />
          <Route
            path="*"
            element={
              <p className="estado estado-vacio">
                Esta página no existe. <Link to="/">Volver a mis juegos</Link>
              </p>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
