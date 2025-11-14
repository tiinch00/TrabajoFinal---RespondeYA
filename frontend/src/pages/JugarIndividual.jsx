import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import useSound from 'use-sound';
import incorrecta from '/sounds/incorrecta.wav';
import correcta from '/sounds/correcta.wav';
import finalDeJuego from '/sounds/finalDeJuego.wav';
import fiveSeconds from '/sounds/fiveSeconds.mp3';
import musicaPreguntas from '/sounds/musicaPreguntasEdit.mp3';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import confetti from 'canvas-confetti';

import axios from 'axios';

const JugarIndividual = () => {
  const navigate = useNavigate();
  const musicStartedRef = useRef(false);
  const { t } = useTranslation();
  const canvasRef = useRef(null);

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
  const [fiveSecondsSound, { stop: stopFiveSeconds }] = useSound(fiveSeconds, { volume: 0.7 });
  const [playing, { stop }] = useSound(musicaPreguntas, { volume: 0.2, loop: true });

  const categoryTranslations = {
    cine: t('cinema'),
    historia: t('history'),
    'conocimiento general': t('generalKnowLedge'),
    geografía: t('geography'),
    informatica: t('informatic'),
  };
  const [idioma, setIdioma] = useState(i18n.language);
  const { categoria, tiempo, dificultad } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState('');
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);
  const [contador, setContador] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(1);
  const [categoriaId, setCategoriaId] = useState('');
  const [contadorInicial, setContadorInicial] = useState(5);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [mostrarContador, setMostrarContador] = useState(false);
  const [cronometroPausado, setCronometroPausado] = useState(false);
  const [mostrarEspera, setMostrarEspera] = useState(false);
  const [tiempoTotalJugado, setTiempoTotalJugado] = useState(0);

  useEffect(() => {
    if (canvasRef.current) {
      confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });
    }
  }, []);
  const confetiFinal = () => {
    confetti({
      particleCount: 200,
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2,
      },
    });
  };
  // console.log(tiempo + 1);
  // console.log(dificultad + 2);
  const user = getStoredUser();
  const timerRef = useRef(null);
  const tiempoRestanteRef = useRef(pasarTiempo(tiempo));
  function pasarTiempo(tiempo) {
    if (tiempo === 'Facíl' || tiempo === 'Easy') return 15;
    if (tiempo === 'Media' || tiempo === 'Medium') return 12;
    if (tiempo === 'Difícil' || tiempo === 'Hard') return 8;
    return '';
  }
  useEffect(() => {
    const handleLangChange = (lng) => setIdioma(lng);
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);
  // detener musica cuando el juego termina
  useEffect(() => {
    if (juegoTerminado) {
      stop();
      musicStartedRef.current = false;
    }
  }, [juegoTerminado, stop]);

  useEffect(() => {
    return () => {
      stop();
      stopFiveSeconds();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stop, stopFiveSeconds]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const categoriaDB = async () => {
      try {
        setLoading(true);

        let dificultadTraducida = dificultad.toLowerCase();
        if (dificultadTraducida === 'easy' || dificultadTraducida === 'facíl')
          dificultadTraducida = 'facil';
        if (dificultadTraducida === 'medium' || dificultadTraducida === 'media')
          dificultadTraducida = 'normal';
        if (dificultadTraducida === 'hard' || dificultadTraducida === 'difícil')
          dificultadTraducida = 'dificil';

        // let categoriaTraducida = categoria;
        // if (categoriaTraducida === 'Geography') dificultadTraducida = 'Geografía';
        // if (categoriaTraducida === 'Histoy') dificultadTraducida = 'Historia';
        // if (categoriaTraducida === 'Informatic') categoriaTraducida = 'Informatica';
        // if (categoriaTraducida === 'Cinema') categoriaTraducida = 'Cine';
        // if (categoriaTraducida === 'General Knowledge') categoriaTraducida = 'General Knowledge';

        const { data } = await axios.get(
          `http://localhost:3006/preguntas/categoria/${categoria.toLowerCase()}/${dificultadTraducida.toLowerCase()}`
        );

        if (data && data.length > 0) {
          const preguntasAleatorias = data.sort(() => Math.random() - 0.5).slice(0, 10);
          setCategoriaId(data[0].categoria_id);
          const preguntasConOpcionesMezcladas = preguntasAleatorias.map((pregunta) => ({
            ...pregunta,
            Opciones: pregunta.Opciones.sort(() => Math.random() - 0.5),
          }));
          setPreguntas(preguntasConOpcionesMezcladas);
          setPreguntaActual(preguntasConOpcionesMezcladas[0]);
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

  //contador inicial
  useEffect(() => {
    if (mostrarContador && contadorInicial > 0) {
      if (contadorInicial > 4) {
        fiveSecondsSound();
      }
      const timer = setTimeout(() => {
        setContadorInicial(contadorInicial - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (mostrarContador && contadorInicial === 0 && !juegoIniciado && !juegoTerminado) {
      setJuegoIniciado(true);
      setTiempoRestante(pasarTiempo(tiempo));
      if (!musicStartedRef.current) {
        playing();
        musicStartedRef.current = true;
      }
    }
  }, [
    contadorInicial,
    mostrarContador,
    juegoIniciado,
    juegoTerminado,
    playing,
    fiveSecondsSound,
    tiempo,
  ]);

  //manejar el cronometro
  useEffect(() => {
    if (!preguntaActual || !juegoIniciado || juegoTerminado || cronometroPausado) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        tiempoRestanteRef.current = prev - 1;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleGuardarRespuesta(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [preguntaActual, juegoIniciado, juegoTerminado, cronometroPausado, tiempo]);

  const calcularPuntaje = (respuestasCor, tiempo, dificultad) => {
    if (!respuestasCor || respuestasCor.length === 0) return 0;

    let multiplicador = 1;
    const diff = tiempo.toLowerCase();
    if (diff.includes('facil') || diff.includes('easy')) multiplicador = 1;
    if (diff.includes('media') || diff.includes('medium') || diff.includes('normal'))
      multiplicador = 1.3;
    if (diff.includes('dificil') || diff.includes('hard')) multiplicador = 1.6;

    let puntos = 0;
    respuestasCor.forEach((respuesta) => {
      const tiempo = respuesta.tiempo; // en segundos
      if (tiempo <= 3) puntos += 10;
      else if (tiempo <= 5) puntos += 7;
      else if (tiempo <= 8) puntos += 5;
      else if (tiempo <= 12) puntos += 3;
      else puntos += 1;
    });
    const dificult = dificultad.toLowerCase();
    let puntosDificultad = 0;
    if (dificult.includes('facíl') || dificult.includes('easy'))
      puntosDificultad = 5 * respuestasCor.length;
    if (dificult.includes('media') || dificult.includes('medium'))
      puntosDificultad = 10 * respuestasCor.length;
    if (dificult.includes('difícil') || dificult.includes('hard'))
      puntosDificultad = 15 * respuestasCor.length;
    console.log(puntos);
    console.log(puntosDificultad);
    return Math.round((puntos + puntosDificultad) * multiplicador);
  };

  const handleGuardarRespuesta = (opcion) => {
    setCronometroPausado(true);
    const tiempoTotal = pasarTiempo(tiempo);
    const tiempoRestanteActual = tiempoTotal - tiempoRestanteRef.current;
    const tiempoRespuesta = Math.max(tiempoRestanteActual, 1);

    let nuevasRespuestas;

    if (!opcion) {
      playWrong();
      nuevasRespuestas = [
        ...respuestas,
        { texto: 'Sin respuesta', es_correcta: false, tiempoRespuesta },
      ];
    } else {
      nuevasRespuestas = [...respuestas, { ...opcion, tiempoRespuesta }];
      setRespuestaSeleccionada(opcion);

      if (opcion.es_correcta === true) {
        setRespuestaCorrecta(opcion);
        playCorrect();
      } else {
        playWrong();
      }
    }
    setRespuestas(nuevasRespuestas);
    setTiempoTotalJugado((prevTiempo) => prevTiempo + tiempoRespuesta);

    const tiempoTotalAcumulado = tiempoTotalJugado + tiempoRespuesta;

    setTimeout(() => {
      const siguiente = contador + 1;

      if (siguiente < preguntas.length) {
        setMostrarEspera(true);

        setTimeout(() => {
          setContador(siguiente);
          setPreguntaActual(preguntas[siguiente]);
          setRespuestaSeleccionada(null);
          setRespuestaCorrecta(null);
          setCronometroPausado(false);
          setMostrarEspera(false);

          //reiniciar tiempo
          const nuevoTiempo = pasarTiempo(tiempo);
          tiempoRestanteRef.current = nuevoTiempo;
          setTiempoRestante(nuevoTiempo);
        }, 2000);
      } else {
        // Fin del juego
        setAlerta(t('gameOver'));
        guardarPartidaEnBD(nuevasRespuestas, tiempoTotalAcumulado);
        setJuegoTerminado(true);
        setJuegoIniciado(false);
        setTiempoRestante(0);
        playTimeout();

        for (let i = 0; i < 10; i++) {
          setTimeout(confetiFinal, 500 + i * 500); // 500ms inicial + 150ms entre cada confeti
        }
      }
    }, 1000);
  };

  const guardarPartidaEnBD = async (respuestasFinales, tiempoTotal) => {
    try {
      let diffTiempo = tiempo.toLowerCase();

      if (diffTiempo.includes('facíl') || diffTiempo.includes('easy')) diffTiempo = 'facil';
      if (diffTiempo.includes('media') || diffTiempo.includes('medium')) diffTiempo = 'normal';
      if (diffTiempo.includes('difícil') || diffTiempo.includes('hard')) diffTiempo = 'dificil';

      let dificultadPregunta = dificultad.toLocaleLowerCase();
      if (dificultadPregunta.includes('facíl') || dificultadPregunta.includes('easy'))
        dificultadPregunta = 'facil';
      if (dificultadPregunta.includes('media') || dificultadPregunta.includes('medium'))
        dificultadPregunta = 'normal';
      if (dificultadPregunta.includes('difícil') || dificultadPregunta.includes('hard'))
        dificultadPregunta = 'dificil';

      const respuestasCorrectas = respuestasFinales.filter((r) => r.es_correcta).length;
      const respuestasIncorrectas = respuestasFinales.length - respuestasCorrectas;
      const datosPartida = {
        sala_id: null,
        categoria_id: categoriaId,
        modo: 'individual',
        total_preguntas: preguntas.length,
        dificultad_tiempo: diffTiempo,
        dificultad_pregunta: dificultadPregunta,
        estado: 'finalizada',
        created_at: new Date(),
        started_at: new Date(),
        ended_at: new Date(),
      };

      const response = await axios.post('http://localhost:3006/partidas/create', datosPartida);
      const partidaId = response.data.id;
      console.log('Partida guardada:', response.data);
      await crearPartidaJugador(partidaId);
      const partidaPregunta = await enviarPartidaPreguntas(partidaId);
      const partidaPreguntaID = partidaPregunta?.id;
      const estadisticasRes = await guardarEstadisticas(
        partidaId,
        respuestasCorrectas,
        respuestasIncorrectas,
        tiempoTotal,
        respuestasFinales
      );

      const estadisticasResID = estadisticasRes?.id;
      await guardarRespuesta(respuestasFinales, partidaId, estadisticasResID, partidaPreguntaID);
    } catch (error) {
      console.error('Error al guardar partida:', error);
      //setAlerta('Error al guardar la partida');
    }
  };

  const crearPartidaJugador = async (partidaId) => {
    const id = user?.jugador_id;
    const datosPartida = {
      partida_id: partidaId,
      jugador_id: id,
    };
    try {
      const res = await axios.post('http://localhost:3006/partida_jugadores/create', datosPartida);
      return res.data;
    } catch (error) {
      console.error('Error al crear partidaJugador:', error);
      //setAlerta('Error al crear partidaJugador');
      throw error;
    }
  };

  const enviarPartidaPreguntas = async (partidaId) => {
    try {
      const promesas = preguntas.map((pregunta, index) => {
        return axios.post('http://localhost:3006/partida_preguntas/create', {
          partida_id: partidaId,
          pregunta_id: pregunta.id,
          orden: index + 1,
          question_text_copy: pregunta.enunciado,
          correct_option_id_copy: pregunta.Opciones.find((o) => o.es_correcta)?.id || null,
          correct_option_text_copy: pregunta.Opciones.find((o) => o.es_correcta)?.texto || null,
        });
      });

      const resultados = await Promise.all(promesas);
      console.log('Todas las preguntas fueron guardadas', resultados[0]?.data);

      return resultados[0]?.data;
    } catch (error) {
      console.error('Error al enviar preguntas:', error);
      //setAlerta('Error al guardar las preguntas');
    }
  };

  const guardarEstadisticas = async (
    partidaId,
    respuestasCorrectas,
    respuestasIncorrectas,
    tiempoTotal,
    respuestasFinales
  ) => {
    const id = user?.jugador_id;
    try {
      const tiempoTotalMs = tiempoTotal * 1000;
      const respuestasCor = respuestasFinales
        .filter((respuesta) => respuesta.es_correcta === true)
        .map((respuesta, index) => ({
          id: index,
          tiempo: respuesta.tiempoRespuesta,
        }));
      console.log(respuestasFinales);
      console.log(respuestasCor);

      const puntos = calcularPuntaje(respuestasCor, tiempo, dificultad);

      const datosEstadisticas = {
        jugador_id: id,
        partida_id: partidaId,
        posicion: 1,
        puntaje_total: puntos,
        total_correctas: respuestasCorrectas,
        total_incorrectas: respuestasIncorrectas,
        tiempo_total_ms: tiempoTotalMs,
      };

      const responseEstadisticas = await axios.post(
        'http://localhost:3006/estadisticas/create',
        datosEstadisticas
      );
      console.log('Estadísticas guardadas:', responseEstadisticas.data);
      return responseEstadisticas.data;
    } catch (error) {
      console.error('Error al guardar estadísticas:', error);
      //setAlerta('Error al guardar las estadísticas');
    }
  };

  const guardarRespuesta = async (
    respuestasFinales,
    partidaId,
    estadisticasResId,
    partidaPreguntaId
  ) => {
    const id = user?.jugador_id;
    try {
      const promesas = respuestasFinales.map((respuesta, index) => {
        const tiempoUsado = respuesta.tiempoRespuesta ?? 0;
        const tiempoRespuestaMs = tiempoUsado * 1000;

        return axios
          .post('http://localhost:3006/respuestas/create', {
            partida_id: partidaId,
            jugador_id: id,
            pregunta_id: preguntas[index].id,
            partida_pregunta_id: partidaPreguntaId,
            opcion_elegida_id: respuesta.texto === 'Sin respuesta' ? null : respuesta.id,
            estadistica_id: estadisticasResId,
            es_correcta: respuesta.texto === 'Sin respuesta' ? false : respuesta.es_correcta,
            tiempo_respuesta_ms: tiempoRespuestaMs,
          })
          .catch((error) => {
            console.error(`❌ Error en respuesta ${index + 1}:`, error.response?.data);
            return null;
          });
      });

      const resultados = await Promise.allSettled(promesas);
      console.log('Resultados:', resultados);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (mostrarContador && contadorInicial > 0) {
    return (
      <div className='min-h-screen flex items-start justify-center relative overflow-hidden'>
        <div className='relative z-10 text-center'>
          <h1 className='text-5xl md:text-6xl font-black text-white mb-8 drop-shadow-lg'>
            {t('beReady')}
          </h1>

          <div className='bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4 rounded-3xl text-white text-2xl font-bold mb-6 shadow-2xl border-2 border-purple-400'>
            🎮 {t('category')}:{' '}
            <span className='text-yellow-300'>
              {' '}
              {categoryTranslations[categoria]?.toUpperCase()}
            </span>
          </div>

          <div className='space-y-5 mb-4 bg-black/30 p-4 rounded-2xl backdrop-blur-sm border border-purple-400/50'>
            <p className='text-white text-xl flex items-center justify-center gap-3'>
              <span className='text-2xl'>⏱️</span>
              {t('timeQuestion')}:{' '}
              <span className='font-bold text-yellow-300'>{pasarTiempo(tiempo)}s</span>
            </p>
            <p className='text-white text-xl flex items-center justify-center gap-3'>
              <span className='text-2xl'>📊</span>
              {t('dificulty')}:{' '}
              <span className='font-bold text-orange-400 capitalize'>{dificultad}</span>
            </p>
            <p className='text-white text-xl flex items-center justify-center gap-3'>
              <span className='text-2xl'>❓</span>
              {t('questionTotal')}: <span className='font-bold text-green-400'>10</span>
            </p>
          </div>

          <div className='mb-4'>
            <div className='text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 animate-pulse drop-shadow-[0_0_60px_rgba(250,204,21,1)]'>
              {contadorInicial}
            </div>
          </div>

          <div className='text-white text-2xl font-bold animate-bounce'>{t('gameStarting')}</div>
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
          <p className='text-white text-3xl font-bold'>{t('loadingQuestions')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-full text-white pt-5'>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
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
            {categoryTranslations[categoria]?.toUpperCase()}
          </div>

          {alerta ? (
            <div className='bg-red-500/20 border-2 border-red-500 text-red-200 p-6 rounded-2xl text-xl font-bold text-center'>
              {alerta}
            </div>
          ) : mostrarEspera ? (
            <div className='bg-black/40 border-2 border-purple-400 rounded-2xl p-8 w-full max-w-2xl shadow-2xl text-center'>
              <div className='flex flex-col items-center justify-center gap-4'>
                <div className='flex justify-center gap-2'>
                  <div className='w-3 h-3 bg-yellow-300 rounded-full animate-bounce'></div>
                  <div
                    className='w-3 h-3 bg-yellow-300 rounded-full animate-bounce'
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className='w-3 h-3 bg-yellow-300 rounded-full animate-bounce'
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
                <p className='text-2xl font-bold text-yellow-300 animate-pulse'>
                  {t('nextQuestion')}
                </p>
              </div>
            </div>
          ) : preguntaActual && juegoIniciado ? (
            <div className='bg-black/40 border-2 border-purple-400 rounded-2xl p-8 w-full max-w-2xl shadow-2xl'>
              <div className='mb-6'>
                <span className='text-sm font-bold  text-yellow-300'>
                  Pregunta {contador + 1}/10
                </span>
              </div>

              <p className='text-3xl font-bold text-white mb-8 text-center leading-relaxed'>
                {idioma === 'en' ? preguntaActual.enunciado_en : preguntaActual.enunciado}
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
                      {idioma === 'en' ? opcion.texto_en : opcion.texto}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className='text-xl text-gray-300'>{t('noAvaliableQuestions')}.</p>
          )}

          {juegoTerminado && (
            <div className='bg-black/50 rounded-2xl p-8 mt-8 w-full max-w-2xl'>
              <h2 className='text-2xl font-bold text-yellow-300 mb-6'>{t('resumeAnswer')}</h2>
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

        <div className='col-span-1 flex flex-col items-center justify-start'>
          <div
            className={`rounded-3xl px-6 py-4 text-center shadow-2xl border-4 w-full ${
              tiempoRestante <= 5 && tiempoRestante > 0
                ? 'bg-gradient-to-b from-red-500 to-orange-600 border-red-300/30 animate-pulse'
                : 'bg-gradient-to-b from-yellow-300/80 to-yellow-400/80 border-yellow-400'
            }`}
          >
            <p className='text-sm font-bold text-gray-800 mb-2'>⏱️ {t('timer')}</p>
            <p
              className={`text-5xl font-black ${
                tiempoRestante <= 5 && tiempoRestante > 0 ? 'text-white' : 'text-red-600'
              }`}
            >
              {tiempoRestante}
            </p>
            <p className='text-xs font-bold text-gray-800 mt-2'>{t('seconds')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JugarIndividual;
