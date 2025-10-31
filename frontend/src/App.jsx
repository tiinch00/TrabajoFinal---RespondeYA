import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MusicProvider, useMusic } from './context/MusicContext';
import { useEffect, useRef } from 'react';

import Bienvenido from './pages/Bienvenido.jsx';
import ComoJugar from './pages/ComoJugar';
import Contacto from './pages/Contacto';
import CrearPartida from './pages/CrearPartida.jsx';
import Home from './pages/Home';
import JugarIndividual from './pages/JugarIndividual.jsx';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import PrivateLayout from './layouts/PrivateLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import PublicRoute from './routes/PublicRoute';
import Register from './pages/Register';
import Ruleta from './pages/Ruleta';
import Tienda from './pages/Tienda';
import AbmCategorias from './pages/Admin/AbmCategorias.jsx';
import AbmPreguntas from './pages/Admin/AbmPreguntas.jsx';
import Ranking from './pages/Ranking.jsx';
import './utils/i18n.js';

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

// Componente que controla la música según autenticación y ruta
function MusicController() {
  const { audioRef } = useMusic();
  const location = useLocation();
  const prevAuthRef = useRef(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const isGameRoute = location.pathname.startsWith('/jugarIndividual');
      const isCurrentlyAuth = !!user;

      // Reiniciar música solo si cambia el estado de autenticación
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
        // Si ya estaba autenticado pero entró a juego, pausa
        audioRef.current?.pause();
      } else if (isCurrentlyAuth && !isGameRoute) {
        // Si ya estaba autenticado y sale de juego, reproduce
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
          <Route path='/crearPartida' element={<CrearPartida />} />
          <Route
            path='/jugarIndividual/:categoria/:tiempo/:dificultad'
            element={<JugarIndividual />}
          />
          <Route path='/admin/categorias' element={<AbmCategorias />} />
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
