import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/ContextJuego.jsx';
import { useTranslation } from 'react-i18next';
import { Gamepad } from 'lucide-react';
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
  const [showDropdown, setShowDropdown] = useState(false); // Para el dropdown personalizado
  const [touchButton] = useSound(pop, { volume: 0.3 });
  const [startButton] = useSound(start, { volume: 0.3 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleJugar = () => {
    if (!categoria || !tiempo || !dificultad) {
      setAlerta('¡Completa todo antes de jugar! 🎮');
      return;
    }
    startButton();
    setAlerta('Mucha Suerte!');

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

  if (loading) return <p className='text-center text-white text-xl'>{t('loadingCategory')}🌟</p>;

  return (
    <div className='m-3 flex items-center justify-center'>
      <div className='p-6 rounded-3xl text-center text-white space-y-8 w-[520px] bg-gradient-to-br from-purple-900/30 via-purple-800/40 to-indigo-900/50 shadow-2xl'>
        <div className='space-y-4'>
          <h2 className='bg-gradient-to-r from-pink-500 to-yellow-500 text-transparent bg-clip-text text-2xl font-extrabold tracking-wider drop-shadow-lg'>
            🎯 {t('categoryType')}
          </h2>
          <div className='flex justify-center gap-3 flex-wrap'>
            <button
              onClick={handleAlAzar}
              className='
                bg-gradient-to-r from-cyan-500 to-blue-600 
                px-5 py-3 rounded-full font-bold text-white 
                shadow-lg transform transition-all duration-200 cursor-pointer
                hover:scale-110 hover:shadow-2xl hover:from-cyan-400 hover:to-blue-500
                active:scale-95 flex items-center gap-2
              '
            >
              🎲 {t('azar')}
            </button>

            {/* Dropdown personalizado */}
            <div className='relative'>
              <button
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  touchButton();
                }}
                className={`
                  bg-gradient-to-r from-indigo-500 to-purple-600 
                  px-6 py-3 rounded-full font-bold text-white 
                  shadow-lg transform transition-all duration-200 
                  hover:scale-105 hover:shadow-xl cursor-pointer
                  active:scale-95 min-w-[180px] flex justify-center items-center gap-2
                  ${categoria ? 'ring-4 ring-yellow-400 ring-opacity-70' : ''}
                `}
              >
                {categoria || t('choose')} ▼
              </button>
              {showDropdown && (
                <div className='absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-fadeIn'>
                  {categorias.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategoria(cat.nombre);
                        setShowDropdown(false);
                        touchButton();
                      }}
                      className='block w-full text-left px-4 py-3 text-purple-800 hover:bg-purple-100 font-medium transition'
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className='
              bg-gradient-to-r from-teal-500 to-green-600 
              px-6 py-3 rounded-full font-bold text-white cursor-pointer
              shadow-lg transform transition-all duration-200 
              hover:scale-110 hover:shadow-2xl hover:from-teal-400 hover:to-green-500
              active:scale-95 flex items-center gap-2
            '
            >
              🎰 {t('varias')}
            </button>
          </div>
        </div>
        <div className='space-y-4'>
          <h2 className='bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text text-2xl font-extrabold tracking-wider drop-shadow-lg'>
            ⏱️ {t('dificultyTime')}
          </h2>
          <div className='flex justify-center gap-4'>
            {[t('easy'), t('medium'), t('hard')].map((nivel) => (
              <button
                key={nivel}
                onClick={() => {
                  setTiempo(nivel);
                  touchButton();
                }}
                className={`
                  px-8 py-3 rounded-full font-bold text-white 
                  shadow-lg transform transition-all duration-200 
                  hover:scale-110 active:scale-95 cursor-pointer
                  ${
                    nivel === 'Facíl'
                      ? 'bg-gradient-to-r from-lime-500 to-emerald-600'
                      : nivel === 'Media'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                      : 'bg-gradient-to-r from-red-500 to-rose-600'
                  }
                  ${tiempo === nivel ? 'ring-4 ring-white ring-opacity-80 shadow-2xl' : ''}
                `}
              >
                {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className='space-y-4'>
          <h2 className='bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text text-2xl font-extrabold tracking-wider drop-shadow-lg'>
            ❓ {t('dificultyQuestions')}
          </h2>
          <div className='flex justify-center gap-4'>
            {[t('easy'), t('medium'), t('hard')].map((nivel) => (
              <button
                key={nivel}
                onClick={() => {
                  setDificultad(nivel);
                  touchButton();
                }}
                className={`
                  px-8 py-3 rounded-full font-bold text-white 
                  shadow-lg transform transition-all duration-200 
                  hover:scale-110 active:scale-95 cursor-pointer
                  ${
                    nivel === 'Facíl'
                      ? 'bg-gradient-to-r from-green-500 to-teal-600'
                      : nivel === 'Media'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
                      : 'bg-gradient-to-r from-pink-500 to-red-600'
                  }
                  ${dificultad === nivel ? 'ring-4 ring-white ring-opacity-80 shadow-2xl' : ''}
                `}
              >
                {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleJugar}
          className='
            bg-gradient-to-r from-emerald-500 to-lime-600 
            w-full py-4 rounded-full font-extrabold text-xl text-white 
            shadow-xl transform transition-all duration-300 cursor-pointer
            hover:scale-105 hover:from-emerald-400 hover:to-lime-500
            active:scale-95 flex items-center justify-center gap-2
            animate-pulse-subtle
          '
        >
          <Gamepad className='text-black h-6 w-8' />
          {t('playNow')}
        </button>

        {alerta && <p className='text-yellow-300 font-bold animate-bounce'>{alerta}</p>}
      </div>
    </div>
  );
};

export default CrearPartida;
