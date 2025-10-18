import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// crear el contexto
const ContextJuego = createContext();

// crear un provider (componente que envuelve toda la app)
export const GameProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch de categorias
  const fetchCategorias = async () => {
    try {
      const res = await axios.get('http://localhost:3006/categorias');
      setCategorias(res.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  // cargar datos iniciales al logear
  useEffect(() => {
    const userLocal = localStorage.getItem('user');
    if (userLocal) {
      setUser(JSON.parse(userLocal));
      fetchCategorias();
    } else {
      setLoading(false);
    }
  }, []);

  // valor que comparten todos los componentes
  const value = {
    user,
    setUser,
    categorias,
    setCategorias,
    fetchCategorias,
    loading,
  };

  return <ContextJuego.Provider value={value}>{children}</ContextJuego.Provider>;
};

// 6️⃣ Hook para usar el contexto fácilmente
export const useGame = () => useContext(ContextJuego);
