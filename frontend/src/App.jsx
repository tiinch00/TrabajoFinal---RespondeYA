//pages
import Home from "./pages/Home"
import Contacto from './pages/Contacto'
import Tienda from './pages/Tienda'
import Login from './pages/Login'
import Register from './pages/Register'
import Perfil from './pages/Perfil'
import ComoJugar from "./pages/ComoJugar"
//Components
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import {BrowserRouter,Route,Routes} from 'react-router-dom'



function App() {
  

  return (
    <BrowserRouter>
    <Header/>
     <div className="w-full min-h-screen flex flex-col items-center justify-center 
  bg-gradient-to-b from-[#160040] via-[#1c0060] to-[#0a0235] 
  text-white">
     <img 
    src="/fondo.png" 
    alt="logo responde ya" 
    className=" mb-15 w-3/4 max-w-xl rounded-2xl "
  />
      
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/tienda' element={<Tienda/>}/>
        <Route path='/contacto' element={<Contacto/>}/>
        <Route path='/perfil' element={<Perfil/>}/>
        <Route path='/comojugar' element={<ComoJugar/>}/>
      </Routes>
       </div>
        <Footer/>
    </BrowserRouter>
  )
}

export default App
