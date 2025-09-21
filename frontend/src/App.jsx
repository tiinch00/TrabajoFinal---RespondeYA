import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import ChatGlobal from './pages/ChatGlobal'
import ComoJugar from "./pages/ComoJugar"
import Contacto from './pages/Contacto'
import Home from "./pages/Home"
import Login from './pages/Login'
import Perfil from './pages/Perfil'
import PrivateLayout from "./layouts/PrivateLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicLayout from "./layouts/PublicLayout";
import PublicRoute from "./routes/PublicRoute";
import Register from './pages/Register'
import Tienda from './pages/Tienda'

function App() {

  return (
    <BrowserRouter>
      <Routes>                      
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
            <Route path='/tienda' element={<Tienda />} />
            <Route path='/contacto' element={<Contacto />} />
            <Route path='/perfil' element={<Perfil />} />
            <Route path='/comojugar' element={<ComoJugar />} />
            <Route path='/chatGlobal' element={<ChatGlobal />} />
          </Route>
        </Route>
         {/* Catch-all: mandá a "/" (el guard decide) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App