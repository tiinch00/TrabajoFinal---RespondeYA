import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ChatGlobal from './ChatGlobal';

const Home = () => {
  const [mostrarJugarOptions, setMostrarJugarOptions] = useState('');
  const [chatAbierto, setChatAbierto] = useState(false);

  return (
    <div className='rounded-3xl text-center relative'>
      <div className='w-90 mt-2 rounded-4xl flex flex-col text-center items-center justify-center text-white'>
        <div className='flex flex-col items-center'>
          <button
            onClick={() => setMostrarJugarOptions(!mostrarJugarOptions)}
            className='bg-amber-600 w-70 h-15 rounded-4xl mb-2 cursor-pointer hover:scale-105 transition-transform'
          >
            Jugar
          </button>

          {mostrarJugarOptions && (
            <div className='flex flex-col gap-2 mt-2 items-center'>
              <p className='bg-violet-700 w-80 rounded'>
                <strong>Modo de Juego</strong>
              </p>
              <Link
                to='/crearPartida'
                className='bg-amber-500 w-60 h-12 rounded-2xl cursor-pointer hover:scale-105 transition-transform flex items-center justify-center'
              >
                Individual
              </Link>
              <Link
                to='*'
                className='bg-amber-500 w-60 h-12 rounded-2xl cursor-pointer hover:scale-105 transition-transform flex items-center justify-center'
              >
                Multijugador
              </Link>
            </div>
          )}
        </div>

        <Link
          to='/Ruleta'
          className='w-70 h-15 hover:scale-105 text-white transition-transform cursor-pointer bg-amber-600 rounded-4xl flex items-center justify-center mb-1 mt-4 p-1'
        >
          Ruleta
        </Link>
        <Link
          to='/Ranking'
          className='w-70 h-15 hover:scale-105 text-white transition-transform cursor-pointer bg-amber-600 rounded-4xl flex items-center justify-center mb-1 mt-4 p-1'
        >
          Ranking Mundial
        </Link>
      </div>

      {/* boton flotante para abrir el chat */}
      <button
        onClick={() => setChatAbierto(!chatAbierto)}
        className='fixed top-65 right-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-50 cursor-pointer'
      >
        <MessageCircle size={24} />
      </button>

      <AnimatePresence>
        {chatAbierto && (
          <motion.div
            key='chat-global'
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className='fixed top-80 right-0 bg-white shadow-2xl z-40 flex flex-col rounded-2xl'
          >
            <ChatGlobal />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
