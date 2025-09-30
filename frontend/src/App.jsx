import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Bienvenido from './pages/Bienvenido.jsx';
import ChatGlobal from './pages/ChatGlobal';
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
import Tienda from './pages/Tienda';

// Elige layout según sesión
function LayoutSwitch() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  })();

  // Tus layouts ya deberían renderizar <Outlet /> adentro
  return user ? <PrivateLayout /> : <PublicLayout />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

         {/* Rutas compartidas en ambos layouts */}
        <Route element={<LayoutSwitch />}>
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/comojugar" element={<ComoJugar />} />
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
            <Route index element={<Home />} /> {/* "/" */}
            <Route path='/bienvenido' element={<Bienvenido />} />
            <Route path='/crearPartida' element={<CrearPartida />} />
            <Route
              path='/jugarIndividual/:categoria/:tiempo/:dificultad'
              element={<JugarIndividual />}
            />
            <Route path='/tienda' element={<Tienda />} />            
            <Route path='/perfil' element={<Perfil />} />           
            <Route path='/chatGlobal' element={<ChatGlobal />} />
          </Route>
        </Route>
        {/* Catch-all: mandá a "/" (el guard decide) */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
