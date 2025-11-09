import './utils/i18n.js';

import { MusicProvider, useMusic } from './context/MusicContext';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

import AbmCategorias from './pages/Admin/AbmCategorias.jsx';
import AbmPreguntas from './pages/Admin/AbmPreguntas.jsx';
import Bienvenido from './pages/Bienvenido.jsx';
import ComoJugar from './pages/ComoJugar';
import Contacto from './pages/Contacto';
import CrearPartida from './pages/CrearPartida.jsx';
import Home from './pages/Home';
import JugarIndividual from './pages/JugarIndividual.jsx';
import JugarMultijugador from './pages/JugarMultijugador.jsx';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import PrivateLayout from './layouts/PrivateLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import PublicRoute from './routes/PublicRoute';
import Ranking from './pages/Ranking.jsx';
import Register from './pages/Register';
import Ruleta from './pages/Ruleta';
import SalaEspera from './pages/SalaEspera.jsx';
import SalaPartidas from './pages/SalaPartidas.jsx';
import Tienda from './pages/Tienda';
import AbmEstadisticas from './pages/Admin/AbmEstadisticas.jsx';

function LayoutSwitch() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  return user ? <PrivateLayout /> : <PublicLayout />;
}

// componente que controla la mssica segun autenticacion y ruta
function MusicController() {
  const { audioRef } = useMusic();
  const location = useLocation();
  const prevAuthRef = useRef(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const isGameRoute = location.pathname.startsWith('/crearIndividual/');
      const isCurrentlyAuth = !!user;

      if (isCurrentlyAuth !== prevAuthRef.current) {
        if (isCurrentlyAuth && !isGameRoute) {
          audioRef.current.currentTime = 0;
          audioRef.current?.play().catch(() => {});
        } else {
          audioRef.current?.pause();
          audioRef.current.currentTime = 0;
        }
        prevAuthRef.current = isCurrentlyAuth;
      } else if (isCurrentlyAuth && isGameRoute) {
        // si ya estaba autenticado pero entro a juego, pausa
        audioRef.current?.pause();
      } else if (isCurrentlyAuth && !isGameRoute) {
        // si ya estaba autenticado y sale de juego, reproduce
        audioRef.current?.play().catch(() => {});
      }
    } catch {
      audioRef.current?.pause();
    }
  }, [location, audioRef]);

  return null;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas compartidas en ambos layouts */}
      <Route element={<LayoutSwitch />}>
        <Route path='/contacto' element={<Contacto />} />
        <Route path='/comoJugar' element={<ComoJugar />} />
      </Route>

      {/* Publico (sin sesion) */}
      <Route element={<PublicRoute />}>
        <Route element={<PublicLayout />}>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Route>
      </Route>

      {/* Privado (con sesion) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PrivateLayout />}>
          <Route index element={<Home />} />
          <Route path='/bienvenido' element={<Bienvenido />} />
          <Route path='/salaPartidas' element={<SalaPartidas />} />
          <Route
            path='/crearIndividual/:categoria/:tiempo/:dificultad'
            element={<JugarIndividual />}
          />
          <Route path='/crearIndividual' element={<CrearPartida modo='individual' />} />
          <Route path='/crearMultijugador' element={<CrearPartida modo='multiplayer' />} />
          <Route path='/salaEspera/:id' element={<SalaEspera />} />
          <Route path='/jugarMultijugador/:id' element={<JugarMultijugador />} />
          <Route path='/admin/categorias' element={<AbmCategorias />} />
          <Route path='/admin/estadisticas' element={<AbmEstadisticas />} />
          <Route path='/tienda' element={<Tienda />} />
          <Route path='/perfil' element={<Perfil />} />
          <Route path='/Ruleta' element={<Ruleta />} />
          <Route path='/categoria/:nombre/:id/preguntas' element={<AbmPreguntas />} />
          <Route path='/Ranking' element={<Ranking />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

function App() {
  return (
    <MusicProvider>
      <MusicController />
      <AppRoutes />
    </MusicProvider>
  );
}

export default App;
