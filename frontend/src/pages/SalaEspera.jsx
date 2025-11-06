// src/pages/SalaEspera.jsx

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useGame } from '../context/ContextJuego.jsx';

export default function SalaEspera() {
    const goingToGameRef = useRef(false);
    const API = "http://localhost:3006";
    const { id } = useParams();             // id de sala
    const { user, inicializarSocket } = useGame();
    const [socketReady, setSocketReady] = useState(false);
    const [jugadores, setJugadores] = useState([]); // [{id, nombre, foto_perfil, esCreador}]
    const [mensaje, setMensaje] = useState('Conectando...');
    const [cuenta, setCuenta] = useState(null);     // null | 10..0
    const [configJuego, setConfigJuego] = useState(null);
    const navigate = useNavigate();

    // helper local
    const abs = (p) => (typeof p === 'string' && p.startsWith('http')
        ? p
        : `http://localhost:3006${p || '/uploads/default.png'}`);

    useEffect(() => {
        const s = inicializarSocket();
        if (!s) return;

        /*const getFoto = () => {
            if (user?.foto_perfil == null) {
                return null;
            } else {
                const f = user?.foto_perfil || user?.avatar_url;
                return typeof f === 'string' && f.trim() ? f : '/uploads/default.png';
            }
        };
        const datosUsuario = {
            userId: user?.id ?? null,
            nombre: (user?.name || user?.username || (user?.email?.split('@')[0]) || 'Jugador').trim(),
            foto_perfil: getFoto(),
        };*/

        // Fallback rápido a localStorage para evitar la carrera del Context
        const fromLS = (() => {
            try {
                const raw = localStorage.getItem('user');
                return raw ? JSON.parse(raw) : null;
            } catch { return null; }
        })();
        const u = user || fromLS || {};
        const foto = (() => {
            const f = u.foto_perfil || u.avatar_url;
            return (typeof f === 'string' && f.trim()) ? f : '/uploads/default.png';
        })();
        const datosUsuario = {
            userId: u.id ?? null,
            nombre: (u.name || u.username || (u.email?.split?.('@')[0]) || 'Jugador').trim(),
            foto_perfil: foto,
        };

        const onSalaActualizada = (estado) => {
            setJugadores(estado.jugadores || []);
            setMensaje(estado.jugadores?.length === 1 ? 'Esperando jugador 2...' : '');
        };

        const onSalaLlena = () => {
            setMensaje('La sala ya está completa (máximo 2 jugadores).');
        };

        const onListoParaJugar = ({ kickoffAt, config } = {}) => {
            if (config) {
                setConfigJuego(config);
                localStorage.setItem('ultima_config_multijugador', JSON.stringify(config));
            }
            // si viene kickoffAt del server, derivamos la cuenta exacta con ese reloj
            if (kickoffAt && Number.isFinite(kickoffAt)) {
                const ms = Math.max(0, kickoffAt - Date.now());
                setCuenta(Math.ceil(ms / 1000));
            } else {
                setCuenta(10); // fallback
            }
        };

        const onDesconexionOtro = (estado) => {
            setJugadores(estado.jugadores || []);
            setMensaje('El otro jugador se fue. Esperando jugador 2...');
            setCuenta(null);
        };

        // en el mismo useEffect donde registrás listeners
        const onComenzar = () => {
            goingToGameRef.current = true;   // <-- marcar que pasamos a la pantalla de juego
            const cfg = configJuego || (() => {
                try { return JSON.parse(localStorage.getItem('ultima_config_multijugador') || 'null'); }
                catch { return null; }
            })();
            navigate(`/jugarMultijugador/${id}`, { state: { config: cfg } });
        };

        // listeners
        s.on('sala_actualizada', onSalaActualizada);
        s.on('sala_llena', onSalaLlena);
        s.on('listo_para_jugar', onListoParaJugar);
        s.on('jugador_se_fue', onDesconexionOtro);
        s.on('sala:comenzar', onComenzar);

        // pido estado actual y me uno
        s.emit('obtener_sala', { salaId: id }, (estado) => {
            if (!estado?.ok) {
                setMensaje(estado?.error || 'Sala no encontrada');
                return;
            }
            setJugadores(estado.jugadores || []);
            setMensaje(estado.jugadores?.length === 1 ? 'Esperando jugador 2...' : '');
            if (estado?.config) {
                setConfigJuego(estado.config);
                localStorage.setItem('ultima_config_multijugador', JSON.stringify(estado.config));
            }

            /*if (user?.id) {
                s.emit('unirse_sala', { salaId: id, ...datosUsuario }, (resp) => {
                    if (!resp?.ok) setMensaje(resp?.error || 'No se pudo entrar a la sala');
                    else setSocketReady(true);
                });
            } else {
                setMensaje('Iniciá sesión para unirte a la sala.');
                return;
            }*/

            // Emitimos SIEMPRE con datos defensivos (el server ya enriquece si viene userId)
            s.emit('unirse_sala', { salaId: id, ...datosUsuario }, (resp) => {
                if (!resp?.ok) setMensaje(resp?.error || 'No se pudo entrar a la sala');
                else setSocketReady(true);
            });
        });

        // cleanup
        return () => {
            //s.emit('salir_sala', { salaId: id });
            if (!goingToGameRef.current) {
                s.emit('salir_sala', { salaId: id }); // solo si NO estamos yendo al juego
            }
            s.off('sala_actualizada', onSalaActualizada);
            s.off('sala_llena', onSalaLlena);
            s.off('listo_para_jugar', onListoParaJugar);
            s.off('jugador_se_fue', onDesconexionOtro);
            s.off('sala:comenzar', onComenzar);
        };
    }, [id, inicializarSocket, user]);

    // cuenta regresiva
    useEffect(() => {
        if (cuenta === null) return;
        if (cuenta === 0) {
            //navigate(`/jugarMultijugador/${id}`, { state: { config } });
            const cfg = configJuego || (() => {
                try { return JSON.parse(localStorage.getItem('ultima_config_multijugador') || 'null'); }
                catch { return null; }
            })();
            navigate(`/jugarMultijugador/${id}`, { state: { config: cfg } });
            return;
        }
        const t = setTimeout(() => setCuenta((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cuenta, id, navigate, configJuego]);

    const jugador1 = jugadores[0] || null;
    const jugador2 = jugadores[1] || null;

    //console.log("jugador2: ", jugador2);

    return (
        <div className='m-3 flex items-center justify-center'>
            <div className='p-6 rounded-3xl text-white w-full max-w-4xl bg-gradient-to-br from-purple-900/30 via-purple-800/40 to-indigo-900/50 shadow-2xl'>
                <h2 className='text-center text-2xl font-extrabold mb-6'>
                    Sala de espera #{id}
                </h2>

                <div className='grid grid-cols-3 gap-4 items-center'>
                    {/* Jugador 1 (izquierda) */}
                    <div className='flex flex-col items-center'>
                        {jugador1 ? (
                            <>
                                {jugador1?.foto_perfil !== "http://localhost:3006/uploads/default.png" ? (
                                    <img
                                        src={abs(jugador1?.foto_perfil)}
                                        alt='jugador1'
                                        className='w-28 h-28 rounded-full object-cover border-4 border-green-400'
                                    />
                                ) : (
                                    <p className="text-[70px] w-28 h-28 bg-gray-200/90 rounded-full text-center">👤</p>
                                )}
                                <p className='mt-2 font-bold'>{jugador1.nombre}</p>
                                <span className='text-xs opacity-70'>{jugador1?.esCreador ? 'Creador' : 'jugador 1'}</span>
                            </>
                        ) : (
                            <div className='w-28 h-28 rounded-full bg-white/20' />
                        )}
                    </div>

                    {/* Centro: estado / countdown */}
                    <div className='text-center'>
                        {cuenta !== null ? (
                            <p className='text-5xl font-extrabold'>{cuenta}</p>
                        ) : (
                            <p className='text-xl font-bold'>
                                {mensaje || (jugadores.length < 2 ? 'Esperando jugador 2...' : 'Listo para empezar')}
                            </p>
                        )}
                    </div>

                    {/* Jugador 2 (derecha) */}
                    <div className='flex flex-col items-center'>
                        {jugador2 ? (
                            <>
                                {jugador2?.foto_perfil !== "http://localhost:3006/uploads/default.png" ? (
                                    <img
                                        src={abs(jugador2?.foto_perfil)}
                                        alt='jugador2'
                                        className='w-28 h-28 rounded-full object-cover border-4 border-green-400'
                                    />
                                ) : (
                                    <p className="text-[70px] w-28 h-28 bg-gray-200/90 rounded-full text-center">👤</p>
                                )}
                                <p className='mt-2 font-bold'>{jugador2.nombre}</p>
                                <span className='text-xs opacity-70'>{jugador2?.esCreador ? 'Invitado' : 'jugador 2'}</span>
                            </>
                        ) : (
                            <div className='w-28 h-28 rounded-full bg-white/20' />
                        )}
                    </div>
                </div>

                {!socketReady && (
                    <p className='text-center mt-6 text-yellow-300 font-semibold'>
                        Conectando a la sala...
                    </p>
                )}
            </div>
        </div>
    );
}
