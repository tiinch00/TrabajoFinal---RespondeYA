import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import useSound from 'use-sound';
import incorrecta from '/sounds/incorrecta.wav';
import correcta from '/sounds/correcta.wav';
import finalDeJuego from '/sounds/finalDeJuego.wav';
import ficeSeconds from '/sounds/fiveSeconds.mp3';
import musicaPreguntas from '/sounds/musicaPreguntas.mp3';

import axios from 'axios';

const JugarIndividual = () => {
  const navigate = useNavigate();
  const musicStartedRef = useRef(false); // Ref para controlar si la musica ya inicio

  const getStoredUser = () => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return { name: raw };
    }
  };

  const [playCorrect] = useSound(correcta, { volume: 0.6 });
  const [playWrong] = useSound(incorrecta, { volume: 0.6 });
  const [playTimeout] = useSound(finalDeJuego, { volume: 0.7 });
  const [fiveSeconds, { stop: stopFiveSeconds }] = useSound(ficeSeconds, { volume: 0.7 });
  const [playing, { stop }] = useSound(musicaPreguntas, { volume: 0.2, loop: true });

  const { categoria, tiempo, dificultad } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState('');
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState('');
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);
  const [contador, setContador] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(pasarTiempo(tiempo));

  const [contadorInicial, setContadorInicial] = useState(5);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [mostrarContador, setMostrarContador] = useState(false);

  const user = getStoredUser();
  const [foto] = useState(user.foto_perfil);

  function pasarTiempo(tiempo) {
    if (tiempo === 'Facíl' || tiempo === 'Easy') return '15';
    if (tiempo === 'Media' || tiempo === 'Medium') return '10';
    if (tiempo === 'Dificíl' || tiempo === 'Hard') return '5';
    return '';
  }

  // detener musica cuando el juego termina
  useEffect(() => {
    if (juegoTerminado) {
      stop();
      musicStartedRef.current = false;
    }
  }, [juegoTerminado, stop]);

  // limpiar musica al desmontar el componente
  useEffect(() => {
    return () => {
      stop();
      stopFiveSeconds();
    };
  }, [stop]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const categoriaDB = async () => {
      try {
        setLoading(true);

        let dificultadTraducida = dificultad.toLowerCase();
        if (dificultadTraducida === 'easy' || dificultadTraducida === 'facíl')
          dificultadTraducida = 'facil';
        if (dificultadTraducida === 'medium' || dificultadTraducida === 'media')
          dificultadTraducida = 'normal';
        if (dificultadTraducida === 'hard' || dificultadTraducida === 'dificíl')
          dificultadTraducida = 'dificil';
        const res = await axios.get(
          `http://localhost:3006/preguntas/categoria/${categoria.toLowerCase()}/${dificultadTraducida.toLowerCase()}`
        );

        if (res.data && res.data.length > 0) {
          const preguntasAleatorias = res.data.sort(() => Math.random() - 0.5).slice(0, 10);
          setPreguntas(preguntasAleatorias);
          setPreguntaActual(preguntasAleatorias[0]);
          setMostrarContador(true);
        } else {
          setAlerta('No se encontraron preguntas para esta categoría o dificultad.');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching preguntas:', error.response?.data || error.message);
        setAlerta(
          error.response?.data?.error || 'Error al cargar las preguntas. Intenta de nuevo.'
        );
        setLoading(false);
      }
    };
    categoriaDB();
  }, [categoria, dificultad]);

  useEffect(() => {
    if (mostrarContador && contadorInicial > 0) {
      if (contadorInicial > 4) {
        fiveSeconds();
      }
      const timer = setTimeout(() => {
        setContadorInicial(contadorInicial - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (mostrarContador && contadorInicial === 0 && !juegoIniciado && !juegoTerminado) {
      setJuegoIniciado(true);
      // Iniciar música solo una vez
      if (!musicStartedRef.current) {
        playing();
        musicStartedRef.current = true;
      }
    }
  }, [contadorInicial, mostrarContador, juegoIniciado, juegoTerminado, playing]);

  useEffect(() => {
    if (!preguntaActual || !juegoIniciado || juegoTerminado) return;

    setTiempoRestante(pasarTiempo(tiempo));

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGuardarRespuesta(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [preguntaActual, juegoIniciado, juegoTerminado]);

  const handleGuardarRespuesta = (opcion) => {
    if (!opcion) {
      setRespuestas((prev) => [...prev, { texto: 'Sin respuesta', es_correcta: false }]);
    } else {
      setRespuestas((prev) => [...prev, opcion]);
      setRespuestaSeleccionada(opcion);

      if (opcion.es_correcta === true) {
        setRespuestaCorrecta(opcion);
        playCorrect();
      } else {
        playWrong();
      }
    }

    setTimeout(() => {
      const siguiente = contador + 1;

      if (siguiente < preguntas.length) {
        setContador(siguiente);
        setPreguntaActual(preguntas[siguiente]);
        setRespuestaSeleccionada(null);
        setRespuestaCorrecta(null);
      } else {
        setAlerta('Juego terminado ✅');
        setTiempoRestante('0');
        setJuegoTerminado(true);
        setJuegoIniciado(false);
        playTimeout();
      }
    }, 500);
  };

  if (mostrarContador && contadorInicial > 0) {
    return (
      <div className='min-h-screen flex items-start justify-center relative overflow-hidden'>
        <div className='relative z-10 text-center'>
          <h1 className='text-5xl md:text-6xl font-black text-white mb-8 drop-shadow-lg'>
            ¡Prepárate!
          </h1>

          <div className='bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4 rounded-3xl text-white text-2xl font-bold mb-6 shadow-2xl border-2 border-purple-400'>
            🎮 Categoría: <span className='text-yellow-300'>{categoria?.toUpperCase()}</span>
          </div>

          <div className='space-y-5 mb-4 bg-black/30 p-4 rounded-2xl backdrop-blur-sm border border-purple-400/50'>
            <p className='text-white text-xl flex items-center justify-center gap-3'>
              <span className='text-2xl'>⏱️</span>
              Tiempo por pregunta:{' '}
              <span className='font-bold text-yellow-300'>{pasarTiempo(tiempo)}s</span>
            </p>
            <p className='text-white text-xl flex items-center justify-center gap-3'>
              <span className='text-2xl'>📊</span>
              Dificultad: <span className='font-bold text-orange-400 capitalize'>{dificultad}</span>
            </p>
            <p className='text-white text-xl flex items-center justify-center gap-3'>
              <span className='text-2xl'>❓</span>
              Total de preguntas: <span className='font-bold text-green-400'>10</span>
            </p>
          </div>

          <div className='mb-4'>
            <div className='text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 animate-pulse drop-shadow-[0_0_60px_rgba(250,204,21,1)]'>
              {contadorInicial}
            </div>
          </div>

          <div className='text-white text-2xl font-bold animate-bounce'>
            El juego comenzará en...
          </div>
        </div>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-indigo-950 to-purple-900 flex items-center justify-center'>
        <div className='text-center space-y-8'>
          <div className='relative w-20 h-20 mx-auto'>
            <div className='absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-spin'></div>
            <div className='absolute inset-2 bg-gradient-to-b from-indigo-950 to-purple-900 rounded-full'></div>
          </div>
          <p className='text-white text-3xl font-bold'>Cargando preguntas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-full text-white pt-5'>
      <div className='grid grid-cols-5 gap-6 h-screen pt-15'>
        {/* Panel izquierdo - Usuario */}
        <div className='col-span-1 flex flex-col items-center justify-start'>
          <div className='bg-gradient-to-b from-blue-600/40 to-blue-700/70 rounded-2xl p-6 shadow-xl w-full'>
            <div className='flex flex-col items-center'>
              {user?.foto_perfil ? (
                <img
                  src={`http://localhost:3006${user.foto_perfil}`}
                  alt='Foto de perfil'
                  className='w-24 h-24 rounded-full object-cover border-4 border-yellow-300 shadow-lg mb-4'
                />
              ) : (
                <div className='w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-5xl mb-4 shadow-lg'>
                  👤
                </div>
              )}
              <span className='bg-blue-800 px-4 py-2 rounded-full text-sm font-bold text-center text-yellow-300'>
                {user?.name || 'Usuario'}
              </span>
            </div>
          </div>
        </div>

        <div className='col-span-3 flex flex-col items-center justify-start'>
          <div className='bg-gradient-to-r from-orange-500 to-pink-500 rounded-full px-8 py-3 mb-8 text-2xl font-black shadow-lg'>
            {categoria?.toUpperCase()}
          </div>

          {alerta ? (
            <div className='bg-red-500/20 border-2 border-red-500 text-red-200 p-6 rounded-2xl text-xl font-bold text-center'>
              {alerta}
            </div>
          ) : preguntaActual && juegoIniciado ? (
            <div className='bg-black/40 border-2 border-purple-400 rounded-2xl p-8 w-full max-w-2xl shadow-2xl'>
              <div className='mb-6'>
                <span className='text-sm font-bold text-yellow-300'>
                  Pregunta {contador + 1}/10
                </span>
              </div>

              <p className='text-2xl font-bold text-white mb-8 leading-relaxed'>
                {preguntaActual.enunciado}
              </p>

              <div className='space-y-4'>
                {preguntaActual.Opciones.map((opcion, index) => {
                  let colorClase =
                    'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600';

                  if (respuestaSeleccionada === opcion) {
                    colorClase = respuestaCorrecta
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 scale-105'
                      : 'bg-gradient-to-r from-red-500 to-pink-500 scale-105';
                  }

                  return (
                    <button
                      key={index}
                      className={`w-full rounded-xl py-4 px-6 cursor-pointer transition-all font-bold text-lg text-white shadow-lg border-2 border-transparent hover:border-yellow-300 disabled:opacity-50 ${colorClase}`}
                      onClick={() => handleGuardarRespuesta(opcion)}
                      disabled={!!respuestaSeleccionada}
                    >
                      {opcion.texto}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className='text-xl text-gray-300'>No hay preguntas disponibles.</p>
          )}

          {juegoTerminado && (
            <div className='bg-black/50 rounded-2xl p-8 mt-8 w-full max-w-2xl'>
              <h2 className='text-2xl font-bold text-yellow-300 mb-6'>Resumen de Respuestas</h2>
              <div className='space-y-3 max-h-64 overflow-y-auto'>
                {respuestas.map((respuesta, index) => (
                  <div
                    key={index}
                    className='bg-purple-500/20 p-3 rounded-lg border border-purple-400'
                  >
                    <p className='text-sm'>
                      <span className='font-bold text-yellow-300'>P{index + 1}:</span>{' '}
                      {respuesta.texto}
                      <span
                        className={`ml-2 font-bold ${
                          respuesta.es_correcta ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {respuesta.es_correcta ? '✓' : '✗'}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel derecho - Tiempo */}
        <div className='col-span-1 flex flex-col items-center justify-start'>
          <div
            className={`rounded-3xl px-6 py-4 text-center shadow-2xl border-4 w-full ${
              tiempoRestante <= 5 && tiempoRestante > 0
                ? 'bg-gradient-to-b from-red-500 to-orange-600 border-red-300/30 animate-pulse'
                : 'bg-gradient-to-b from-yellow-300/80 to-yellow-400/80 border-yellow-400'
            }`}
          >
            <p className='text-sm font-bold text-gray-800 mb-2'>⏱️ TIEMPO</p>
            <p
              className={`text-5xl font-black ${
                tiempoRestante <= 5 && tiempoRestante > 0 ? 'text-white' : 'text-red-600'
              }`}
            >
              {tiempoRestante}
            </p>
            <p className='text-xs font-bold text-gray-800 mt-2'>segundos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JugarIndividual;
