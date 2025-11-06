import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import axios from "axios";

const SalaPartidas = () => {
  const [salas, setSalas] = useState([]);

  const getSalas = async () => {
    try {
      const estado = "esperando";
      const { data } = await axios.get(
        "http://localhost:3006/salas/",
        { params: { estado } }   // <-- params
      );
      setSalas(data);
    } catch (e) {
      console.error('GET /salas', e.response?.data?.error || e.message);
    }
  };

  useEffect(() => {
    getSalas();
  }, []);

  const handleJoinGame = (gameId) => {
    alert(`Te uniste a la Partida ${gameId}`);
  };

  return (
    <div className='h-full w-full p-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8 flex items-center justify-center'>
          <Link to='/crearMultijugador'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='w-50 h-14 cursor-pointer bg-gradient-to-br from-green-400 to-green-500  rounded-full shadow-xl hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center gap-3 border-4 border-green-300'
            >
              Crear Partida
            </motion.button>
          </Link>
        </div>

        <h2 className='text-3xl font-bold text-purple-200 my-10 w-110 rounded-2xl'>
          Listado de partidas para unirte
        </h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6'>
          {salas.length > 0 ? (
            <>              
              {salas.map((sala) => (
                <button
                  key={sala.id}
                  onClick={() => handleJoinGame(sala.id)}
                  className='group cursor-pointer transform transition-transform duration-300 hover:scale-105'
                >
                  <Link to={`/salaEspera/${sala.codigo}`} className='bg-pink-200 rounded-3xl p-1 shadow-lg'>
                    <div className='bg-blue-300 rounded-2xl h-32 flex flex-col items-center justify-center group-hover:shadow-inner transition-shadow duration-300'>
                      <p className='text-purple-900 font-semibold text-lg mb-2'>{sala.id}</p>
                      <p className='text-purple-900 font-semibold text-lg mb-2'>Categoria ID: {sala.categoria_id}</p>
                      <p className='text-purple-700 text-sm'>Estado: {sala.estado}</p>
                      <p className='text-purple-700 text-sm'>Codigo: {sala.codigo}</p>
                    </div>
                  </Link>
                </button>
              ))}
            </>
          ) : (
            <div>
              {console.log("salas.length :", salas.length)};
              <span className='text-white'>No hay salas en "espera" disponibles...</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SalaPartidas;
