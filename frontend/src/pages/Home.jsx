import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Dice5, Play, Trophy, User, Users, Volume2, VolumeX } from 'lucide-react';

import ChatGlobal from './ChatGlobal';
import { Link } from 'react-router-dom';
import { useMusic } from '../context/MusicContext.jsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const [mostrarJugarOptions, setMostrarJugarOptions] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);
  const { t } = useTranslation();
  const { isMuted, toggleMute } = useMusic();

  return (
    <div className='rounded-2xl md:rounded-3xl text-center relative py-3 my-6 md:my-12 min-h-screen'>
      <div className='w-full px-4 sm:px-6 md:px-8 rounded-2xl md:rounded-4xl flex flex-col text-center items-center justify-center text-white gap-4 md:gap-6'>
        <div className='flex flex-col items-center w-full max-w-xs sm:max-w-sm'>
          <motion.button
            onClick={() => setMostrarJugarOptions(!mostrarJugarOptions)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className='relative bg-gradient-to-br from-yellow-100 via-orange-300 to-orange-400 h-12 sm:h-14 md:h-16 lg:h-16 lg:w-82 rounded-full cursor-pointer shadow-2xl hover:shadow-orange-300/50 transition-all duration-300 border-2 sm:border-3 md:border-4 border-yellow-300'
          >
            <div className='flex items-center justify-center gap-2 sm:gap-3'>
              <Play className='w-5 h-5 sm:w-6 sm:h-6 fill-white stroke-white' />
              <span className='text-lg sm:text-xl md:text-2xl font-black tracking-wide text-white drop-shadow-lg'>
                {t('play')}
              </span>
              <motion.div
                animate={{ rotate: mostrarJugarOptions ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
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
                className='flex flex-col  items-center gap-2 sm:gap-3 mt-3 md:mt-4 w-full'
              >
                <Link to='/crearIndividual'>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className=' cursor-pointer bg-gradient-to-br from-blue-400 to-blue-500 h-11 sm:h-13 md:h-14 md:w-65 rounded-full shadow-xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 border-2 sm:border-3 md:border-4 border-blue-300'
                  >
                    <User className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                    <span className='text-base sm:text-lg md:text-xl font-bold text-white'>
                      {t('singlePlayer')}
                    </span>
                  </motion.button>
                </Link>

                <Link to='/salaPartidas'>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className=' cursor-pointer bg-gradient-to-br from-green-400 to-green-500 h-11 sm:h-13 md:h-14 md:w-65 rounded-full shadow-xl hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 border-2 sm:border-3 md:border-4 border-green-300'
                  >
                    <Users className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                    <span className='text-base sm:text-lg md:text-xl font-bold text-white'>
                      {t('multiPlayer')}
                    </span>
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link to='/Ruleta' className='w-full max-w-xs sm:max-w-sm'>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className='relative bg-gradient-to-br from-yellow-100 via-orange-300 to-orange-400 w-full h-12 sm:h-14 md:h-16 lg:h-16 lg:w-82 rounded-full cursor-pointer shadow-2xl hover:shadow-orange-300/50 transition-all duration-300 border-2 sm:border-3 md:border-4 border-yellow-300'
          >
            <div className='flex items-center justify-center gap-2 sm:gap-3'>
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <Dice5 className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
              </motion.div>
              <span className='text-lg sm:text-xl md:text-2xl font-black tracking-wide text-white drop-shadow-lg'>
                {t('roulette')}
              </span>
            </div>
          </motion.button>
        </Link>

        <Link to='/Ranking' className='w-full max-w-xs sm:max-w-sm'>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className='relative bg-gradient-to-br from-yellow-100 via-orange-300 to-orange-400 h-12 sm:h-14 md:h-16 lg:h-16 lg:w-82  rounded-full cursor-pointer shadow-2xl hover:shadow-orange-300/50 transition-all duration-300 border-2 sm:border-3 md:border-4 border-yellow-300'
          >
            <div className='flex items-center justify-center gap-2 sm:gap-3 sm:px-4'>
              <motion.div whileHover={{ scale: 1.2, rotate: -10 }} transition={{ duration: 0.3 }}>
                <Trophy className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
              </motion.div>
              <span className='text-lg sm:text-xl md:text-2xl font-black tracking-wide text-white drop-shadow-lg'>
                {t('ranking')}
              </span>
            </div>
          </motion.button>
        </Link>
      </div>

      <motion.button
        onClick={toggleMute}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className='relative top-7 left-0 sm:top-7 sm:left-0 bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white p-3 sm:p-4 rounded-full shadow-lg z-20 cursor-pointer transition-all border-2 border-gray-600'
      >
        {isMuted ? (
          <VolumeX className='w-5 h-5 sm:w-10 sm:h-10' />
        ) : (
          <Volume2 className='w-5 h-5 sm:w-10 sm:h-10' />
        )}
      </motion.button>

      {/* BOTÓN DEL CHAT */}
      <motion.button
        onClick={() => setChatAbierto(!chatAbierto)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className='fixed bottom-6 right-4
             sm:bottom-6 sm:right-6
             bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600
             text-white p-3 sm:p-4 cursor-pointer rounded-full shadow-2xl transition
             z-[60] border-2 border-blue-400'
      >
        <svg
          className='w-5 h-5 sm:w-6 sm:h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
          />
        </svg>
      </motion.button>

      {/* PANEL DEL CHAT */}
      <AnimatePresence>
        {chatAbierto && (
          <motion.div
            key='chat-global'
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className='fixed
                rounded-lg
                 bottom-32 right-3          {/* antes bottom-20 */}
                 sm:bottom-24 sm:right-6    {/* antes sm:bottom-16 */}
                 w-[90vw] max-w-sm
                 sm:w-76 lg:w-96
                 max-h-[80vh] 
                 z-[55]'
          >
            <div className='h-full max-h-[56vh] bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col'>
              <ChatGlobal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
