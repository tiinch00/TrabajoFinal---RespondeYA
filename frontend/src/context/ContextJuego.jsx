import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import axios from 'axios';
import { io } from 'socket.io-client';

// crear el contexto
const ContextJuego = createContext();

// crear un provider (componente que envuelve toda la app)
export const GameProvider = ({ children }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cargarUsuario = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch (error) {
        console.error('Error parsing user from localStorage', error);
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, []);
  // fetch de categorias
  const fetchCategorias = async () => {
    try {
      const res = await axios.get(`${API_URL}/categorias`);
      setCategorias(res.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  // cargar datos iniciales al logear
  useEffect(() => {
    if (user) {
      fetchCategorias();
    }
  }, [user]);
  useEffect(() => {
    console.log('GameProvider: user actualizado ->', user);
  }, [user]);

  // si querés log cuando cambie user:
  // useEffect(() => {
  //   console.log('user ->', user);
  // }, [user]);

  // Inicializar socket
  const inicializarSocket = useCallback(() => {
    if (!socket) {
      const newSocket = io(`${API_URL}`, { path: '/socket.io' });
      setSocket(newSocket);
      return newSocket;
    }
    return socket;
  }, [socket]);

  // Crear partida (individual o multiplayer)
  const crearPartida = useCallback(
    (modo, { categoria, tiempo, dificultad }, navFunction) => {
      if (!user) {
        console.warn('crearPartida llamado sin user');
        return;
      }

      if (modo === 'individual') {
        navFunction(`/crearIndividual/${categoria.toLowerCase()}/${tiempo}/${dificultad}`);
      } else if (modo === 'multiplayer') {
        const socketInstance = inicializarSocket();

        const datosPartida = {
          categoria: categoria.toLowerCase(),
          tiempo: tiempo.toLowerCase(),
          dificultad: dificultad.toLowerCase(),
          timestamp: Date.now(),
          user_id: user?.id,
          jugador_id: user?.jugador_id || null,
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
    [socket, inicializarSocket, user]
  );

  // Unirse al lobby multiplayer
  const unirseLobby = useCallback(() => {
    const socketInstance = inicializarSocket();
    socketInstance.emit('unirse_lobby');
  }, [socket, inicializarSocket]);

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
