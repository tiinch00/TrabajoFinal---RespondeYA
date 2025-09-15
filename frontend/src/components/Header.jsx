import { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export const Header = () => {

const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token){
      console.log('No hay token')
      navigate('/login');

      setUser(token);
   return; 
  } 
    

   axios.get("http://localhost:3000/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUser(res.data))
    .catch(() => {
      // Si el token es inválido o expiró
      localStorage.removeItem("token");
      navigate("/login");
    });
  }, []);

  

const handleLogout = () => {
  localStorage.removeItem("token"); 
  navigate("/login"); 
  
};
  return (
<header className="bg-orange-300 px-6 py-3 font-semibold shadow sticky top-0 w-full h-32">
  <nav className="flex items-center justify-between h-full">
  
    <Link to="/" className="h-full flex items-center">
      <img
        src="/logo.png"
        alt="Logo"
        className="h-60 w-auto object-contain hover:scale-105 transition-transform"
      />
    </Link>
 
    <ul className="flex items-center gap-8 text-lg ">
       <li><button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer">Cerrar sesión</button></li>
      <li className='hover:scale-105 transition-transform'><Link to="/">Inicio</Link></li>
       <li className='hover:scale-105 transition-transform'><Link to="/tienda">Tienda</Link></li> 
      <li className='hover:scale-105 transition-transform'><Link to="/comojugar">Como Jugar</Link></li>
      <li><button className="cursor-pointer">EN/ES</button></li>
    </ul>
  </nav>
</header>


  )
}
