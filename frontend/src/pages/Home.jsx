import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Dice5, Trophy, ChevronDown, User, Users } from 'lucide-react';
import ChatGlobal from './ChatGlobal';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const [mostrarJugarOptions, setMostrarJugarOptions] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);
  const { t, i18n } = useTranslation();

  return (
    <div className='rounded-3xl text-center relative mt-4'>
      <div className='w-90 mt-2 rounded-4xl flex flex-col text-center items-center justify-center text-white gap-5'>
        <div className='flex flex-col items-center w-full max-w-md'>
          <motion.button
            onClick={() => setMostrarJugarOptions(!mostrarJugarOptions)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='relative bg-gradient-to-br from-yellow-100 via-orange-300 to-orange-400 w-full h-16 rounded-full cursor-pointer shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 border-4 border-yellow-300'
          >
            <div className='flex items-center justify-center gap-3'>
              <Play className='w-6 h-6 fill-white stroke-white' />
              <span className='text-2xl font-black tracking-wide text-white drop-shadow-lg'>
                {t('play')}
              </span>
              <motion.div
                animate={{ rotate: mostrarJugarOptions ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className='w-6 h-6 text-white' />
              </motion.div>
            </div>
          </motion.button>

          <AnimatePresence>
            {mostrarJugarOptions && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className='flex flex-col gap-3 mt-4 w-full'
              >
                <div className='bg-purple-600/90 backdrop-blur-sm py-2 rounded-xl text-lg font-bold text-white border-2 border-purple-400'>
                  {t('gameMode')}
                </div>

                <Link to='/crearPartida'>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='w-full cursor-pointer bg-gradient-to-br from-blue-400 to-blue-500 h-14 rounded-full shadow-xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-3 border-4 border-blue-300'
                  >
                    <User className='w-5 h-5 text-white' />
                    <span className='text-xl font-bold text-white'>{t('singlePlayer')}</span>
                  </motion.button>
                </Link>

                <Link to='*'>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='w-full cursor-pointer bg-gradient-to-br from-green-400 to-green-500 h-14 rounded-full shadow-xl hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center gap-3 border-4 border-green-300'
                  >
                    <Users className='w-5 h-5 text-white' />
                    <span className='text-xl font-bold text-white'>{t('multiPlayer')}</span>
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link to='/Ruleta' className='w-full max-w-md'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='relative bg-gradient-to-br from-yellow-100 via-orange-300 to-orange-400 w-full h-16 rounded-full cursor-pointer shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 border-4 border-yellow-300'
          >
            <div className='flex items-center justify-center gap-3'>
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <Dice5 className='w-6 h-6 text-white' />
              </motion.div>
              <span className='text-2xl font-black tracking-wide text-white drop-shadow-lg'>
                {t('roulette')}
              </span>
            </div>
          </motion.button>
        </Link>

        {/* ranking */}
        <Link to='/Ranking' className='w-full max-w-md'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='relative bg-gradient-to-br from-yellow-100 via-orange-300 to-orange-400 w-full h-16 rounded-full cursor-pointer shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 border-4 border-yellow-300'
          >
            <div className='flex items-center justify-center gap-3'>
              <motion.div whileHover={{ scale: 1.2, rotate: -10 }} transition={{ duration: 0.3 }}>
                <Trophy className='w-6 h-6 text-white' />
              </motion.div>
              <span className='text-2xl font-black tracking-wide text-white drop-shadow-lg'>
                {t('ranking')}
              </span>
            </div>
          </motion.button>
        </Link>
      </div>

      {/* boton chat */}
      <button
        onClick={() => setChatAbierto(!chatAbierto)}
        className='fixed top-65 right-5 bg-blue-600 hover:bg-blue-700 text-white p-4 cursor-pointer rounded-full shadow-2xl transition transform hover:scale-110'
      >
        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
          />
        </svg>
      </button>

      {/* chat abierto */}
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
