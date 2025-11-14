import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import axios from "axios";

const SalaPartidas = () => {
  const [salas, setSalas] = useState([]);
  const API = 'http://localhost:3006';

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

  const updateEstadoSala = async (id) => {
    try {
      const { data } = await axios.put(`${API}/salas/${id}`,
        { estado: "en_curso", },
      );
      if (!data) {
        return null;
      } else {
        console.log("Cambio de estado listo");
      }
      //const { password, ...safe } = data;
    } catch (e) {
      console.error('PUT /salas/:id', e.response?.data?.error || e.message);
    }
  }

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
                  onClick={() => updateEstadoSala(sala.id)}
                  className='cursor-pointer'
                >
                  <Link to={`/salaEspera/${sala.codigo}`} className='shadow-lg'>
                    <div className=' bg-gradient-to-br from-pink-300/10 via-violet-500/90 to-pink-800/10 rounded-4xl shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 border-2 sm:border-3 md:border-4 border-violet-400 text-white p-4'>
                      {/* <p className='font-semibold text-lg mb-2'>{sala.id}</p> */}
                      <p className='font-semibold text-lg mb-2'>Tiempo: </p>
                      <p className='font-semibold text-lg mb-2'>Categoria: </p>
                      <p className='font-semibold text-lg mb-2'>Preguntas: </p>
                      <p className='font-semibold text-mb'>{sala.estado}...</p>
                    </div>
                  </Link>
                </button>
              ))}
            </>
          ) : (
            <div>
              {/* {console.log("salas.length :", salas.length)}; */}
              <span className='text-white'>No hay salas en "espera" disponibles...</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SalaPartidas;
