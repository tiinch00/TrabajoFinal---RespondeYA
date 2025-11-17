// src/pages/JugarMultijugador.jsx

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Link } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import correcta from '/sounds/correcta.wav';
import ficeSeconds from '/sounds/fiveSeconds.mp3';
import finalDeJuego from '/sounds/finalDeJuego.wav';
import incorrecta from '/sounds/incorrecta.wav';
import musicaPreguntas from '/sounds/musicaPreguntasEdit.mp3';
import { resolveFotoAjena } from '../utils/resolveFotoAjena.js';
import { useGame } from '../context/ContextJuego.jsx';
import useSound from 'use-sound';
import { useTranslation } from 'react-i18next';

function formatearTimestampParaMySQL(timestampEnMilisegundos) {
    const MS_3HS = 3 * 60 * 60 * 1000;
    const fecha = new Date(Number(timestampEnMilisegundos) - MS_3HS);

    // Usamos métodos para construir el string en formato 'YYYY-MM-DD HH:MM:SS'
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');

    return `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}

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
    if (x === 'hard' || x === 'difícil' || x === 'dificil') return 'dificil';
    return 'normal';
}
function tiempoPorPregunta(t) {
    const x = String(t || '').toLowerCase();
    if (x === 'facíl' || x === 'facil' || x === 'easy') return 15;
    if (x === 'media' || x === 'normal' || x === 'medium') return 12;
    if (x === 'difícil' || x === 'dificil' || x === 'hard') return 8;
    return 12;
}

export default function JugarMultijugador() {
    const API = 'http://localhost:3006';
    const isDefaultFoto = (fp) => {
        if (!fp) return true;
        return fp === '/uploads/default.png' || fp === `${API}/uploads/default.png`;
    };
    const navigate = useNavigate();
    const location = useLocation();
    const { id: salaId } = useParams(); // salaId
    const { inicializarSocket } = useGame();
    const { t } = useTranslation();

    //console.log("useParams(): ", useParams());

    const musicStartedRef = useRef(false);
    const timerRef = useRef(null);
    const finPartidaProcesadaRef = useRef(false); // para que no se ejecute 2 vece el ultimo useEffect (guadar_partida)

    const [jugadores, setJugadores] = useState([]); // [{userId, nombre, foto_perfil, esCreador}]
    const abs = (p) =>
        typeof p === 'string' && p.startsWith('http') ? p : `${API}${p || '/uploads/default.png'}`;

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
    const questionStartRef = useRef(null); // tiempo en responder por respuesta
    const [partidasPreguntasDeLaPartida, setPartidasPreguntasDeLaPartida] = useState([]);
    const [jugadorIdGanador, setJugadorIdGanador] = useState(null);
    const [mostrarEspera, setMostrarEspera] = useState(false); // siguiete pregunta msg...

    // confeti
    const canvasRef = useRef(null);
    const confettiInstanceRef = useRef(null);

    const categoryTranslations = {
        cine: t('cinema'),
        historia: t('history'),
        'conocimiento general': t('generalKnowLedge'),
        geografía: t('geography'),
        informatica: t('informatic'),
    };

    // Mapeo de iconos por categoría
    const categoryIcons = {
        cine: '🎬',
        historia: '📜',
        'conocimiento general': '🧠',
        geografía: '🌍',
        informatica: '💻',
    };


    const [ganador, setGanador] = useState(null);
    const [perdedor, setPerdedor] = useState(null);

    // === NUEVO: socket y buffer de respuestas por jugador ===
    const socketRef = useRef(null);
    const [respuestasPorJugador, setRespuestasPorJugador] = useState({}); // { [userId]: Respuesta[] }
    // === NUEVO: socket dispara "crear_tablas_faltantes" una sola vez
    const crearTablasEnviadoRef = useRef(false);
    // === NUEVO: guardar respuestas para poder guardar en la bd
    const ppIdByPreguntaIdRef = useRef({});        // { [pregunta_id]: partida_pregunta_id }
    const estadisticaIdByJugadorIdRef = useRef({}); // { [jugador_id]: estadistica_id }

    // 1.1
    // Para identificar nombre local (sólo para payload informativo)
    const currentUserName = (() => {
        try {
            const u = JSON.parse(localStorage.getItem('user') || 'null') || {};
            return u.name || u.username || (u.email?.split?.('@')[0]) || 'Jugador';
        } catch {
            return 'Jugador';
        }
    })();

    // cleanup de sonidos/timers
    useEffect(() => {
        return () => {
            stop();
            stopFiveSeconds();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [stop, stopFiveSeconds]);

    // === NEW: identificar al usuario actual (desde localStorage) ===
    const currentUserId = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null')?.id ?? null;
        } catch {
            return null;
        }
    })();

    //console.log("currentUserId: ", currentUserId);

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

    //console.log("config: ", config);

    const actualizarPuntajeJugadorEstadisticas = async (jugador, configuracion) => {
        try {
            const jugador_id = jugador.jugador_id;

            await axios.put(
                `${API}/jugadores/updatePuntajeEstadistica/${jugador_id}`,
                {
                    puntaje: jugador.puntaje_total,
                    partida_id: configuracion.partida_id,
                }
            );
        } catch (error) {
            console.log('@@@@ Error PUT /jugadores/updatePuntajeEstadistica\n', error);
        }
    }

    // 2) Función pura que devuelve [ganador, perdedor] como objetos
    function getGanadorYPerdedor(creador, invitado, statsCreador, statsInvitado) {
        if (!creador || !invitado || !statsCreador || !statsInvitado) {
            return [null, null];
        }

        const jugadorIdCreador = Number(creador.jugador_id) || null;
        const jugadorIdInvitado = Number(invitado.jugador_id) || null;

        const pickWinner = (A, B, idA, idB) => {
            if (A.total_correctas > B.total_correctas) return idA;
            if (B.total_correctas > A.total_correctas) return idB;

            if (A.total_tiempo_correctas_ms < B.total_tiempo_correctas_ms) return idA;
            if (B.total_tiempo_correctas_ms < A.total_tiempo_correctas_ms) return idB;

            return null;
        };

        const ganadorId = pickWinner(
            statsCreador,
            statsInvitado,
            jugadorIdCreador,
            jugadorIdInvitado
        );

        if (ganadorId == null) return [null, null];

        const ganadorEsCreador = ganadorId === jugadorIdCreador;

        const ganadorBase = ganadorEsCreador
            ? { ...creador, ...statsCreador }
            : { ...invitado, ...statsInvitado };

        const perdedorBase = ganadorEsCreador
            ? { ...invitado, ...statsInvitado }
            : { ...creador, ...statsCreador };

        // Puntaje base (por las dudas, fallback a 0)
        const puntajeBaseGanador = Number(ganadorBase.puntaje_total) || 0;
        const puntajeBasePerdedor = Number(perdedorBase.puntaje_total) || 0;

        // Aplicar bonus SOLO en los objetos que devolvés al front
        const ganador = {
            ...ganadorBase,
            puntaje_total: puntajeBaseGanador + 1000,
        };

        const perdedor = {
            ...perdedorBase,
            puntaje_total: puntajeBasePerdedor + 500,
        };

        return [ganador, perdedor];
    }

    // Ejemplo: handler async (puede ser un socket.on, un controller, etc.)
    async function finalizarPartida(creador, invitado, statsCreador, statsInvitado, config) {
        const [ganador, perdedor] = getGanadorYPerdedor(
            creador,
            invitado,
            statsCreador,
            statsInvitado
        );

        if (ganador && perdedor) {
            await Promise.all([
                actualizarPuntajeJugadorEstadisticas(ganador, config),
                actualizarPuntajeJugadorEstadisticas(perdedor, config),
            ]);
        }

        // acá devolvés al front, o hacés emit, lo que toque:
        return { ganador, perdedor };
    }

    // 1) Socket: traer/escuchar jugadores (con dedupe)
    useEffect(() => {
        const s = inicializarSocket();
        if (!s) return;

        // >>> NUEVO: conservar referencia del socket
        socketRef.current = s;

        function dedupeJugadores(arr = []) {
            const byKey = new Map();
            for (const j of arr) {
                const key = j?.userId != null ? `u:${j.userId}` : `n:${(j?.nombre || '').toLowerCase()}`;
                byKey.set(key, j);
            }
            return Array.from(byKey.values());
        }

        const onSalaActualizada = (estado) => setJugadores(dedupeJugadores(estado?.jugadores));
        const onJugadorSeFue = (estado) => setJugadores(dedupeJugadores(estado?.jugadores));

        // >>> NUEVO: cuando otro jugador emite su respuesta
        const onRespuestaSala = ({ userId, nombre, indice, respuesta }) => {
            if (userId == null || typeof indice !== 'number' || !respuesta) return;
            setRespuestasPorJugador(prev => {
                const arr = prev[userId] ? [...prev[userId]] : [];
                arr[indice] = respuesta; // guardamos por índice de pregunta
                return { ...prev, [userId]: arr };
            });
        };

        s.emit('obtener_sala', { salaId }, (estado) => {
            if (estado?.ok) setJugadores(dedupeJugadores(estado.jugadores));
            else {
                navigate('/salaPartidas', {
                    replace: true,
                    state: { msg: estado?.error || 'Sala no encontrada.' },
                });
            }
        });

        s.on('sala_actualizada', onSalaActualizada);
        s.on('jugador_se_fue', onJugadorSeFue);

        // >>> NUEVO: listener para respuestas del otro jugador
        s.on('sala:respuesta', onRespuestaSala);

        return () => {
            s.off('sala_actualizada', onSalaActualizada);
            s.off('jugador_se_fue', onJugadorSeFue);

            // >>> NUEVO: cleanup del listener
            s.off('sala:respuesta', onRespuestaSala);
        };
    }, [salaId, inicializarSocket, navigate]);

    //console.log("jugadores: ", jugadores);

    // ordenar siempre: creador primero
    const ordenados = [...jugadores].sort((a, b) =>
        a?.esCreador === b?.esCreador ? 0 : a?.esCreador ? -1 : 1
    );
    //console.log("ordenados: ", ordenados);
    const creador = ordenados[0] || null;
    const invitado = ordenados[1] || null;

    // === NEW: Máximo 2 jugadores. Si el actual NO está entre los 2, redirige a SalaPartidas ===
    useEffect(() => {
        if (!Array.isArray(jugadores) || jugadores.length === 0) return;
        const top2 = ordenados.slice(0, 2);
        const allowedIds = new Set(top2.map((j) => j?.userId).filter((id) => id != null));
        if (!allowedIds.has(currentUserId)) {
            navigate('/salaPartidas', {
                replace: true,
                state: { msg: 'La partida ya tiene 2 jugadores. Te llevamos a la lista de salas.' },
            });
        }
    }, [jugadores, ordenados, currentUserId, navigate, salaId]);

    // 2) Cargar preguntas (seed determinístico)
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

    // enviar jugadores a un nuevo socket para inicializar tablas:
    // estadisticas, partida_jugadores y partida_preguntas
    useEffect(() => {
        if (crearTablasEnviadoRef.current) return;   // ya se envió
        if (!socketRef.current) return;              // socket aún no listo
        if (!config) return;                         // todavía no cargó config
        if (!creador || !invitado) return;           // esperamos a tener 2 jugadores
        if (!Array.isArray(preguntas) || preguntas.length === 0) return; // ✅
        // traigo la última config guardada
        let ultimaCfg = null;
        try {
            ultimaCfg = JSON.parse(localStorage.getItem('ultima_config_multijugador') || 'null');
        } catch { }

        // 1) Tomo el partida_id de la config efectiva que vas a enviar
        const cfgEfectiva = ultimaCfg || config;
        const partidaId = Number(cfgEfectiva?.partida_id) || null;

        // 2) Construyo el array pedido a partir de las 10 preguntas en orden
        const partida_preguntas_tabla = (preguntas || []).map((p, idx) => {
            const opciones = Array.isArray(p.Opciones) ? p.Opciones : [];
            const correcta = opciones.find(o => o?.es_correcta === true) || null;

            return {
                partida_id: partidaId,
                pregunta_id: Number(p?.id) || null,
                orden: idx + 1, // arranca en 1 ✅
                question_text_copy: String(p?.enunciado ?? ''),
                question_text_copy_en: String(p?.enunciado_en ?? ''),
                correct_option_id_copy: correcta ? Number(correcta.id) || null : null,
                correct_option_text_copy: correcta ? String(correcta.texto ?? '') : '',
                correct_option_text_copy_en: correcta ? String(correcta.texto_en ?? '') : '',
            };
        });

        setPartidasPreguntasDeLaPartida(partida_preguntas_tabla);

        const payload = {
            salaId,
            config: ultimaCfg || config,
            jugadores: [creador, invitado].map(j => ({
                userId: j?.userId ?? null,
                jugador_id: j?.jugador_id ?? null,
                nombre: j?.nombre ?? 'Jugador',
                foto_perfil: j?.foto_perfil ?? '/uploads/default.png',
                esCreador: !!j?.esCreador,
            })),
            partida_preguntas_tabla, // reemplazo solicitado            
            // (no enviamos `preguntas`)  // ← si querés enviar todo

            //preguntas: preguntasCompactas,  // ← o este compacto
        };

        console.log("####payload: ", payload);

        socketRef.current.emit('crear_tablas_faltantes', payload, (ack) => {
            console.log('crear_tablas_faltantes → ack:', ack);
            // Si el server devuelve mapeos, los guardamos. Si no, no pasa nada.
            if (ack?.partida_preguntas_mapeo) {
                // Espera algo como [{pregunta_id, partida_pregunta_id, orden}, ...]
                const map = {};
                for (const r of ack.partida_preguntas_mapeo) {
                    if (Number.isFinite(r?.pregunta_id) && Number.isFinite(r?.partida_pregunta_id)) {
                        map[Number(r.pregunta_id)] = Number(r.partida_pregunta_id);
                    }
                }
                ppIdByPreguntaIdRef.current = map;
            }
            console.log("ack: ", ack);
            if (ack?.estadisticas_map) {
                // Espera algo como { [jugador_id]: estadistica_id }
                estadisticaIdByJugadorIdRef.current = ack.estadisticas_map || {};
            }
        });

        crearTablasEnviadoRef.current = true;
    }, [creador, invitado, config, salaId, preguntas]);


    // 3) Contador inicial + música
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
        setTiempoRestante(tiempoPorPregunta(config?.tiempo));

        // Inicia timepo de la pregunta
        questionStartRef.current = performance.now();

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
        const elapsedMs = Math.max(
            1,
            Math.round(performance.now() - (questionStartRef.current || performance.now()))
        );

        const payloadRespuesta = opcion
            ? { ...opcion, tiempo_respuesta_ms: elapsedMs }
            : { texto: 'Sin respuesta', es_correcta: false, tiempo_respuesta_ms: elapsedMs };

        const nuevasRespuestas = [...respuestas, payloadRespuesta];

        if (opcion) {
            setRespuestaSeleccionada(opcion);
            if (opcion.es_correcta === true) {
                setRespuestaCorrecta(opcion);
                playCorrect();
            } else {
                playWrong();
            }
        } else {
            playWrong();
        }

        setRespuestas(nuevasRespuestas);

        socketRef.current?.emit('sala:respuesta', {
            salaId,
            userId: currentUserId,
            nombre: currentUserName,
            indice: contador,
            respuesta: payloadRespuesta,
        });

        // ⏳ Esperar 3s para mostrar feedback de correcta/incorrecta
        setTimeout(() => {
            const siguiente = contador + 1;

            // 👉 Mostrar overlay de "siguiente pregunta"
            setMostrarEspera(true);

            if (siguiente < preguntas.length) {
                // cambiamos la pregunta mientras el overlay está visible
                setContador(siguiente);
                setPreguntaActual(preguntas[siguiente]);
                setRespuestaSeleccionada(null);
                setRespuestaCorrecta(null);

                // dejamos el cartelito 1 segundo más (ajustá a gusto)
                setTimeout(() => {
                    setMostrarEspera(false);
                    setCronometroPausado(false); // vuelve a correr el timer
                }, 1000);
            } else {
                setAlerta('Juego terminado ✅');
                setJuegoTerminado(true);
                setJuegoIniciado(false);
                setTiempoRestante(0);
                playTimeout();
                setMostrarEspera(false);
            }
        }, 3000);
    };


    // 6) Stop música al terminar
    useEffect(() => {
        if (juegoTerminado) {
            stop();
            musicStartedRef.current = false;
        }
    }, [juegoTerminado, stop]);

    // mostrar todas las respuestas despues de jugar y este terminado
    useEffect(() => {
        if (!juegoTerminado) return;

        // Identifico quién es el “otro”
        const myId = currentUserId;
        const otherId =
            creador?.userId === myId ? invitado?.userId
                : invitado?.userId === myId ? creador?.userId
                    : null;

        //console.log('▶︎ Respuestas del jugador actual:', respuestas);

        if (otherId != null) {
            // console.log('▶︎ Respuestas del otro jugador:', respuestasPorJugador[otherId] || []);
        } else {
            // console.log('▶︎ No se pudo identificar al otro jugador aún.');
        }

        // (Opcional) Si querés ver todo el buffer por userId:
        // console.log('▶︎ Buffer de respuestas por jugador:', respuestasPorJugador);

    }, [juegoTerminado, creador, invitado, respuestas, respuestasPorJugador, currentUserId]);

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
        if (dificult.includes('dificíl') || dificult.includes('hard'))
            puntosDificultad = 15 * respuestasCor.length;
        console.log(puntos);
        console.log(puntosDificultad);
        return Math.round((puntos + puntosDificultad) * multiplicador);
    };

    const [partidaCompleta, setPartidaCompleta] = useState(null);
    // === NUEVO: al terminar la partida, armo las 20 respuestas (2 jugadores x 10 preguntas), calculo ganador y envío ===
    useEffect(() => {
        if (!juegoTerminado) {
            // por si en algún momento permitís jugar otra partida en la misma pantalla
            finPartidaProcesadaRef.current = false;
            return;
        }

        if (!config?.partida_id) return;
        if (!Array.isArray(preguntas) || preguntas.length === 0) return;
        if (!Array.isArray(respuestas) || respuestas.length === 0) return;
        if (!socketRef.current) return;

        const top2 = [creador, invitado].filter(Boolean);
        if (top2.length !== 2) return;

        const msToSeg = (ms) => (Number.isFinite(ms) ? Math.round(ms / 1000) : null);

        const buildStats = (arrRespuestas) => {
            const total_correctas = arrRespuestas.reduce((a, r) => a + (r.es_correcta ? 1 : 0), 0);
            const total_incorrectas = arrRespuestas.length - total_correctas;

            const tiemposMs = arrRespuestas.map(r =>
                Number.isFinite(Number(r.tiempo_respuesta_ms)) ? Number(r.tiempo_respuesta_ms) : 0
            );

            const total_tiempo_ms = tiemposMs.reduce((a, b) => a + b, 0);

            const tiemposCorrectasMs = arrRespuestas
                .filter(r => r.es_correcta)
                .map(r => Number(r.tiempo_respuesta_ms) || 0);

            const total_tiempo_correctas_ms = tiemposCorrectasMs.reduce((a, b) => a + b, 0);

            const respuestasCor = tiemposCorrectasMs.map(ms => ({ tiempo: msToSeg(ms) ?? 0 }));

            const puntaje_total = calcularPuntaje(
                respuestasCor,
                String(config?.tiempo || ''),
                String(config?.dificultad || '')
            );

            return {
                total_correctas,
                total_incorrectas,
                total_tiempo_correctas_ms,
                total_tiempo_ms,
                puntaje_total,
            };
        };

        const buildRespuestasPara = (jug) => {
            const jugadorId = Number(jug?.jugador_id) || null;
            if (!Number.isFinite(jugadorId)) return [];

            const isMe = jug?.userId === currentUserId;
            const arr = isMe ? respuestas : (respuestasPorJugador[jug?.userId] || []);

            const safe = Array.from({ length: 10 }, (_, i) => {
                const r = arr[i];
                if (r && typeof r === 'object') return r;
                return { texto: 'Sin respuesta', es_correcta: false, tiempo_respuesta_ms: null };
            });

            return safe.map((r, idx) => {
                const q = preguntas[idx];
                const preguntaId = Number(q?.id) || null;

                const opcionElegidaId =
                    (r?.id != null && Number.isFinite(Number(r.id))) ? Number(r.id) : null;

                const esCorrecta = r?.es_correcta ? 1 : 0;

                const tms = Number.isFinite(Number(r?.tiempo_respuesta_ms))
                    ? Number(r.tiempo_respuesta_ms)
                    : null;

                return {
                    partida_id: Number(config.partida_id),
                    jugador_id: jugadorId,
                    pregunta_id: preguntaId,
                    partida_pregunta_id: partidasPreguntasDeLaPartida.find(
                        (pp) => Number(pp.pregunta_id) === preguntaId
                    )?.id || null,
                    opcion_elegida_id: opcionElegidaId,
                    estadistica_id: estadisticaIdByJugadorIdRef.current?.[jugadorId] ?? null,
                    es_correcta: esCorrecta,
                    tiempo_respuesta_ms: tms,
                    orden: idx + 1,
                };
            });
        };

        // calculo respuestas y stats para ambos jugadores (esto lo pueden hacer los dos clientes)
        const respuestasCreador = buildRespuestasPara(creador);
        const respuestasInvitado = buildRespuestasPara(invitado);

        const statsCreador = buildStats(respuestasCreador);
        const statsInvitado = buildStats(respuestasInvitado);

        // 👉 si soy el CREADOR, hago TODO (BD + socket + podio)
        if (creador && creador.userId === currentUserId) {
            // evitar duplicar en este cliente
            if (finPartidaProcesadaRef.current) return;
            finPartidaProcesadaRef.current = true;

            (async () => {
                const { ganador, perdedor } = await finalizarPartida(
                    creador,
                    invitado,
                    statsCreador,
                    statsInvitado,
                    config
                );

                setGanador(ganador);
                setPerdedor(perdedor);

                const jugadorIdGanador =
                    ganador ? Number(ganador.jugador_id) : null;

                setJugadorIdGanador(jugadorIdGanador);

                const payload = {
                    salaId,
                    partida_id: Number(config.partida_id),
                    dificultad: String(config?.dificultad || ''),
                    tiempo: String(config?.tiempo || ''),
                    respuestas: [...respuestasCreador, ...respuestasInvitado],
                    resumen: {
                        jugadores: [
                            {
                                jugador_id: Number(creador.jugador_id),
                                ...statsCreador,
                                ganador: ganador?.jugador_id === creador.jugador_id ? 1 : 0,
                            },
                            {
                                jugador_id: Number(invitado.jugador_id),
                                ...statsInvitado,
                                ganador: ganador?.jugador_id === invitado.jugador_id ? 1 : 0,
                            },
                        ],
                        ganador_jugador_id: jugadorIdGanador,
                        ended_at: formatearTimestampParaMySQL(Date.now()),
                    },
                };

                setPartidaCompleta(payload);

                socketRef.current.emit('guardar_respuestas', payload, (ack) => {
                    console.log('guardar_respuestas → ack:', ack);
                });
            })();
        } else {
            // 👉 si soy el INVITADO, SOLO calculo ganador/perdedor
            const [ganadorLocal, perdedorLocal] = getGanadorYPerdedor(
                creador,
                invitado,
                statsCreador,
                statsInvitado
            );

            setGanador(ganadorLocal);
            setPerdedor(perdedorLocal);

            const jugadorIdGanador =
                ganadorLocal ? Number(ganadorLocal.jugador_id) : null;
            setJugadorIdGanador(jugadorIdGanador);

            // opcional: también podés armar partidaCompleta local
            const payload = {
                salaId,
                partida_id: Number(config.partida_id),
                dificultad: String(config?.dificultad || ''),
                tiempo: String(config?.tiempo || ''),
                respuestas: [...respuestasCreador, ...respuestasInvitado],
                resumen: {
                    jugadores: [
                        {
                            jugador_id: Number(creador.jugador_id),
                            ...statsCreador,
                            ganador: ganadorLocal?.jugador_id === creador.jugador_id ? 1 : 0,
                        },
                        {
                            jugador_id: Number(invitado.jugador_id),
                            ...statsInvitado,
                            ganador: ganadorLocal?.jugador_id === invitado.jugador_id ? 1 : 0,
                        },
                    ],
                    ganador_jugador_id: jugadorIdGanador,
                    ended_at: (Date.now()),
                },
            };


            setPartidaCompleta(payload);
        }

    }, [
        juegoTerminado,
        config?.partida_id,
        preguntas,
        respuestas,
        creador,
        invitado,
        currentUserId,
        respuestasPorJugador,
        partidasPreguntasDeLaPartida
    ]);

    // crear instancia una vez que el canvas existe
    useEffect(() => {
        if (canvasRef.current && !confettiInstanceRef.current) {
            confettiInstanceRef.current = confetti.create(canvasRef.current, {
                resize: true,
                useWorker: true,
            });
        }
    }, []);

    const confetiFinal = () => {
        const instance = confettiInstanceRef.current;
        if (!instance) return;

        instance({
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

    useEffect(() => {
        // 👉 Solo cuando la partida terminó
        if (!juegoTerminado) return;

        // 👉 Y cuando ya existe un ganador en el resumen de la partida
        const ganadorId = partidaCompleta?.resumen?.ganador_jugador_id;
        if (!ganadorId) return;

        // 🎉 Esto se ejecuta en *ambos* clientes (creador e invitado)
        for (let i = 0; i < 10; i++) {
            setTimeout(confetiFinal, 500 + i * 500);
        }
    }, [juegoTerminado, partidaCompleta]);


    // ====== UI ======
    // if (mostrarContador && contadorInicial > 0) {
    //     return (
    //         <div className='min-h-screen flex items-start justify-center relative overflow-hidden'>
    //             <div className='relative z-10 text-center'>
    //                 <h1 className='text-5xl md:text-6xl font-black text-white mb-8 drop-shadow-lg'>
    //                     ¡Prepárate!
    //                 </h1>
    //                 <div className='bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4 rounded-3xl text-white text-2xl font-bold mb-6 shadow-2xl border-2 border-purple-400'>
    //                     🎮 Categoría:{' '}
    //                     <span className='text-yellow-300'>
    //                         {String(config?.categoria || '').toUpperCase()}
    //                     </span>
    //                 </div>
    //                 <div className='space-y-5 mb-4 bg-black/30 p-4 rounded-2xl backdrop-blur-sm border border-purple-400/50'>
    //                     <p className='text-white text-xl flex items-center justify-center gap-3'>
    //                         <span className='text-2xl'>⏱️</span>
    //                         Tiempo por pregunta:{' '}
    //                         <span className='font-bold text-yellow-300'>
    //                             {tiempoPorPregunta(config?.tiempo)}s
    //                         </span>
    //                     </p>
    //                     <p className='text-white text-xl flex items-center justify-center gap-3'>
    //                         <span className='text-2xl'>📊</span>
    //                         Dificultad:{' '}
    //                         <span className='font-bold text-orange-400 capitalize'>
    //                             {String(config?.dificultad || '')}
    //                         </span>
    //                     </p>
    //                     <p className='text-white text-xl flex items-center justify-center gap-3'>
    //                         <span className='text-2xl'>❓</span>
    //                         Total de preguntas: <span className='font-bold text-green-400'>10</span>
    //                     </p>
    //                 </div>
    //                 <div className='mb-4'>
    //                     <div className='text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 animate-pulse drop-shadow-[0_0_60px_rgba(250,204,21,1)]'>
    //                         {contadorInicial}
    //                     </div>
    //                 </div>
    //                 <div className='text-white text-2xl font-bold animate-bounce'>El juego comenzará en...</div>
    //             </div>
    //         </div>
    //     );
    // }
    return (
        <div className='w-full h-full text-white pt-5 mb-10'>
            {/* Canvas SIEMPRE montado */}
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

            {mostrarContador && contadorInicial > 0 ? (
                // 🧮 PANTALLA DE CONTADOR (lo que antes estaba en el return temprano)
                <div className='min-h-screen flex items-start justify-center relative overflow-hidden'>
                    <div className='relative z-10 text-center'>
                        <h1 className='text-5xl md:text-6xl font-black text-white mb-8 drop-shadow-lg'>
                            ¡Prepárate!
                        </h1>
                        <div className='bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4 rounded-3xl text-white text-2xl font-bold mb-6 shadow-2xl border-2 border-purple-400'>
                            🎮 Categoría:{' '}
                            <span className='text-yellow-300'>
                                {String(config?.categoria || '').toUpperCase()}
                            </span>
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
                        <div className='text-white text-2xl font-bold animate-bounce'>
                            El juego comenzará en...
                        </div>
                    </div>
                </div>
            ) : (
                // 🎮 ACA VA TODO LO QUE YA TENÍAS: preguntas / podio / resumen
                <div className='col-span-3 flex flex-col items-center justify-start'>
                    {loading ? (
                        <div className='text-center space-y-4'>
                            <p className='text-white text-2xl font-bold'>Cargando preguntas...</p>
                            {alerta && <p className='text-white/80'>{alerta}</p>}
                        </div>
                    ) : alerta ? (
                        <>
                            {/* {console.log("ganador: ", ganador)} */}
                            {/* {console.log("perdedor: ", perdedor)} */}
                            {/* {console.log("config: ", config)} */}

                            <Link
                                to='/'
                                className='inline-flex items-center text-yellow-600 hover:text-yellow-800 mb-3 transition-colors'
                            >
                                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                                </svg>
                                volver
                            </Link>

                            {/* muestra "juego terminado" */}
                            <div className='bg-red-500/20 border-2 border-red-500 text-red-200 p-6 mt-5 rounded-2xl text-xl font-bold text-center'>
                                {alerta}
                            </div>

                            {partidaCompleta?.resumen?.ganador_jugador_id != null ? ( // != permite null y undefined
                                <>
                                    {/* PODIO de juego terminado */}
                                    <div className='flex flex-row items-end mt-10'>

                                        {/* ganador */}
                                        <div className='flex flex-col items-center'>
                                            {/* número 1 */}
                                            <span className='mb-2 w-10 h-10 rounded-full bg-yellow-400 text-slate-900 
                                    flex items-center justify-center text-xl font-extrabold'>
                                                1
                                            </span>

                                            <div className='w-52'>
                                                <div className='flex flex-col items-center justify-start'>
                                                    <div className='bg-gradient-to-b from-black/40 to-blue-800/10 p-6 shadow-xl w-full rounded-l-lg rounded-tr-lg border-2 border-blue-400/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-400/20'>
                                                        <div className='flex flex-col items-center'>
                                                            {ganador ? (
                                                                <>
                                                                    {ganador?.foto_perfil && ganador?.foto_perfil !== `${API}/uploads/default.png` && ganador?.foto_perfil !== `/uploads/default.png` ? (
                                                                        <img
                                                                            src={resolveFotoAjena(ganador?.foto_perfil)}
                                                                            alt='ganador'                                                                                                                                                  
                                                                            className='w-24 h-24 rounded-full object-cover border-4 border-blue-800/10 bg-gradient-to-br group-hover:scale-105 transition-transform duration-300 shadow-lg mb-4'
                                                                        />
                                                                    ) : (
                                                                        <div className='w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-5xl mb-4 shadow-lg'>
                                                                            👤
                                                                        </div>
                                                                    )}
                                                                    <span className='bg-blue-900 px-4 py-2 rounded-full text-sm font-bold text-center text-yellow-300'>
                                                                        {ganador?.nombre || 'ganador'}
                                                                    </span>
                                                                    <span className='text-xs mt-2 opacity-70'>{ganador?.puntaje_total} puntos!</span>
                                                                </>
                                                            ) : (
                                                                <div className='w-24 h-24 rounded-full bg-white/20' />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* perdedor */}
                                        <div className='flex flex-col items-center mt-6'>
                                            {/* número 2 */}
                                            <span className='mb-2 w-8 h-8 rounded-full bg-gray-300 text-slate-900 
                                    flex items-center justify-center text-md font-bold'>
                                                2
                                            </span>

                                            <div className='w-44'>
                                                <div className='flex flex-col items-center gap-4'>
                                                    <div className='bg-gradient-to-b from-black/40 to-blue-800/10 p-4 shadow-xl w-full rounded-r-lg border-2 border-blue-400/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-400/20'>
                                                        <div className='flex flex-col items-center '>
                                                            {perdedor ? (
                                                                <>
                                                                    {perdedor.foto_perfil && perdedor.foto_perfil !== `/uploads/default.png` && perdedor?.foto_perfil !== `/uploads/default.png` ? (
                                                                        <img
                                                                            src={resolveFotoAjena(perdedor.foto_perfil)}
                                                                            alt='perdedor'                                                                                                                                                     
                                                                            className='w-20 h-20 rounded-full object-cover border-4  border-blue-800/10 bg-gradient-to-br  group-hover:scale-105 transition-transform duration-300 shadow-lg mb-4'
                                                                        />
                                                                    ) : (
                                                                        <div                                                                         
                                                                        className='w-20 h-20 rounded-full bg-gradient-to-br  from-blue-400 to-blue-600 flex items-center justify-center text-4xl mb-4 shadow-lg'>
                                                                            👤
                                                                        </div>
                                                                    )}
                                                                    <span className='bg-green-800 px-4 py-2 rounded-full text-sm font-bold text-center text-yellow-300'>
                                                                        {perdedor?.nombre || 'perdedor'}
                                                                    </span>
                                                                    <span className='text-xs mt-2 opacity-70'>{perdedor?.puntaje_total} puntos!</span>
                                                                </>
                                                            ) : (
                                                                <div className='w-20 h-20 rounded-full bg-white/20' />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>


                                    <div className='bg-black/50 mt-5 rounded-full w-96 text-center'>
                                        <p className=' text-xl font-bold text-gray-200 p-4'>
                                            {ganador
                                                ? `¡${ganador?.nombre} ha ganado esta partida!`
                                                : 'Calculando ganador...'}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* PODIO de juego terminado */}
                                    <div className='flex flex-row items-end mt-10'>

                                        {/* ganador */}
                                        <div className='flex flex-col items-center'>
                                            <div className='w-52'>
                                                <div className='flex flex-col items-center justify-start'>
                                                    <div className='bg-gradient-to-b from-black/40 to-blue-800/10 p-6 shadow-xl w-full rounded-l-lg rounded-tr-lg border-2 border-blue-400/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-400/20'>
                                                        <div className='flex flex-col items-center'>
                                                            {jugadores[0] ? (
                                                                <>
                                                                    {jugadores[0]?.foto_perfil && jugadores[0]?.foto_perfil !== `${API}/uploads/default.png` && jugadores[0]?.foto_perfil !== `/uploads/default.png` ? (
                                                                        <img
                                                                            src={resolveFotoAjena(jugadores[0]?.foto_perfil)}
                                                                            alt='jugador creador'                                                                                                                                                       
                                                                            className='w-24 h-24 rounded-full object-cover border-4 border-blue-800/10 bg-gradient-to-br group-hover:scale-105 transition-transform duration-300 shadow-lg mb-4'
                                                                        />
                                                                    ) : (
                                                                        <div className='w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-5xl mb-4 shadow-lg'>
                                                                            👤
                                                                        </div>
                                                                    )}
                                                                    <span className='bg-blue-900 px-4 py-2 rounded-full text-sm font-bold text-center text-yellow-300'>
                                                                        {jugadores[0]?.nombre || 'jugador creador'}
                                                                    </span>
                                                                    {/* <span className='text-xs mt-2 opacity-70'>{ganador?.puntaje_total} puntos!</span> */}
                                                                </>
                                                            ) : (
                                                                <div className='w-24 h-24 rounded-full bg-white/20' />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* perdedor */}
                                        <div className='flex flex-col items-center mt-10'>
                                            <div className='w-52'>
                                                <div className='flex flex-col items-center gap-4'>
                                                    <div className='bg-gradient-to-b from-black/40 to-blue-800/10 p-6 shadow-xl border-2 w-full rounded-r-lg border-blue-400/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-400/20'>
                                                        <div className='flex flex-col items-center '>
                                                            {jugadores[1] ? (
                                                                <>
                                                                    {jugadores[1].foto_perfil && jugadores[1].foto_perfil !== `/uploads/default.png` && jugadores[1]?.foto_perfil !== `/uploads/default.png` ? (
                                                                        <img
                                                                            src={resolveFotoAjena(jugadores[1].foto_perfil)}
                                                                            alt='jugador invitado'                                                                                                                                                        
                                                                            className='w-24 h-24 rounded-full object-cover border-4  border-blue-800/10 bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg mb-4 group-hover:scale-105 transition-transform duration-300'
                                                                        />
                                                                    ) : (
                                                                        <div                                                                         
                                                                        className='w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-4xl mb-4 shadow-lg'>
                                                                            👤
                                                                        </div>
                                                                    )}
                                                                    <span className='bg-green-800 px-4 py-2 rounded-full text-sm font-bold text-center text-yellow-300'>
                                                                        {jugadores[1]?.nombre || 'jugador invitado'}
                                                                    </span>
                                                                    {/* <span className='text-xs mt-2 opacity-70'>{perdedor?.puntaje_total} puntos!</span> */}
                                                                </>
                                                            ) : (
                                                                <div className='w-24 h-24 rounded-full bg-white/20' />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    {console.log("jugadores: ", jugadores)}

                                    <div className='bg-black/50 mt-5 rounded-full w-96 text-center'>
                                        <p className=' text-xl font-bold text-gray-200 p-4'>
                                            ¡La partida es un empate!
                                        </p>
                                    </div>
                                </>
                            )}

                            {/*==============================  Resumen de Respuestas =======================================*/}
                            {juegoTerminado && (
                                <div className='bg-black/50 rounded-2xl p-8 mt-10 w-full max-w-2xl'>
                                    {/*console.log(juegoTerminado)*/}
                                    {/*console.log(respuestas)*/}
                                    {console.log("RespuestasPorJugador: ", respuestasPorJugador)}
                                    {console.log("partidaCompleta: ", partidaCompleta)}
                                    <h2 className='text-2xl font-bold text-yellow-300 mb-6'>Resumen de Respuestas</h2>
                                    <div className='space-y-3 max-h-64 overflow-y-auto'>
                                        {respuestas.map((respuesta, index) => (
                                            <div key={index} className='bg-purple-500/20 p-3 rounded-lg border border-purple-400'>
                                                <p className='text-sm'>
                                                    <span className='font-bold text-yellow-300'>P{index + 1}:</span> {respuesta.texto}
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
                        </>
                    ) : preguntaActual && juegoIniciado ? (
                        <>

                            {/* === NUEVO CSS: reloj centrado arriba, como en “individual” === */}
                            <div className='w-full h-full text-white flex items-center justify-center'>
                                <div
                                    className={`rounded-3xl px-6 py-4 text-center shadow-2xl border-4 w-40 ${tiempoRestante <= 5 && tiempoRestante > 0
                                        ? 'bg-gradient-to-b from-red-500 to-orange-600 border-red-300/30 animate-pulse'
                                        : 'bg-gradient-to-b from-yellow-300/80 to-yellow-400/80 border-yellow-400'
                                        }`}
                                >
                                    <p className='text-sm font-bold text-gray-800 mb-2'>⏱️ TIEMPO</p>
                                    <p
                                        className={`text-5xl font-black ${tiempoRestante <= 5 && tiempoRestante > 0 ? 'text-white' : 'text-red-600'
                                            }`}
                                    >
                                        {tiempoRestante}
                                    </p>
                                    <p className='text-xs font-bold text-gray-800 mt-2'>segundos</p>
                                </div>
                            </div>

                            {/* titulo de la categoria */}
                            {/* <div className='bg-gradient-to-r from-orange-500 to-pink-500 rounded-full px-8 py-3 mt-8 text-2xl font-black shadow-lg'>
                                {String(config?.categoria || '').toUpperCase()}
                            </div> */}

                            {/* NUEVA CATEGORÍA MEJORADA: con icono, gradiente animado y efectos de brillo */}
                            <div className='relative group mt-8 '>
                                {/* Efecto de resplandor de fondo */}
                                <div className='absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-400 to-orange-400 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 animate-pulse'></div>
                                <div className='relative bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 rounded-full px-10 py-4 text-2xl font-black shadow-2xl border-2 border-yellow-300/50 hover:scale-105 transition-transform duration-300'>
                                    <span className='text-3xl mr-3'>
                                        {/* {categoryIcons[categoria.toLowerCase()] || '🎯'} */}
                                        {categoryIcons[String(config?.categoria || '').toUpperCase()] || '🎯'}
                                    </span>
                                    {categoryTranslations[config?.categoria ]?.toUpperCase()}
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

                            {/* === NUEVO CSS: layout en 5 columnas (jugador izq, centro, jugador der) === */}
                            <div className='grid grid-cols-3 gap-6 h-fit pt-10'>

                                {/* izquierda - Jugador 1 - creador */}
                                <div className='col-span-1 flex flex-col items-center justify-start'>
                                    {/* bg-gradient-to-b from-black/40 to-blue-800/10 rounded-2xl p-6 shadow-xl border-2 border-blue-400/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-400/20 */}
                                    <div className='bg-gradient-to-b from-black/40 to-blue-800/10 rounded-2xl p-6 shadow-xl border-2 border-blue-400/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-400/20 w-52'>
                                        <div className='flex flex-col items-center'>
                                            {creador ? (
                                                <>
                                                    {creador?.foto_perfil && creador?.foto_perfil !== `${API}/uploads/default.png` && creador?.foto_perfil !== `/uploads/default.png` ? (
                                                        <img
                                                            src={resolveFotoAjena(creador?.foto_perfil)}
                                                            alt='Creador'                                                                                                                         
                                                            className='w-24 h-24 rounded-full object-cover border-4 border-blue-800/10 bg-gradient-to-br group-hover:scale-105 transition-transform duration-300 shadow-lg mb-4'
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
                                {/* Mesaje: Siguiente Pregunta... */}
                                {mostrarEspera ? (
                                    <div className='bg-black/40 border-2 border-purple-400 rounded-2xl p-8 w-full max-w-2xl shadow-2xl text-center'>
                                        <div className='flex flex-col items-center justify-center gap-4'>
                                            <div className='flex justify-center gap-2'>
                                                <div className='w-3 h-3 bg-yellow-300 rounded-full animate-bounce' />
                                                <div
                                                    className='w-3 h-3 bg-yellow-300 rounded-full animate-bounce'
                                                    style={{ animationDelay: '0.2s' }}
                                                />
                                                <div
                                                    className='w-3 h-3 bg-yellow-300 rounded-full animate-bounce'
                                                    style={{ animationDelay: '0.4s' }}
                                                />
                                            </div>
                                            <p className='text-2xl font-bold text-yellow-300 animate-pulse'>
                                                {t('nextQuestion')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
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
                                )}

                                {/* derecha - Jugador 2 - invitado */}
                                <div className='col-span-1 flex flex-col items-center justify-start gap-4'>
                                    <div className='bg-gradient-to-b from-black/40 to-blue-800/10 rounded-2xl p-6 shadow-xl border-2 border-blue-400/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-400/20 w-52'>
                                        <div className='flex flex-col items-center'>
                                            {invitado ? (
                                                <>
                                                    {invitado.foto_perfil && invitado.foto_perfil !== `/uploads/default.png` && invitado?.foto_perfil !== `/uploads/default.png` ? (
                                                        <img
                                                            src={resolveFotoAjena(invitado.foto_perfil)}
                                                            alt='Invitado'                                                            
                                                            className='w-24 h-24 rounded-full object-cover border-4 border-blue-800/10 shadow-lg mb-4 group-hover:scale-105 transition-transform duration-300'
                                                        />
                                                    ) : (
                                                        <div                                                            
                                                            className='w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-5xl mb-4 shadow-lg'
                                                        >
                                                            👤
                                                        </div>
                                                    )}
                                                    <span className='bg-blue-600 px-4 py-2 rounded-full text-sm font-bold text-center text-yellow-300'>
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
                        </>
                    ) : (
                        <p className='text-xl text-gray-300'>No hay preguntas disponibles.</p>
                    )}
                </div>
            )
            }
        </div >
    );
}