import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import axios from 'axios';
import { io } from 'socket.io-client';

// crear el contexto
const ContextJuego = createContext();

// crear un provider (componente que envuelve toda la app)
export const GameProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

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

  // Inicializar socket
  const inicializarSocket = useCallback(() => {
    if (!socket) {
      const newSocket = io('http://localhost:3006', { path: '/socket.io' });
      setSocket(newSocket);
      return newSocket;
    }
    return socket;
  }, [socket]);

  // Crear partida (individual o multiplayer)
  const crearPartida = useCallback(
    (modo, { categoria, tiempo, dificultad }, navFunction) => {
      if (modo === 'individual') {
        navFunction(`/crearIndividual/${categoria.toLowerCase()}/${tiempo}/${dificultad}`);
      } else if (modo === 'multiplayer') {
        const socketInstance = inicializarSocket();

        const datosPartida = {
          categoria: categoria.toLowerCase(),
          tiempo,
          dificultad,
          timestamp: Date.now(),
        };

        socketInstance.emit('crear_partida', datosPartida, (response) => {
          if (response.success) {
            //navFunction(`/partida-multiplayer/${response.idPartida}`);
            navFunction(`/salaEspera/${response.idPartida}`);
          } else {
            console.error('Error al crear partida:', response.error);
          }
        });
      }
    },
    [socket, inicializarSocket]
  );

  // Unirse al lobby multiplayer
  const unirseLobby = useCallback(() => {
    const socketInstance = inicializarSocket();
    socketInstance.emit('unirse_lobby');
  }, [socket, inicializarSocket]);

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
    crearPartida,
    unirseLobby,
    socket,
    inicializarSocket,
  };

  return <ContextJuego.Provider value={value}>{children}</ContextJuego.Provider>;
};

// Hook para usar el contexto fácilmente
export const useGame = () => useContext(ContextJuego);
