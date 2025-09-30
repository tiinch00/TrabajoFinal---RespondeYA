import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Bienvenido = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // ⏳ después de 3 segundos manda al Home
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className='w-full h-screen flex flex-col items-center justify-cente'>
      <h1 className='text-5xl font-bold text-amber-700 mb-4 animate-pulse'>
        ¡Bienvenido {user?.name || 'Jugador'}! 🎉
      </h1>
      <p className='text-lg text-gray-600'>Cargando...</p>
    </div>
  );
};

export default Bienvenido;
