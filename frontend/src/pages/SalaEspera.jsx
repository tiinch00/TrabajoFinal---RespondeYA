// src/pages/SalaEspera.jsx

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import axios from 'axios';
import { resolveFotoAjena } from '../utils/resolveFotoAjena.js';
import { useGame } from '../context/ContextJuego.jsx';
import { useTranslation } from 'react-i18next';

// ===== Helpers para identificar usuarios de forma tolerante =====
function normalizeName(s) {
  return (s || '').toString().trim().toLowerCase();
}

function samePlayer(a = {}, b = {}) {
  // Prioridad: userId -> jugador_id -> nombre
  if (a.userId != null && b.userId != null) return a.userId === b.userId;
  if (a.jugador_id != null && b.jugador_id != null) return a.jugador_id === b.jugador_id;
  const na = normalizeName(a.nombre);
  const nb = normalizeName(b.nombre);
  return na && nb && na === nb;
}

function includesPlayer(list = [], me = {}) {
  return list.some((p) => samePlayer(p, me));
}

// ===== Dedupe y orden estable (creador primero, luego invitado “fijado”) =====
function dedupeJugadores(arr = []) {
  const byKey = new Map();
  for (const j of arr) {
    const key = j?.userId != null ? `u:${j.userId}` : `n:${(j?.nombre || '').toLowerCase()}`;
    byKey.set(key, j); // si llega duplicado, se queda con el último
  }
  return Array.from(byKey.values());
}

