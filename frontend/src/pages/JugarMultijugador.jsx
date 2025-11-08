import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import axios from 'axios';
import correcta from '/sounds/correcta.wav';
import ficeSeconds from '/sounds/fiveSeconds.mp3';
import finalDeJuego from '/sounds/finalDeJuego.wav';
import incorrecta from '/sounds/incorrecta.wav';
import musicaPreguntas from '/sounds/musicaPreguntasEdit.mp3';
import { useGame } from '../context/ContextJuego.jsx';
import useSound from 'use-sound';

// ===== util: PRNG determinístico y shuffle con seed (para que ambos vean lo mismo)
function mulberry32(a) {
    return function () {
        let t = (a += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function shuffleSeeded(arr, seed) {
    const rnd = mulberry32(seed);
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function traducirDificultad(d) {
    const x = String(d || '').toLowerCase();
    if (x === 'easy' || x === 'facíl' || x === 'facil') return 'facil';
    if (x === 'medium' || x === 'media' || x === 'normal') return 'normal';
    if (x === 'hard' || x === 'dificíl' || x === 'dificil') return 'dificil';
    return 'normal';
}
function tiempoPorPregunta(t) {
    const x = String(t || '').toLowerCase();
    if (x === 'facíl' || x === 'facil' || x === 'easy') return 15;
    if (x === 'media' || x === 'normal' || x === 'medium') return 12;
    if (x === 'dificíl' || x === 'dificil' || x === 'hard') return 8;
    return 12;
}

export default function JugarMultijugador() {
    const API = 'http://localhost:3006';
    const navigate = useNavigate();
    const location = useLocation();
    const { id: salaId } = useParams(); // salaId
    const { inicializarSocket } = useGame();

    const musicStartedRef = useRef(false);
    const timerRef = useRef(null);

    const [jugadores, setJugadores] = useState([]); // [{userId, nombre, foto_perfil, esCreador}]
    const abs = (p) => (typeof p === 'string' && p.startsWith('http') ? p : `${API}${p || '/uploads/default.png'}`);


    // sonidos
    const [playCorrect] = useSound(correcta, { volume: 0.6 });
    const [playWrong] = useSound(incorrecta, { volume: 0.6 });
    const [playTimeout] = useSound(finalDeJuego, { volume: 0.7 });
    const [fiveSeconds, { stop: stopFiveSeconds }] = useSound(ficeSeconds, { volume: 0.7 });
    const [playing, { stop }] = useSound(musicaPreguntas, { volume: 0.2, loop: true });

    // estado del juego
    const [config, setConfig] = useState(null); // {categoria, dificultad, tiempo}
    const [preguntas, setPreguntas] = useState([]);
    const [preguntaActual, setPreguntaActual] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alerta, setAlerta] = useState('');
    const [respuestaSeleccionada, setRespuestaSeleccionada] = useState('');
    const [respuestas, setRespuestas] = useState([]);
    const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);
    const [contador, setContador] = useState(0);
    const [juegoTerminado, setJuegoTerminado] = useState(false);
    const [tiempoRestante, setTiempoRestante] = useState(0);
    const [contadorInicial, setContadorInicial] = useState(3);
    const [juegoIniciado, setJuegoIniciado] = useState(false);
    const [mostrarContador, setMostrarContador] = useState(true);
    const [cronometroPausado, setCronometroPausado] = useState(false);

    console.log("config: ", config);

    // cleanup de sonidos/timers
    useEffect(() => {
        return () => {
            stop();
            stopFiveSeconds();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [stop, stopFiveSeconds]);

    // NEW: identificar al usuario actual (desde localStorage)
    const currentUserId = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null')?.id ?? null;
        } catch {
            return null;
        }
    })();

    // 0) Inicializar config desde state o localStorage
    useEffect(() => {
        if (config) return;
        const fromState = location.state?.config;
        if (fromState?.categoria && fromState?.dificultad && fromState?.tiempo) {
            setConfig(fromState);
            return;
        }
        try {
            const ls = JSON.parse(localStorage.getItem('ultima_config_multijugador') || 'null');
            if (ls?.categoria && ls?.dificultad && ls?.tiempo) {
                setConfig(ls);
            }
        } catch { }
    }, [config, location.state]);


    useEffect(() => {
        const s = inicializarSocket();
        if (!s) return;

        function dedupeJugadores(arr = []) {
            // Prioriza userId; si falta, usa nombre como clave de último recurso
            const byKey = new Map();
            for (const j of arr) {
                const key = (j.userId != null) ? `u:${j.userId}` : `n:${(j.nombre || '').toLowerCase()}`;
                byKey.set(key, j); // si llega duplicado, se queda con el último
            }
            return Array.from(byKey.values());
        }

        const onSalaActualizada = (estado) => setJugadores(dedupeJugadores(estado?.jugadores));
        const onJugadorSeFue = (estado) => setJugadores(dedupeJugadores(estado?.jugadores));

        s.emit('obtener_sala', { salaId }, (estado) => {
            if (estado?.ok) setJugadores(dedupeJugadores(estado.jugadores));
        });

        s.on('sala_actualizada', onSalaActualizada);
        s.on('jugador_se_fue', onJugadorSeFue);

        return () => {
            s.off('sala_actualizada', onSalaActualizada);
            s.off('jugador_se_fue', onJugadorSeFue);
        };
    }, [salaId, inicializarSocket]);

    // ordenar siempre creador primero
    const ordenados = [...jugadores].sort((a, b) => (a.esCreador === b.esCreador ? 0 : a.esCreador ? -1 : 1));
    const creador = ordenados[0] || null;
    const invitado = ordenados[1] || null;

    // NEW: si hay más de dos o si el usuario actual no está entre los dos habilitados → a SalaPartidas
    useEffect(() => {
        if (!Array.isArray(jugadores) || jugadores.length === 0) return;

        const top2 = ordenados.slice(0, 2);
        const allowedIds = new Set(top2.map(j => j?.userId).filter(id => id != null));

        if (!allowedIds.has(currentUserId)) {
            navigate('/salaPartidas', {
                replace: true,
                state: { msg: 'La partida ya tiene 2 jugadores. Te llevamos a la lista de salas.' },
            });
        }
    }, [jugadores, ordenados, currentUserId, navigate, salaId]);

    // 2) Con config lista, traer preguntas y prepararlas con shuffle determinístico
    useEffect(() => {
        if (!config) return;
        (async () => {
            try {
                setLoading(true);
                const dif = traducirDificultad(config.dificultad);
                const { data } = await axios.get(
                    `${API}/preguntas/categoria/${String(config.categoria).toLowerCase()}/${dif}`
                );
                if (!Array.isArray(data) || data.length === 0) {
                    setAlerta('No se encontraron preguntas para esta categoría o dificultad.');
                    setLoading(false);
                    return;
                }

                // Mezcla determinística (misma seed = mismo orden en ambos clientes)
                const seed =
                    [...String(salaId)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) ^
                    [...String(config.categoria)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) ^
                    [...String(dif)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

                const mezcladas = shuffleSeeded(data, seed)
                    .slice(0, 10)
                    .map((pregunta) => ({
                        ...pregunta,
                        Opciones: shuffleSeeded(pregunta.Opciones || [], seed + (pregunta.id || 0)),
                    }));

                setPreguntas(mezcladas);
                setPreguntaActual(mezcladas[0]);
                setTiempoRestante(tiempoPorPregunta(config.tiempo));
                setMostrarContador(true);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setAlerta('Error al cargar las preguntas.');
                setLoading(false);
            }
        })();
    }, [config, salaId]);

    // 3) Contador inicial (breve) y música
    useEffect(() => {
        if (!mostrarContador) return;
        if (contadorInicial > 0) {
            if (contadorInicial === 3) fiveSeconds();
            const t = setTimeout(() => setContadorInicial((v) => v - 1), 1000);
            return () => clearTimeout(t);
        }
        if (!juegoIniciado && !juegoTerminado) {
            setJuegoIniciado(true);
            if (!musicStartedRef.current) {
                playing();
                musicStartedRef.current = true;
            }
        }
    }, [mostrarContador, contadorInicial, juegoIniciado, juegoTerminado, playing, fiveSeconds]);

    // 4) Cronómetro por pregunta
    useEffect(() => {
        if (!preguntaActual || !juegoIniciado || juegoTerminado || cronometroPausado) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }
        // reset en cada pregunta
        setTiempoRestante(tiempoPorPregunta(config?.tiempo));

        timerRef.current = setInterval(() => {
            setTiempoRestante((prev) => {
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
    }, [preguntaActual, juegoIniciado, juegoTerminado, cronometroPausado, config?.tiempo]);

    // 5) Guardar respuesta y avanzar
    const handleGuardarRespuesta = (opcion) => {
        setCronometroPausado(true);

        let nuevasRespuestas;
        if (!opcion) {
            nuevasRespuestas = [...respuestas, { texto: 'Sin respuesta', es_correcta: false }];
        } else {
            nuevasRespuestas = [...respuestas, opcion];
            setRespuestaSeleccionada(opcion);
            if (opcion.es_correcta === true) {
                setRespuestaCorrecta(opcion);
                playCorrect();
            } else {
                playWrong();
            }
        }
        setRespuestas(nuevasRespuestas);

        setTimeout(() => {
            const siguiente = contador + 1;
            if (siguiente < preguntas.length) {
                setContador(siguiente);
                setPreguntaActual(preguntas[siguiente]);
                setRespuestaSeleccionada(null);
                setRespuestaCorrecta(null);
                setCronometroPausado(false);
            } else {
                setAlerta('Juego terminado ✅');
                setJuegoTerminado(true);
                setJuegoIniciado(false);
                setTiempoRestante(0);
                playTimeout();

                // TODO: integrar persistencia multijugador:
                // - Buscar Partida por sala.codigo = salaId (endpoint GET /salas/by-codigo/:codigo → devuelve sala y partida_id)
                // - Enviar respuestas, estadísticas, etc. usando ese partida_id
            }
        }, 3000);
    };

    // 6) Guardado/cleanup música al terminar
    useEffect(() => {
        if (juegoTerminado) {
            stop();
            musicStartedRef.current = false;
        }
    }, [juegoTerminado, stop]);

    // ====== UI ======
    if (mostrarContador && contadorInicial > 0) {
        return (
            <div className='min-h-screen flex items-start justify-center relative overflow-hidden'>
                <div className='relative z-10 text-center'>
                    <h1 className='text-5xl md:text-6xl font-black text-white mb-8 drop-shadow-lg'>
                        ¡Prepárate!
                    </h1>
                    <div className='bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4 rounded-3xl text-white text-2xl font-bold mb-6 shadow-2xl border-2 border-purple-400'>
                        🎮 Categoría:{' '}
                        <span className='text-yellow-300'>{String(config?.categoria || '').toUpperCase()}</span>
                    </div>
                    <div className='space-y-5 mb-4 bg-black/30 p-4 rounded-2xl backdrop-blur-sm border border-purple-400/50'>
                        <p className='text-white text-xl flex items-center justify-center gap-3'>
                            <span className='text-2xl'>⏱️</span>
                            Tiempo por pregunta:{' '}
                            <span className='font-bold text-yellow-300'>
                                {tiempoPorPregunta(config?.tiempo)}s
                            </span>
                        </p>
                        <p className='text-white text-xl flex items-center justify-center gap-3'>
                            <span className='text-2xl'>📊</span>
                            Dificultad:{' '}
                            <span className='font-bold text-orange-400 capitalize'>
                                {String(config?.dificultad || '')}
                            </span>
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
                    <div className='text-white text-2xl font-bold animate-bounce'>El juego comenzará en...</div>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full h-full text-white pt-5'>
            
            <div className='w-full h-full text-white flex items-center justify-center'>
                {/* Reloj */}
                <div
                    className={`rounded-3xl px-6 py-4 text-center shadow-2xl border-4 w-40 ${tiempoRestante <= 5 && tiempoRestante > 0
                        ? 'bg-gradient-to-b from-red-500 to-orange-600 border-red-300/30 animate-pulse'
                        : 'bg-gradient-to-b from-yellow-300/80 to-yellow-400/80 border-yellow-400'
                        }`}
                >
                    <p className='text-sm font-bold text-gray-800 mb-2'>⏱️ TIEMPO</p>
                    <p className={`text-5xl font-black ${tiempoRestante <= 5 && tiempoRestante > 0 ? 'text-white' : 'text-red-600'}`}>
                        {tiempoRestante}
                    </p>
                    <p className='text-xs font-bold text-gray-800 mt-2'>segundos</p>
                </div>
            </div>

            <div className='grid grid-cols-5 gap-6 h-screen pt-10'>

                {/* Panel izquierdo - (podés mostrar al usuario local si querés) */}
                <div className='col-span-1 flex flex-col items-center justify-start'>
                    <div className='bg-gradient-to-b from-blue-600/40 to-blue-700/70 rounded-2xl p-6 shadow-xl w-full'>
                        <div className='flex flex-col items-center'>
                            {creador ? (
                                <>
                                    {creador?.foto_perfil && creador?.foto_perfil !== `${API}/uploads/default.png` ? (
                                        <img
                                            src={abs(creador?.foto_perfil)}
                                            alt='Creador'
                                            className='w-24 h-24 rounded-full object-cover border-4 border-yellow-300 shadow-lg mb-4'
                                        />
                                    ) : (
                                        <div className='w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-5xl mb-4 shadow-lg'>
                                            👤
                                        </div>
                                    )}
                                    <span className='bg-blue-800 px-4 py-2 rounded-full text-sm font-bold text-center text-yellow-300'>
                                        {creador?.nombre || 'Creador'}
                                    </span>
                                    <span className='text-xs mt-2 opacity-70'>Creador</span>
                                </>
                            ) : (
                                <div className='w-24 h-24 rounded-full bg-white/20' />
                            )}
                        </div>
                    </div>
                </div>

                {/* {console.log(jugadores)} */}

                {/* Centro - Pregunta */}
                <div className='col-span-3 flex flex-col items-center justify-start'>
                    <div className='bg-gradient-to-r from-orange-500 to-pink-500 rounded-full px-8 py-3 mb-8 text-2xl font-black shadow-lg'>
                        {String(config?.categoria || '').toUpperCase()}
                    </div>

                    {loading ? (
                        <div className='text-center space-y-4'>
                            <p className='text-white text-2xl font-bold'>Cargando preguntas...</p>
                            {alerta && <p className='text-white/80'>{alerta}</p>}
                        </div>
                    ) : alerta ? (
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
                                                className={`ml-2 font-bold ${respuesta.es_correcta ? 'text-green-400' : 'text-red-400'
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

                <div className='col-span-1 flex flex-col items-center justify-start gap-4'>
                    {/* Jugador invitado */}
                    <div className='bg-gradient-to-b from-green-600/40 to-green-700/70 rounded-2xl p-6 shadow-xl w-full'>
                        <div className='flex flex-col items-center'>
                            {invitado ? (
                                <>
                                    {invitado.foto_perfil && invitado.foto_perfil !== `${API}/uploads/default.png` ? (
                                        <img
                                            src={abs(invitado.foto_perfil)}
                                            alt='Invitado'
                                            className='w-24 h-24 rounded-full object-cover border-4 border-green-300 shadow-lg mb-4'
                                        />
                                    ) : (
                                        <div className='w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-5xl mb-4 shadow-lg'>
                                            👤
                                        </div>
                                    )}
                                    <span className='bg-green-800 px-4 py-2 rounded-full text-sm font-bold text-center text-yellow-300'>
                                        {invitado?.nombre || 'Invitado'}
                                    </span>
                                    <span className='text-xs mt-2 opacity-70'>Invitado</span>
                                </>
                            ) : (
                                <div className='w-24 h-24 rounded-full bg-white/20' />
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
