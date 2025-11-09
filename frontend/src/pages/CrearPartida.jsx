import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/ContextJuego.jsx';
import { useTranslation } from 'react-i18next';
import { Gamepad, ChevronDown } from 'lucide-react';
import pop from '/sounds/pop.mp3';
import useSound from 'use-sound';
import start from '/sounds/start.mp3';

const CrearPartida = ({ modo }) => {
  const { categorias, fetchCategorias, loading, crearPartida } = useGame();
  const { t } = useTranslation();
  const [categoria, setCategoria] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [alerta, setAlerta] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [touchButton] = useSound(pop, { volume: 0.3 });
  const [startButton] = useSound(start, { volume: 0.3 });
  const navigate = useNavigate();

  const categoryTranslations = {
    Cine: t('cinema'),
    Historia: t('history'),
    'Conocimiento General': t('generalKnowLedge'),
    Geografía: t('geography'),
    Informatica: t('informatic'),
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleJugar = () => {
    if (!categoria || !tiempo || !dificultad) {
      setAlerta(t('alert'));
      return;
    }
    startButton();
    setAlerta(t('goodLuck'));

    setTimeout(() => {
      crearPartida(modo, { categoria, tiempo, dificultad }, navigate);
    }, 1500);
  };

  const handleAlAzar = () => {
    if (categorias.length === 0) return;
    const categoriaAzar = categorias[Math.floor(Math.random() * categorias.length)];
    setCategoria(categoriaAzar.nombre);
    setShowDropdown(false);
    touchButton();
  };

  if (loading)
    return (
      <p className='text-center text-white text-lg sm:text-xl md:text-2xl'>
        {t('loadingCategory')}🌟
      </p>
    );

  const nivelesOptions = [t('easy'), t('medium'), t('hard')];

  return (
    <div className='mt-2 sm:mt-3 md:mt-4 flex items-center justify-center   w-full h-full'>
      <div className='p-4 sm:p-6 md:p-8 lg:p-8 rounded-2xl md:rounded-3xl text-center text-white space-y-6  md:mb-5 lg:mb-5 bg-gradient-to-br from-purple-900/30 via-purple-800/40 to-indigo-900/50 shadow-2xl'>
        <div className='space-y-3 md:space-y-4'>
          <h2 className='bg-gradient-to-r from-pink-500 to-yellow-500 text-transparent bg-clip-text text-lg sm:text-xl md:text-2xl font-extrabold tracking-wider drop-shadow-lg'>
            🎯 {t('categoryType')}
          </h2>
          <div className='flex justify-center gap-2 sm:gap-3 flex-wrap w-full'>
            <button
              onClick={handleAlAzar}
              className='bg-gradient-to-r from-cyan-500 to-blue-600 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-full font-bold text-sm sm:text-base text-white shadow-lg transform transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl hover:from-cyan-400 hover:to-blue-500 active:scale-95 flex items-center gap-1 sm:gap-2 whitespace-nowrap'
            >
              🎲 {t('azar')}
            </button>

            <div className='relative flex-1 min-w-fit max-w-xs'>
              <button
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  touchButton();
                }}
                className={`w-60 bg-gradient-to-r from-indigo-500 to-purple-600 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-bold text-sm sm:text-base text-white shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer active:scale-95 flex justify-center items-center gap-1 sm:gap-2 ${
                  categoria ? 'ring-2 sm:ring-4 ring-yellow-400 ring-opacity-70' : ''
                }`}
              >
                <span className='truncate'>
                  {categoria ? categoryTranslations[categoria] || categoria : t('choose')}
                </span>

                <ChevronDown className='w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0' />
              </button>

              {showDropdown && (
                <div className='absolute top-full mt-2 w-full bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden z-20 animate-fadeIn max-h-48 md:max-h-60 overflow-y-auto'>
                  {categorias.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategoria(cat.nombre);
                        setShowDropdown(false);
                        touchButton();
                      }}
                      className='block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-purple-800 hover:bg-purple-100 font-medium text-sm sm:text-base transition'
                    >
                      {categoryTranslations[cat.nombre] || cat.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className='bg-gradient-to-r from-teal-500 to-green-600 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-full font-bold text-sm sm:text-base text-white cursor-pointer shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl hover:from-teal-400 hover:to-green-500 active:scale-95 flex items-center gap-1 sm:gap-2 whitespace-nowrap'>
              🎰 {t('varias')}
            </button>
          </div>
        </div>

        <div className='space-y-3 md:space-y-4'>
          <h2 className='bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text text-lg sm:text-xl md:text-2xl font-extrabold tracking-wider drop-shadow-lg'>
            ⏱️ {t('dificultyTime')}
          </h2>
          <div className='flex justify-center gap-2 sm:gap-3 md:gap-4 flex-wrap'>
            {nivelesOptions.map((nivel) => (
              <button
                key={`tiempo-${nivel}`}
                onClick={() => {
                  setTiempo(nivel);
                  touchButton();
                }}
                className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full font-bold text-sm sm:text-base text-white shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap ${
                  nivel === t('easy')
                    ? 'bg-gradient-to-r from-lime-500 to-emerald-600'
                    : nivel === t('medium')
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                    : 'bg-gradient-to-r from-red-500 to-rose-600'
                } ${
                  tiempo === nivel ? 'ring-2 sm:ring-4 ring-white ring-opacity-80 shadow-2xl' : ''
                }`}
              >
                {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className='space-y-3 md:space-y-4'>
          <h2 className='bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text text-lg sm:text-xl md:text-2xl font-extrabold tracking-wider drop-shadow-lg'>
            ❓ {t('dificultyQuestions')}
          </h2>
          <div className='flex justify-center gap-2 sm:gap-3 md:gap-4 flex-wrap'>
            {nivelesOptions.map((nivel) => (
              <button
                key={`dificultad-${nivel}`}
                onClick={() => {
                  setDificultad(nivel);
                  touchButton();
                }}
                className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full font-bold text-sm sm:text-base text-white shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap ${
                  nivel === t('easy')
                    ? 'bg-gradient-to-r from-green-500 to-teal-600'
                    : nivel === t('medium')
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
                    : 'bg-gradient-to-r from-pink-500 to-red-600'
                } ${
                  dificultad === nivel
                    ? 'ring-2 sm:ring-4 ring-white ring-opacity-80 shadow-2xl'
                    : ''
                }`}
              >
                {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleJugar}
          className='bg-gradient-to-r from-emerald-500 to-lime-600 w-full py-3 sm:py-3.5 md:py-4 rounded-full font-extrabold text-base sm:text-lg md:text-xl text-white shadow-xl transform transition-all duration-300 cursor-pointer hover:scale-105 hover:from-emerald-400 hover:to-lime-500 active:scale-95 flex items-center justify-center gap-2 animate-pulse-subtle'
        >
          <Gamepad className='text-black h-5 w-6 sm:h-6 sm:w-8' />
          {t('playNow')}
        </button>

        {alerta && (
          <p className='text-yellow-300 font-bold animate-bounce text-sm sm:text-base md:text-lg'>
            {alerta}
          </p>
        )}
      </div>
    </div>
  );
};

export default CrearPartida;