export default function SalaEspera() {
  const { t } = useTranslation();
  const [redirIn, setRedirIn] = useState(null); // null | 3..0
  const redirIntervalRef = useRef(null);
  const redirTimerRef = useRef(null);
  const goingToGameRef = useRef(false);

  // Bloqueo estable del invitado (userId del jugador 2)
  const invitadoLockRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';
  const { id } = useParams(); // param visible (puede ser código o id numérico)
  const { user, inicializarSocket } = useGame();

  const [socketReady, setSocketReady] = useState(false);
  const [jugadores, setJugadores] = useState([]); // [{userId, nombre, foto_perfil, esCreador}]
  const [mensaje, setMensaje] = useState(t('connecting'));
  const [cuenta, setCuenta] = useState(null); // null | 10..0
  const [configJuego, setConfigJuego] = useState(null);
  const navigate = useNavigate();

  // Normaliza rutas absolutas de imágenes
  const abs = (p) =>
    typeof p === 'string' && p.startsWith('http') ? p : `${API_URL}${p || '/uploads/default.png'}`;

  // ====== REFS ESTABLES (sin useMemo) ======

  // SalaKey: exactamente lo que espera el server (número si es numérico, string si es código)
  const salaKeyRef = useRef(null);
  if (salaKeyRef.current === null) {
    salaKeyRef.current = /^\d+$/.test(id) ? Number(id) : id;
  }

  // Usuario actual estable (para evaluar si es “tercero”)
  const currentUserRef = useRef(null);
  if (!currentUserRef.current) {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null') || {};
      currentUserRef.current = {
        userId: u.id ?? null,
        jugador_id: u.jugador_id ?? null,
        nombre: u.name || u.username || u.email?.split?.('@')[0] || 'Jugador',
      };
    } catch {
      currentUserRef.current = { userId: null, jugador_id: null, nombre: 'Jugador' };
    }
  }

  // Socket y banderas de control
  const socketRef = useRef(null);
  const listenersAttachedRef = useRef(false);
  const joinedRef = useRef(false); // evita re-uniones múltiples

  // ===== Ordenador estable con lock para invitado =====
  function ordenarEstable(list = []) {
    const creador = list.find((j) => j?.esCreador) || null;

    // Candidato invitado:
    // 1) si hay lock y el user sigue en la lista y no es el creador → mantener lock
    let invitado =
      (invitadoLockRef.current != null
        ? list.find((j) => j?.userId === invitadoLockRef.current && !j?.esCreador)
        : null) || null;

    // 2) si no hay lock válido, elegir el primer no-creador ≠ creador y lockearlo
    if (!invitado) {
      const candidatos = list.filter(
        (j) => !j?.esCreador && (!creador || j?.userId !== creador?.userId)
      );

      // Orden determinista: primero por tener userId, luego por userId asc; si no hay, por nombre
      candidatos.sort((a, b) => {
        const aid = a.userId,
          bid = b.userId;
        if (aid != null && bid == null) return -1;
        if (aid == null && bid != null) return 1;
        if (aid != null && bid != null) return aid - bid;
        // ambos sin userId -> por nombre
        return normalizeName(a.nombre).localeCompare(normalizeName(b.nombre));
      });

      invitado = candidatos[0] || null;
      if (invitado?.userId != null) invitadoLockRef.current = invitado.userId;
    }

    // Devolver solo top2, en orden (creador primero)
    const out = [];
    if (creador) out.push(creador);
    if (invitado && (!creador || invitado.userId !== creador.userId)) out.push(invitado);
    return out;
  }

  // ===== Redirección local (por si el server no emite sala_llena) =====
  const startLocalRedir = () => {
    // limpiar timers previos
    if (redirIntervalRef.current) clearInterval(redirIntervalRef.current);
    if (redirTimerRef.current) clearTimeout(redirTimerRef.current);

    setMensaje('La sala ya está completa (máximo 2 jugadores).');
    setRedirIn(3);
    redirIntervalRef.current = setInterval(() => {
      setRedirIn((prev) => {
        if (prev <= 1) {
          clearInterval(redirIntervalRef.current);
          redirIntervalRef.current = null;
          setMensaje('Redirigiendo a la lista de sala de espera…');
          redirTimerRef.current = setTimeout(() => {
            navigate('/salaPartidas');
          }, 800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ===== Efecto 1: Inicializar socket y adjuntar listeners UNA sola vez =====
  useEffect(() => {
    if (!socketRef.current) socketRef.current = inicializarSocket();
    const s = socketRef.current;
    if (!s || listenersAttachedRef.current) return;

    // ---- Handlers (no dependas de estado/props para que no se recreen) ----
    const onSalaActualizada = (estado) => {
      const deduped = dedupeJugadores(estado?.jugadores || []);
      const top2 = ordenarEstable(deduped);

      // Solo evaluar “tercero” si YA hay 2 jugadores efectivos en top2
      if (top2.length === 2) {
        const me = currentUserRef.current;
        const soyTop2 = includesPlayer(top2, me);
        // Si NO soy top2 y todavía no fui aceptado por el server, redirijo localmente
        if (!soyTop2 && !socketReady) {
          startLocalRedir();
        }
      }

      setJugadores(top2);
      setMensaje(top2.length === 1 ? t('waitingPlayer') : '');
    };

    const onSalaLlena = () => {
      startLocalRedir();
    };

    const onListoParaJugar = ({ kickoffAt, config } = {}) => {
      if (config) {
        setConfigJuego(config);
        localStorage.setItem('ultima_config_multijugador', JSON.stringify(config));
      }
      if (Number.isFinite(kickoffAt)) {
        const ms = Math.max(0, kickoffAt - Date.now());
        setCuenta(Math.ceil(ms / 1000));
      } else {
        setCuenta(10);
      }
    };

    const onDesconexionOtro = (estado) => {
      const deduped = dedupeJugadores(estado?.jugadores || []);
      // si el lock actual ya no está, se intentará lockear al nuevo en ordenarEstable
      if (invitadoLockRef.current != null) {
        const stillThere = deduped.some((j) => j?.userId === invitadoLockRef.current);
        if (!stillThere) invitadoLockRef.current = null;
      }
      const top2 = ordenarEstable(deduped);
      setJugadores(top2);
      setMensaje(t('playerGone'));
      setCuenta(null);
    };

    const onComenzar = () => {
      const cfg =
        configJuego ||
        (() => {
          try {
            return JSON.parse(localStorage.getItem('ultima_config_multijugador') || 'null');
          } catch {
            return null;
          }
        })();

      goingToGameRef.current = true;
      navigate(`/jugarMultijugador/${id}`, { state: { config: cfg } });
      // (La ruta puede seguir usando el param visible `id`; los emits usan `salaKeyRef.current`)
    };

    // ---- Attach listeners (una sola vez) ----
    s.on('sala_actualizada', onSalaActualizada);
    s.on('sala_llena', onSalaLlena);
    s.on('listo_para_jugar', onListoParaJugar);
    s.on('jugador_se_fue', onDesconexionOtro);
    s.on('sala:comenzar', onComenzar);
    listenersAttachedRef.current = true;

    // Cleanup real al desmontar
    return () => {
      if (!goingToGameRef.current) {
        s.emit('salir_sala', { salaId: salaKeyRef.current });
      }
      s.off('sala_actualizada', onSalaActualizada);
      s.off('sala_llena', onSalaLlena);
      s.off('listo_para_jugar', onListoParaJugar);
      s.off('jugador_se_fue', onDesconexionOtro);
      s.off('sala:comenzar', onComenzar);
      listenersAttachedRef.current = false;

      if (redirIntervalRef.current) clearInterval(redirIntervalRef.current);
      if (redirTimerRef.current) clearTimeout(redirTimerRef.current);
    };
    // deps vacías: corre una sola vez
  }, []);

  // ===== Efecto 2: obtener_sala + unirse_sala (UNA sola vez) =====
  useEffect(() => {
    const s = socketRef.current;
    if (!s || joinedRef.current) return;

    //console.log('Sala param:', id, '→ salaKey usada:', salaKeyRef.current);

    // Estado actual
    s.emit('obtener_sala', { salaId: salaKeyRef.current }, (estado) => {
      //console.log('obtener_sala → resp:', estado);

      if (!estado?.ok) {
        // Sala no existe o expiró
        setMensaje(estado?.error || 'Sala no encontrada');
        if (redirTimerRef.current) clearTimeout(redirTimerRef.current);
        redirTimerRef.current = setTimeout(() => navigate('/salaPartidas'), 3000);
        return;
      }

      const deduped = dedupeJugadores(estado.jugadores || []);
      const top2 = ordenarEstable(deduped);
      setJugadores(top2);
      setMensaje(top2.length === 1 ? 'Esperando jugador 2...' : '');

      if (estado?.config) {
        setConfigJuego(estado.config);
        localStorage.setItem('ultima_config_multijugador', JSON.stringify(estado.config));
      }

      const me = currentUserRef.current;
      // Si ya hay 2 y NO soy parte de ellos, redirijo (no me uno)
      if (top2.length === 2 && !includesPlayer(top2, me)) {
        startLocalRedir();
        return;
      }

      // Unirme normalmente (datos defensivos desde LS)
      const fromLS = JSON.parse(localStorage.getItem('user') || 'null') || {};
      const foto =
        fromLS.foto_perfil || fromLS.avatar_url || '/uploads/default.png' || '/uploads/default.png';
      const datosUsuario = {
        userId: fromLS.id ?? null,
        nombre: (
          fromLS.name ||
          fromLS.username ||
          fromLS.email?.split?.('@')[0] ||
          'Jugador'
        ).trim(),
        foto_perfil: foto,
        jugador_id: fromLS.jugador_id,
      };

      s.emit('unirse_sala', { salaId: salaKeyRef.current, ...datosUsuario }, (resp) => {
        if (!resp?.ok) {
          setMensaje(resp?.error || 'No se pudo entrar a la sala');
          const err = (resp?.error || '').toLowerCase();
          if (err.includes('completa') || err.includes('llena')) startLocalRedir();
        } else {
          setSocketReady(true);
          joinedRef.current = true; // evita reintentos
        }
      });
    });
    // deps vacías: corre una sola vez
  }, []);

  // ===== Cuenta regresiva a juego =====
  useEffect(() => {
    if (cuenta === null) return;
    if (cuenta === 0) {
      const cfg =
        configJuego ||
        (() => {
          try {
            return JSON.parse(localStorage.getItem('ultima_config_multijugador') || 'null');
          } catch {
            return null;
          }
        })();

      goingToGameRef.current = true;
      navigate(`/jugarMultijugador/${id}`, { state: { config: cfg } });
      return;
    }
    const t = setTimeout(() => setCuenta((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cuenta, id, navigate, configJuego]);

  // ===== Render =====
  const jugador1 = jugadores[0] || null;
  const jugador2 = jugadores[1] || null;

  // if (jugadores.length > 0) {
  //     console.log(jugador1.foto_perfil);
  //     console.log(`${API_URL}${jugador1.foto_perfil}`);
  //     console.log(`${API_URL}${user.foto_perfil}`);
  // }

  return (
    <div className='min-h-screen w-full px-3 py-4 flex items-start justify-center'>
      <div
        className='w-full max-w-4xl rounded-3xl p-4 sm:p-6 text-white 
                    bg-gradient-to-br from-purple-900/30 via-purple-800/40 to-indigo-900/50 
                    shadow-2xl'
      >
        {/* Título */}
        <h2 className='text-center text-xl sm:text-2xl font-extrabold mb-4 sm:mb-6 break-words'>
          {t('holdingRoom')} #{id}
        </h2>

        {/* Contenedor jugadores + centro */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 items-center'>
          {/* Jugador 1 */}
          <div className='flex flex-col items-center'>
            {jugador1 ? (
              <>
                {jugador1?.foto_perfil !== `/uploads/default.png` ? (
                  <img
                    src={resolveFotoAjena(jugador1.foto_perfil)}
                    alt='jugador1'
                    className='w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-green-400'
                  />
                ) : (
                  <p
                    className='text-[52px] sm:text-[70px] w-24 h-24 sm:w-28 sm:h-28 
                               bg-gray-200/90 rounded-full flex items-center justify-center'
                  >
                    👤
                  </p>
                )}
                <p className='mt-2 font-bold text-sm sm:text-base text-center px-2 break-words'>
                  {jugador1.nombre}
                </p>
                <span className='text-[11px] sm:text-xs opacity-70'>
                  {jugador1?.esCreador ? t('creator') : 'Jugador 1'}
                </span>
              </>
            ) : (
              <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20' />
            )}
          </div>

          {/* Centro: estado / countdown */}
          <div className='text-center'>
            {cuenta !== null ? (
              <p className='text-4xl sm:text-5xl font-extrabold'>{cuenta}</p>
            ) : (
              <p className='text-lg sm:text-xl font-bold px-4'>
                {mensaje || (jugadores.length < 2 ? t('waitingPlayer') : t('readyToStart'))}
              </p>
            )}

            {/* Banner de cuenta regresiva / redirección */}
            {redirIn !== null && (
              <div className='mt-4 text-center'>
                {redirIn > 0 ? (
                  <div
                    className='inline-flex flex-wrap items-center justify-center gap-2 
                                bg-black/60 text-white px-4 py-2 rounded-xl text-sm sm:text-base'
                  >
                    <span>{t('completedRoom')}</span>
                    <span className='text-xl sm:text-2xl font-extrabold'>{redirIn}</span>
                    <span>…</span>
                  </div>
                ) : (
                  <div
                    className='inline-flex items-center bg-black/60 text-white px-4 py-2 
                                rounded-xl text-sm sm:text-base'
                  >
                    {t('redirecting')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Jugador 2 */}
          <div className='flex flex-col items-center'>
            {jugador2 ? (
              <>
                {jugador2?.foto_perfil !== `/uploads/default.png` ? (
                  <img
                    src={resolveFotoAjena(jugador2.foto_perfil)}
                    alt='jugador2'
                    className='w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-green-400'
                  />
                ) : (
                  <p
                    className='text-[52px] sm:text-[70px] w-24 h-24 sm:w-28 sm:h-28 
                               bg-gray-200/90 rounded-full flex items-center justify-center'
                  >
                    👤
                  </p>
                )}
                <p className='mt-2 font-bold text-sm sm:text-base text-center px-2 break-words'>
                  {jugador2.nombre}
                </p>
                <span className='text-[11px] sm:text-xs opacity-70'>
                  {jugador2?.esCreador ? t('creator') : t('guess')}
                </span>
              </>
            ) : (
              <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20' />
            )}
          </div>
        </div>

        {!socketReady && (
          <p className='text-center mt-6 text-yellow-300 font-semibold text-sm sm:text-base'>
            {t('conectingSala')}
          </p>
        )}
      </div>
    </div>
  );
}
