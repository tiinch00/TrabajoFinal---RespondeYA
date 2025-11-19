import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import axios from 'axios';
import confetti from 'canvas-confetti';
import correcta from '/sounds/correcta.wav';
import finalDeJuego from '/sounds/finalDeJuego.wav';
import fiveSeconds from '/sounds/fiveSeconds.mp3';
import { resolveFotoAjena } from '../utils/resolveFotoAjena.js';
import i18n from 'i18next';
import incorrecta from '/sounds/incorrecta.wav';
import musicaPreguntasDefault from '/sounds/musicaPreguntasDefault.mp3';
import cine from '/sounds/cine.mp3';
import historia from '/sounds/historia.mp3';
import geografia from '/sounds/geografia.mp3';
import informatica from '/sounds/informatica.mp3';
import conocimientoGeneral from '/sounds/conocimientoGeneral.mp3';
import useSound from 'use-sound';
import { useTranslation } from 'react-i18next';

const JugarIndividual = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';
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

  const [playCorrect] = useSound(correcta, { volume: 0.3 });
  const [playWrong] = useSound(incorrecta, { volume: 0.3 });
  const [playTimeout] = useSound(finalDeJuego, { volume: 0.5 });
  const [fiveSecondsSound, { stop: stopFiveSeconds }] = useSound(fiveSeconds, { volume: 0.4 });
  const [playing, { stop }] = useSound(musicaPreguntasDefault, { volume: 0.5 });
  const [playingCine, { stop: cineStop }] = useSound(cine, { volume: 0.7 });
  const [playingHistoria, { stop: historiaStop }] = useSound(historia, { volume: 0.3 });
  const [playingGeografia, { stop: geografiaStop }] = useSound(geografia, { volume: 0.4 });
  const [playingInformatica, { stop: informaticaStop }] = useSound(informatica, { volume: 0.4 });
  const [playingConocimiento, { stop: conocimientoStop }] = useSound(conocimientoGeneral, {
    volume: 0.5,
  });

  const categoryTranslations = {
    cine: t('cinema'),
    historia: t('history'),
    'conocimiento general': t('generalKnowLedge'),
    geografía: t('geography'),
    informatica: t('informatic'),
  };

  // NUEVO: Mapeo de iconos por categoría
  const categoryIcons = {
    cine: '🎬',
    historia: '📜',
    'conocimiento general': '🧠',
    geografía: '🌍',
    informatica: '💻',
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

  useEffect(() => {
    if (juegoTerminado) {
      stop();
      historiaStop();
      cineStop();
      geografiaStop();
      informaticaStop();
      conocimientoStop();
      musicStartedRef.current = false;
    }
  }, [
    juegoTerminado,
    stop,
    cineStop,
    historiaStop,
    geografiaStop,
    informaticaStop,
    conocimientoStop,
  ]);

  useEffect(() => {
    return () => {
      stop();
      historiaStop();
      cineStop();
      geografiaStop();
      informaticaStop();
      conocimientoStop();
      stopFiveSeconds();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    stop,
    stopFiveSeconds,
    cineStop,
    historiaStop,
    geografiaStop,
    conocimientoStop,
    informaticaStop,
  ]);

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

        const { data } = await axios.get(
          `${API_URL}/preguntas/categoria/${categoria.toLowerCase()}/${dificultadTraducida.toLowerCase()}`
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

  useEffect(() => {
    if (mostrarContador && contadorInicial > 0) {
      if (contadorInicial === 5) {
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
        if (categoria === 'cine' || categoria === 'cinema') {
          playingCine();
        } else if (categoria === 'historia' || categoria === 'history') {
          playingHistoria();
        } else if (categoria === 'geografía' || categoria === 'geografhy') {
          playingGeografia();
        } else if (categoria === 'informatica' || categoria === 'informatic') {
          playingInformatica();
        } else if (categoria === 'conocimiento general' || categoria === 'general knowledge') {
          playingConocimiento();
        } else {
          playing();
        }
        musicStartedRef.current = true;
      }
    }
  }, [
    contadorInicial,
    mostrarContador,
    juegoIniciado,
    juegoTerminado,
    playing,
    playingCine,
    playingHistoria,
    playingGeografia,
    playingInformatica,
    playingConocimiento,
    fiveSecondsSound,
    tiempo,
  ]);

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
      const tiempo = respuesta.tiempo;
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
        { texto: t('noAnswer'), es_correcta: false, tiempoRespuesta },
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

          const nuevoTiempo = pasarTiempo(tiempo);
          tiempoRestanteRef.current = nuevoTiempo;
          setTiempoRestante(nuevoTiempo);
        }, 2000);
      } else {
        setAlerta(t('gameOver'));
        guardarPartidaEnBD(nuevasRespuestas, tiempoTotalAcumulado);
        setJuegoTerminado(true);
        setJuegoIniciado(false);
        setTiempoRestante(0);
        playTimeout();

        for (let i = 0; i < 10; i++) {
          setTimeout(confetiFinal, 500 + i * 500);
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

      const response = await axios.post(`${API_URL}/partidas/create`, datosPartida);
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
    }
  };

  const crearPartidaJugador = async (partidaId) => {
    const id = user?.jugador_id;
    const datosPartida = {
      partida_id: partidaId,
      jugador_id: id,
    };
    try {
      const res = await axios.post(`${API_URL}/partida_jugadores/create`, datosPartida);
      return res.data;
    } catch (error) {
      console.error('Error al crear partidaJugador:', error);
      throw error;
    }
  };

  const enviarPartidaPreguntas = async (partidaId) => {
    try {
      const promesas = preguntas.map((pregunta, index) => {
        return axios.post(`${API_URL}/partida_preguntas/create`, {
          partida_id: partidaId,
          pregunta_id: pregunta.id,
          orden: index + 1,
          question_text_copy: pregunta.enunciado,
          question_text_copy_en: pregunta.enunciado_en,
          correct_option_id_copy: pregunta.Opciones.find((o) => o.es_correcta)?.id || null,
          correct_option_text_copy: pregunta.Opciones.find((o) => o.es_correcta)?.texto || null,
          correct_option_text_copy_en:
            pregunta.Opciones.find((o) => o.es_correcta)?.texto_en || null,
        });
      });

      const resultados = await Promise.all(promesas);
      console.log('Todas las preguntas fueron guardadas', resultados[0]?.data);

      return resultados[0]?.data;
    } catch (error) {
      console.error('Error al enviar preguntas:', error);
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
        `${API_URL}/estadisticas/create`,
        datosEstadisticas
      );
      console.log('Estadísticas guardadas:', responseEstadisticas.data);
      return responseEstadisticas.data;
    } catch (error) {
      console.error('Error al guardar estadísticas:', error);
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
          .post(`${API_URL}/respuestas/create`, {
            partida_id: partidaId,
            jugador_id: id,
            pregunta_id: preguntas[index].id,
            partida_pregunta_id: partidaPreguntaId,
            opcion_elegida_id:
              respuesta.texto === 'Sin respuesta' || respuesta.texto === 'No answer'
                ? null
                : respuesta.id,
            estadistica_id: estadisticasResId,
            es_correcta:
              respuesta.texto === 'Sin respuesta' || respuesta.texto === 'No answer'
                ? false
                : respuesta.es_correcta,
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
        <div className='relative z-10 text-center px-4 pt-8'>
          <h1 className='text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg'>
            {t('beReady')}
          </h1>

          <div className='bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-white text-sm sm:text-lg md:text-2xl font-bold mb-3 shadow-2xl border-2 border-purple-400 mx-auto w-full'>
            🎮 {t('category')}:{' '}
            <span className='text-yellow-300'>
              {categoryTranslations[categoria]?.toUpperCase()}
            </span>
          </div>

          <div className='space-y-2 sm:space-y-3 mb-4 bg-black/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm border border-purple-400/50 mx-auto'>
            <p className='text-white text-xs sm:text-sm md:text-lg flex items-center justify-center gap-2'>
              <span className='text-lg sm:text-xl'>⏱️</span>
              {t('timeQuestion')}:{' '}
              <span className='font-bold text-yellow-300'>{pasarTiempo(tiempo)}s</span>
            </p>
            <p className='text-white text-xs sm:text-sm md:text-lg flex items-center justify-center gap-2'>
              <span className='text-lg sm:text-xl'>📊</span>
              {t('dificulty')}:{' '}
              <span className='font-bold text-orange-400 capitalize'>{dificultad}</span>
            </p>
            <p className='text-white text-xs sm:text-sm md:text-lg flex items-center justify-center gap-2'>
              <span className='text-lg sm:text-xl'>❓</span>
              {t('questionTotal')}: <span className='font-bold text-green-400'>10</span>
            </p>
          </div>

          <div className='mb-4'>
            <div className='text-[80px] sm:text-[120px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 animate-pulse'>
              {contadorInicial}
            </div>
          </div>

          <div className='text-white text-lg sm:text-xl md:text-2xl font-bold animate-bounce'>
            {t('gameStarting')}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-indigo-950 to-purple-900 flex items-center justify-center px-4'>
        <div className='text-center space-y-6'>
          <div className='relative w-16 h-16 mx-auto'>
            <div className='absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-spin'></div>
            <div className='absolute inset-2 bg-gradient-to-b from-indigo-950 to-purple-900 rounded-full'></div>
          </div>
          <p className='text-white text-xl sm:text-2xl md:text-3xl font-bold'>
            {t('loadingQuestions')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen text-white px-2 py-3 sm:px-3 sm:py-5'>
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

      {/* MOBILE LAYOUT */}
      <div className='md:hidden flex flex-col items-center justify-start gap-2 sm:gap-3 min-h-screen pb-4'>
        {/* Usuario - Mobile */}
        <div className='bg-gradient-to-b from-black/40 to-blue-800/10 rounded-2xl p-2 sm:p-3 shadow-xl w-full border-2 border-blue-400/30'>
          <div className='flex flex-col items-center'>
            {user?.foto_perfil ? (
              <div className='relative group'>
                <div className='absolute inset-0 rounded-full bg-gradient-to-b from-white via-amber-200 to-violet-300 animate-spin-slow opacity-60 blur-sm scale-110'></div>
                <img
                  src={resolveFotoAjena(user?.foto_perfil)}
                  alt='Foto de perfil'
                  className='relative w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-blue-800/10 shadow-lg mb-1'
                />
              </div>
            ) : (
              <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl sm:text-3xl mb-1 shadow-lg'>
                👤
              </div>
            )}
            <span className='bg-blue-800 px-2 py-1 rounded-full text-xs font-bold text-center text-white'>
              {user?.name || 'Usuario'}
            </span>
          </div>
        </div>

        {/* Categoría - Mobile */}
        <div className='relative group w-full'>
          <div className='absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-400 to-orange-400 rounded-full blur-xl opacity-50 animate-pulse'></div>
          <div className='relative bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 rounded-full px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-lg font-black shadow-2xl border-2 border-yellow-300/50 text-center'>
            <span className='text-lg sm:text-2xl mr-2'>
              {categoryIcons[categoria.toLowerCase()] || '🎯'}
            </span>
            {categoryTranslations[categoria]?.toUpperCase()}
          </div>
        </div>

        {/* Timer - Mobile */}
        <div
          className={`rounded-2xl px-4 py-3 text-center w-full shadow-2xl border-2 transition-all duration-300 ${
            tiempoRestante <= 5 && tiempoRestante > 0
              ? 'border-red-500/80 animate-pulse'
              : 'border-blue-400/30'
          }`}
        >
          <p className='text-2xl sm:text-3xl font-bold text-gray-200 mb-1'>⏱️</p>
          <p
            className={`text-4xl sm:text-5xl font-black ${
              tiempoRestante > 5 ? 'text-white' : 'text-red-600'
            }`}
          >
            {tiempoRestante}
          </p>
          <p className='text-lg sm:text-xl font-bold text-white'>{t('seconds')}</p>
        </div>

        {/* Contenido Principal - Mobile */}
        <div className='w-full flex-1 flex flex-col gap-2'>
          {alerta ? (
            <div className='bg-red-500/20 border-2 border-red-500 text-red-200 p-3 rounded-lg text-xs sm:text-sm font-bold text-center'>
              {alerta}
            </div>
          ) : mostrarEspera ? (
            <div className='bg-black/40 border-2 border-purple-400 rounded-lg p-3 shadow-2xl text-center flex-1 flex flex-col items-center justify-center'>
              <div className='flex justify-center gap-2 mb-3'>
                <div className='w-2 h-2 bg-yellow-300 rounded-full animate-bounce'></div>
                <div
                  className='w-2 h-2 bg-yellow-300 rounded-full animate-bounce'
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className='w-2 h-2 bg-yellow-300 rounded-full animate-bounce'
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
              <p className='text-base sm:text-lg font-bold text-yellow-300 animate-pulse'>
                {t('nextQuestion')}
              </p>
            </div>
          ) : preguntaActual && juegoIniciado ? (
            <div className='bg-black/40 border-2 border-purple-400 rounded-lg p-3 shadow-2xl flex-1 flex flex-col'>
              <div className='mb-2'>
                <span className='text-xs font-bold text-yellow-300'>
                  {t('question')} {contador + 1}/10
                </span>
              </div>

              <p className='text-base sm:text-lg font-bold text-white mb-3 text-center leading-tight'>
                {idioma === 'en' ? preguntaActual.enunciado_en : preguntaActual.enunciado}
              </p>

              <div className='space-y-2 flex-1 overflow-y-auto'>
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
                      className={`w-full rounded-lg py-2 px-3 sm:py-3 sm:px-4 cursor-pointer transition-all font-bold text-xs sm:text-sm text-white shadow-lg border-2 border-transparent hover:border-yellow-300 disabled:opacity-50 ${colorClase}`}
                      onClick={() => handleGuardarRespuesta(opcion)}
                      disabled={tiempoRestante <= 0 || !!respuestaSeleccionada}
                    >
                      {idioma === 'en' ? opcion.texto_en : opcion.texto}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className='text-base sm:text-lg text-gray-300 text-center'>
              {t('noAvaliableQuestions')}.
            </p>
          )}

          {juegoTerminado && (
            <div className='bg-black/50 rounded-lg p-3 mt-3 w-full'>
              <h2 className='text-lg sm:text-xl font-bold text-yellow-300 mb-3'>
                {t('resumeAnswer')}
              </h2>
              <div className='space-y-2 max-h-40 overflow-y-auto'>
                {respuestas.map((respuesta, index) => (
                  <div
                    key={index}
                    className='bg-purple-500/20 p-2 rounded-lg border border-purple-400'
                  >
                    <p className='text-xs sm:text-sm'>
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
      </div>

      {/* DESKTOP LAYOUT */}
      <div className='hidden md:grid grid-cols-5 gap-6 h-screen pt-15'>
        {/* Panel izquierdo - Usuario */}
        <div className='col-span-1 flex flex-col items-center justify-start'>
          <div className='bg-gradient-to-b from-black/40 to-blue-800/10 rounded-2xl p-6 shadow-xl w-60 h-48 border-2 border-blue-400/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-400/20'>
            <div className='flex flex-col items-center'>
              {user?.foto_perfil ? (
                <div className='relative group'>
                  <div className='absolute inset-0 rounded-full bg-gradient-to-b from-white via-amber-200 to-violet-300 animate-spin-slow opacity-60 blur-sm scale-110'></div>
                  <img
                    src={resolveFotoAjena(user?.foto_perfil)}
                    alt='Foto de perfil'
                    className='relative w-24 h-24 rounded-full object-cover border-4 border-blue-800/10 shadow-lg mb-4 group-hover:scale-105 transition-transform duration-300'
                  />
                </div>
              ) : (
                <div className='w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-5xl mb-4 shadow-lg'>
                  👤
                </div>
              )}
              <span className='bg-blue-800 px-4 py-2 rounded-full text-sm font-bold text-center text-white'>
                {user?.name || 'Usuario'}
              </span>
            </div>
          </div>
        </div>

        <div className='col-span-3 flex flex-col items-center justify-start'>
          {/* CATEGORÍA MEJORADA */}
          <div className='relative group mb-8'>
            <div className='absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-400 to-orange-400 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 animate-pulse'></div>
            <div className='relative bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 rounded-full px-10 py-4 text-2xl font-black shadow-2xl border-2 border-yellow-300/50 hover:scale-105 transition-transform duration-300'>
              <span className='text-3xl mr-3'>
                {categoryIcons[categoria.toLowerCase()] || '🎯'}
              </span>
              {categoryTranslations[categoria]?.toUpperCase()}
              <span className='absolute -top-1 -right-1 text-yellow-300 text-xl animate-pulse'>
                ✨
              </span>
              <span
                className='absolute -bottom-1 -left-1 text-cyan-300 text-xl animate-pulse'
                style={{ animationDelay: '0.5s' }}
              >
                ⭐
              </span>
            </div>
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
                <span className='text-sm font-bold text-yellow-300'>
                  {t('question')} {contador + 1}/10
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
                      disabled={tiempoRestante <= 0 || !!respuestaSeleccionada}
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
            className={`rounded-3xl px-6 py-4 text-center flex flex-col items-center justify-center shadow-2xl w-60 h-48 border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-400/20 ${
              tiempoRestante <= 5 && tiempoRestante > 0
                ? 'border-red-500/80 animate-pulse'
                : 'border-blue-400/30 hover:border-cyan-400/50'
            }`}
          >
            <p className='text-4xl font-bold text-gray-800 mb-2'>⏱️</p>
            <p
              className={`text-6xl font-black ${
                tiempoRestante > 5 ? 'text-white' : 'text-red-600'
              }`}
            >
              {tiempoRestante}
            </p>
            <p className='text-3xl font-bold mt-2 text-white'>{t('seconds')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JugarIndividual;
