import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SalaPartidas = () => {
  const [games, setGames] = useState([
    { id: 1, name: 'Partida 1', players: 2 },
    { id: 2, name: 'Partida 2', players: 4 },
    { id: 3, name: 'Partida 3', players: 3 },
    { id: 4, name: 'Partida 4', players: 1 },
    { id: 5, name: 'Partida 5', players: 5 },
    { id: 6, name: 'Partida 6', players: 2 },
    { id: 7, name: 'Partida 7', players: 3 },
    { id: 8, name: 'Partida 8', players: 4 },
    { id: 9, name: 'Partida 9', players: 1 },
    { id: 10, name: 'Partida 10', players: 2 },
  ]);

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
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => handleJoinGame(game.id)}
              className='group cursor-pointer transform transition-transform duration-300 hover:scale-105'
            >
              <div className='bg-pink-200 rounded-3xl p-1 shadow-lg'>
                <div className='bg-blue-300 rounded-2xl h-32 flex flex-col items-center justify-center group-hover:shadow-inner transition-shadow duration-300'>
                  <p className='text-purple-900 font-semibold text-lg mb-2'>{game.name}</p>
                  <p className='text-purple-700 text-sm'>{game.players} jugadores</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalaPartidas;
