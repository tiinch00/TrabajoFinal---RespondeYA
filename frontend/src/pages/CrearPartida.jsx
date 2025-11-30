import { ChevronDown, Gamepad } from 'lucide-react';
import { useEffect, useState } from 'react';

import pop from '/sounds/pop.mp3';
import start from '/sounds/start.mp3';
import { useGame } from '../context/ContextJuego.jsx';
import { useNavigate } from 'react-router-dom';
import useSound from 'use-sound';
import { useTranslation } from 'react-i18next';

const CrearPartida = ({ modo }) => {
  const {
    user,
    categorias,
    fetchCategorias,
    loadingUser,
    loadingCategorias,
    crearPartida,
  } = useGame();
  const { t } = useTranslation();
  const [categoria, setCategoria] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [alerta, setAlerta] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [touchButton] = useSound(pop, { volume: 0.2 });
  const [startButton] = useSound(start, { volume: 0.2 });
  const navigate = useNavigate();

  const categoryTranslations = {
    Cine: t('cinema'),
    Historia: t('history'),
    'Conocimiento General': t('generalKnowLedge'),
    Geografía: t('geography'),
    Informatica: t('informatic'),
  };

  useEffect(() => {
    if (user) {
      fetchCategorias();
    }
  }, [user]);
  const handleJugar = () => {
    if (!categoria || !tiempo || !dificultad) {
      setAlerta(t('alert'));
      return;
    }
    // console.log('Datos de la partida a jugar');
    // console.log(categoria);
    // console.log(tiempo);
    // console.log(dificultad);

    if (!user) {
      setAlerta(t('mustLogin') || 'Tenés que iniciar sesión primero.');
      return;
    }


    startButton();
    setAlerta(t('goodLuck'));

    setTimeout(() => {
      crearPartida(modo, { categoria, tiempo, dificultad }, navigate);
    }, 1500);
  };

  const handleRuletaClick = () => {
    if (categorias.length === 0 || isSpinning) return;

    touchButton();
    setIsSpinning(true);

    const wheel = document.getElementById('ruleta-wheel');
    if (!wheel) return;

    // 1) reset animacion previa
    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';

    // 2) esperar un frame para aplicar la nueva animacion
    requestAnimationFrame(() => {
      const spins = 20;
      const duration = 2000;
      const randomIndex = Math.floor(Math.random() * categorias.length);
      const degreesPerCategory = 360 / categorias.length;
      const randomCategory = categorias[randomIndex];

      const categoryStartAngle = randomIndex * degreesPerCategory;
      const halfCategory = degreesPerCategory / 2;

      const targetAngle = categoryStartAngle + halfCategory;

      const finalRotation = spins * 360 + (270 - targetAngle);

      wheel.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      wheel.style.transform = `rotate(${finalRotation}deg)`;

      setTimeout(() => {
        setCategoria(randomCategory.nombre);
        setShowDropdown(false);
        setIsSpinning(false);
      }, duration);
    });
  };

  // Mientras se carga el usuario
  if (loadingUser) {
    return (
      <p className='text-center text-white text-lg sm:text-xl md:text-2xl'>
        {t('loadingUser') || 'Cargando usuario...'} 🌟
      </p>
    );
  }

  // Si no hay usuario logueado → mandalo al login
  if (!user) {
    navigate('/login'); // o la ruta que uses
    return null;
  }

  // Mientras se cargan categorías
  if (loadingCategorias) {
    return (
      <p className='text-center text-white text-lg sm:text-xl md:text-2xl'>
        {t('loadingCategory')} 🌟
      </p>
    );
  }

  const nivelesOptions = [t('easy'), t('medium'), t('hard')];
  const degreesPerCategory = 360 / categorias.length;

  return (
    <div className='mt-1 sm:mt-5 xl:mt-4 pb-6 xl:pb-1 flex items-start justify-center w-full'>

      <div className='p-1 sm:p-1 sm:pl-4 sm:pr-4 xl:p-2 xl:w-120 
      rounded-2xl md:rounded-3xl text-center text-white 
      space-y-6 md:mb-2 xl:mb-5 
      bg-gradient-to-br from-purple-900/30 via-purple-800/40 to-indigo-900/50 shadow-2xl'>

        {/* Ruleta y Select */}
        <div>
          {/* Titulo: tipo de categoria */}
          <h2 className='bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text 
          text-lg sm:text-lg lg1120:text-sm xl:text-lg
          font-extrabold tracking-wider drop-shadow-lg sm:pb-6 xl:pb-7'>
            🎯 {t('categoryType')}
          </h2>

          {/* container de Ruleta */}
          <div className='gap-2 sm:gap-2 grid grid-cols-1 items-center justify-center w-full'>

            <div className='relative flex flex-col items-center justify-center gap-2 xl:gap-2'>

              <div className='absolute -top-6 z-30 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[16px] border-l-transparent border-r-transparent border-t-yellow-400 xl:border-l-[12px] xl:border-r-[12px] xl:border-t-[16px]'></div>

              <button
                onClick={handleRuletaClick}
                disabled={isSpinning || categorias.length === 0}
                className={`relative w-32 h-32 lg1120:w-20 lg1120:h-20 xl:w-32 xl:h-32 xl1600:w-68 xl1600:h-68 rounded-full shadow-2xl transform transition-transform duration-300 ${!isSpinning ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'
                  }`}
              >
                {/* Fondo del botón */}
                <div className='absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full'></div>

                {/* Ruleta */}
                <svg
                  id='ruleta-wheel'
                  className='absolute inset-0 w-full h-full'
                  viewBox='0 0 100 100'
                  style={{ transition: 'none' }}
                >
                  {categorias.map((cat, index) => {
                    const startAngle = index * degreesPerCategory;
                    const endAngle = startAngle + degreesPerCategory;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;

                    const x1 = 50 + 50 * Math.cos(startRad);
                    const y1 = 50 + 50 * Math.sin(startRad);
                    const x2 = 50 + 50 * Math.cos(endRad);
                    const y2 = 50 + 50 * Math.sin(endRad);

                    const largeArc = degreesPerCategory > 180 ? 1 : 0;

                    const colors = [
                      '#FF6B6B',
                      '#4ECDC4',
                      '#45B7D1',
                      '#FFA07A',
                      '#98D8C8',
                      '#F7DC6F',
                      '#BB8FCE',
                      '#85C1E2',
                    ];

                    return (
                      <g key={`slice-${cat.id}`}>
                        <path
                          d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={colors[index % colors.length]}
                          stroke='white'
                          strokeWidth='0.5'
                        />

                        {(() => {
                          const categoryName = categoryTranslations[cat.nombre] || cat.nombre;
                          const words = categoryName.toUpperCase().split(' ');

                          // divide el texto si tiene mas de dos palabras
                          if (words.length > 1 && categoryName.length > 12) {
                            return (
                              <g transform={`rotate(${startAngle + degreesPerCategory / 2} 50 50)`}>
                                <text
                                  x='50'
                                  y='50'
                                  textAnchor='middle'
                                  dominantBaseline='middle'
                                  transform='translate(30 -3)'
                                  fill='white'
                                  fontSize='4.5'
                                  fontWeight='bold'
                                  style={{ pointerEvents: 'none' }}
                                >
                                  {words.slice(0, Math.ceil(words.length / 2)).join(' ')}
                                </text>
                                <text
                                  x='50'
                                  y='50'
                                  textAnchor='middle'
                                  dominantBaseline='middle'
                                  transform='translate(31 3)'
                                  fill='white'
                                  fontSize='5'
                                  fontWeight='bold'
                                  style={{ pointerEvents: 'none' }}
                                >
                                  {words.slice(Math.ceil(words.length / 2)).join(' ')}
                                </text>
                              </g>
                            );
                          } else {
                            // texto sola linea
                            return (
                              <text
                                x='50'
                                y='50'
                                textAnchor='middle'
                                dominantBaseline='middle'
                                transform={`rotate(${startAngle + degreesPerCategory / 2
                                  } 50 50) translate(30 0)`}
                                fill='white'
                                fontSize='4.5'
                                fontWeight='bold'
                                style={{ pointerEvents: 'none' }}
                              >
                                {categoryName.substring(0, 16).toUpperCase()}
                              </text>
                            );
                          }
                        })()}
                      </g>
                    );
                  })}
                </svg>
                {/* Ruleta del medio */}
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                w-10 h-10 xl:w-12 xl:h-12 
                rounded-full shadow-lg flex items-center justify-center z-10'>
                  <div className='text-md xl:text-xl'>🎲</div>
                </div>

              </button>

              <p className='text-xs sm:text-xs font-semibold text-cyan-300'>
                {isSpinning ? t('spining') : t('touch')}
              </p>
            </div>

            {/* Dropdown - SELECT - tradicional */}
            <div className='relative flex-1 flex  items-center justify-center'>
              <button
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  touchButton();
                }}
                className={`w-64 bg-gradient-to-r from-indigo-500 to-purple-600 px-3 
                  sm:px-4 xl:px-6 py-1 sm:py-1 xl:py-1 
                  rounded-full font-bold text-sm sm:text-base 
                  text-white shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer active:scale-95 flex justify-center items-center gap-1 
                  sm:gap-2 ${categoria ? 'ring-2 sm:ring-4 ring-yellow-400 ring-opacity-70' : ''
                  }`}
              >
                <span className='truncate'>
                  {categoria ? categoryTranslations[categoria] || categoria : t('choose')}
                </span>
                <ChevronDown className='w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0' />
              </button>

              {showDropdown && (
                <div className='absolute top-full mt-2 sm:w-fit xl:w-60 bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden z-20 animate-fadeIn max-h-48 md:max-h-60 overflow-y-auto'>
                  {categorias.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategoria(cat.nombre);
                        setShowDropdown(false);
                        touchButton();
                      }}
                      className='block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-purple-800 hover:bg-purple-100 font-medium text-sm xl:text-base transition'
                    >
                      {categoryTranslations[cat.nombre]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Dificultad de tiempo */}
        <div className='space-y-2 lg1120:space-y-2 xl:space-y-2'>
          <h2 className='bg-gradient-to-r from-red-500 to-orange-500 text-red-500 bg-clip-text 
          text-lg sm:text-xl lg1120:text-sm xl:text-lg 
          font-extrabold tracking-wider drop-shadow-lg'>
            ⏱️ {t('dificultyTime')}
          </h2>

          <div className='flex justify-center gap-2 sm:gap-3 xl:gap-3 flex-wrap'>
            {nivelesOptions.map((nivel) => (
              <button
                key={`tiempo-${nivel}`}
                onClick={() => {
                  setTiempo(nivel);
                  touchButton();
                }}
                className={`px-4 sm:px-6 lg1120:px-6 xl:px-8 
                  py-2 sm:py-2.5 lg1120:py-1.5 xl:py-1                 
                  text-xs xl:text-sm 
                  text-white rounded-full font-bold  shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap ${nivel === t('easy')
                    ? 'bg-gradient-to-r from-lime-500 to-emerald-600'
                    : nivel === t('medium')
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                      : 'bg-gradient-to-r from-red-500 to-rose-600'
                  } ${tiempo === nivel ? 'ring-2 sm:ring-4 ring-white ring-opacity-80 shadow-2xl' : ''
                  }`}
              >
                {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dificultad de preguntas */}
        <div className='space-y-2 lg1120:space-y-2 xl:space-y-2'>
          <h2 className='bg-gradient-to-r from-blue-500 to-cyan-500 text-blue-500 bg-clip-text 
          text-lg sm:text-xl lg1120:text-sm xl:text-lg font-extrabold tracking-wider drop-shadow-lg'>
            ❓ {t('dificultyQuestions')}
          </h2>

          <div className='flex justify-center gap-2 sm:gap-3 xl:gap-2 flex-wrap'>
            {nivelesOptions.map((nivel) => (
              <button
                key={`dificultad-${nivel}`}
                onClick={() => {
                  setDificultad(nivel);
                  touchButton();
                }}
                className={`px-4 sm:px-6 lg1120:px-6 xl:px-8 
                  py-2 sm:py-1.5 lg1120:py-1.5 xl:py-1
                  text-xs xl:text-sm
                  rounded-full font-bold text-white shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap ${nivel === t('easy')
                    ? 'bg-gradient-to-r from-green-500 to-teal-600'
                    : nivel === t('medium')
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
                      : 'bg-gradient-to-r from-pink-500 to-red-600'
                  } ${dificultad === nivel
                    ? 'ring-2 sm:ring-4 ring-white ring-opacity-80 shadow-2xl'
                    : ''
                  }`}
              >
                {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* JUGAR AHORA */}
        <div className='flex flex-col items-center justify-center xl:mb-4'>
          <button
            onClick={handleJugar}
            className='bg-gradient-to-r from-emerald-500 to-lime-600 w-full max-w-88
          py-1 sm:py-1.5 lg1120:py-1.5 xl:py-1.5 
          rounded-full font-extrabold 
          text-base sm:text-xs xl:text-xs 
          text-white shadow-xl transform transition-all duration-300 cursor-pointer hover:scale-105 hover:from-emerald-400 hover:to-lime-500 active:scale-95 flex items-center justify-center gap-2 animate-pulse-subtle'
          >
            <Gamepad className='text-black h-5 w-6 xl:h-6 xl:w-8' />
            {t('playNow')}
          </button>
        </div>

        {/* VALIDACION DEL FORMULARIO JUGAR AHORA */}
        {alerta && (
          <p className='text-yellow-300 font-bold animate-bounce text-sm sm:text-xs xl:text-xs'>
            {alerta}
          </p>
        )}

      </div>

    </div>
  );
};

export default CrearPartida;
