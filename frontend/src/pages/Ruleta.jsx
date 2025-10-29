import '../assets/css/Ruleta.css';

import { useEffect, useRef, useState } from 'react';

import axios from 'axios';
import { motion } from 'framer-motion';
import premioRueda from '/sounds/premioRueda.mp3';
import useSound from 'use-sound';

export default function Ruleta() {
  const barraRef = useRef(null);
  const cooldownTimerRef = useRef(null);
  const audioRef = useRef(null);

  const [playPremio] = useSound(premioRueda, { volume: 0.7 });

  const [ancho, setAncho] = useState(1);
  const [tiradas, setTiradas] = useState(1);
  const [premio, setPremio] = useState('');
  const [rotation, setRotation] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [jugador, setJugador] = useState(null);

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  useEffect(() => {
    if (premio && premio.includes('Has ganado')) {
      playPremio();
    }
  }, [premio, playPremio]);

  const userId = user?.id;
  const jugador_id = user?.jugador_id;
  //console.log(jugador_id);
  const COOLDOWN_MS = 24 * 60 * 60 * 1000;
  const spinKey = `roulette:lastSpin:${userId ?? 'anonymous'}`;

  const getJugador = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3006/jugadores/${jugador_id}`);
      setJugador(data);
    } catch (err) {
      console.log('GET /jugadores/:id error:', err.response?.data?.error || err.message);
    }
  }

  useEffect(() => {
    getJugador();
  }, []);

  const toMysqlLocal = (d = new Date()) => {
    const pad = n => String(n).padStart(2, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const h = pad(d.getHours());
    const min = pad(d.getMinutes());
    const s = pad(d.getSeconds());
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
  };

  const formatHMS = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // ⏱️ lógica cooldown 24h
  useEffect(() => {
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    
    const last = jugador?.ruleta_started_at
      ? new Date(jugador.ruleta_started_at).getTime()
      : 0;
    const now = Date.now();

    if (!last || now - last >= COOLDOWN_MS) {
      setTiradas(1);
      setRemainingMs(0);
    } else {
      setTiradas(0);
      const remaining = COOLDOWN_MS - (now - last);
      setRemainingMs(remaining);
      cooldownTimerRef.current = setTimeout(() => {
        setTiradas(1);
        setRemainingMs(0);
        cooldownTimerRef.current = null;
      }, remaining);
    }

    const onStorage = (e) => {
      if (e.key !== spinKey) return;
      const updated = Number(e.newValue || 0);
      const nnow = Date.now();
      if (!updated || nnow - updated >= COOLDOWN_MS) {
        setTiradas(1);
        setRemainingMs(0);
      } else {
        setTiradas(0);
        const rem = COOLDOWN_MS - (nnow - updated);
        setRemainingMs(rem);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [spinKey, jugador?.ruleta_started_at]);

  useEffect(() => {
    const tick = () => {      
      const last = jugador?.ruleta_started_at
        ? new Date(jugador.ruleta_started_at).getTime()
        : 0;
      const now = Date.now();
      const rem = Math.max(0, COOLDOWN_MS - (now - last));
      setRemainingMs(rem);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [spinKey, jugador?.ruleta_started_at]);

  const guardarPuntaje = async (jugador_id, puntosGanados) => {
    try {
      await axios.put(`http://localhost:3006/jugadores/update/${jugador_id}`, {
        puntosGanados, ruleta_started_at: jugador.ruleta_started_at // body de la request
      });
    } catch (err) {
      console.log('PUT /jugadores error:', err.response?.data?.error || err.message);
    }
  };

  //console.log(jugador);

  const lanzar = () => {
    if (tiradas === 0) return;
    setTiradas(0);
    //localStorage.setItem(spinKey, String(Date.now()));
    setRemainingMs(COOLDOWN_MS);
    setJugador(prev => prev ? { ...prev, ruleta_started_at: toMysqlLocal() } : prev);

    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = setTimeout(() => {
      setTiradas(1);
      setRemainingMs(0);
    }, COOLDOWN_MS);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    }

    barraRef.current?.classList.toggle('parate');
    const width2 = barraRef.current?.getBoundingClientRect().width;
    setAncho(width2);
    girar();
  };

  const girar = () => {
    const nuevaRotacion = 6 * (Math.floor(Math.random() * 210) + 340);
    setRotation(rotation + ancho + nuevaRotacion);
  };

  const final = () => {
    barraRef.current?.classList.toggle('parate');
    const grados = ((rotation % 360) + 360) % 360;

    if ((grados >= 0 && grados <= 29) || (grados >= 180 && grados <= 209)) {
      setPremio('Has ganado 400 puntos!');
      setPuntos(400);
      guardarPuntaje(jugador_id, 400);
    } else if ((grados >= 30 && grados <= 59) || (grados >= 210 && grados <= 239)) {
      setPremio('Has ganado 200 puntos!');
      setPuntos(200);
      guardarPuntaje(jugador_id, 200);
    } else if ((grados >= 60 && grados <= 89) || (grados >= 240 && grados <= 269)) {
      setPremio('Has ganado 100 puntos!');
      setPuntos(100);
      guardarPuntaje(jugador_id, 100);
    } else if ((grados >= 90 && grados <= 119) || (grados >= 270 && grados <= 299)) {
      setPremio('Has ganado 500 puntos!');
      setPuntos(500);
      guardarPuntaje(jugador_id, 500);
    } else if ((grados >= 120 && grados <= 149) || (grados >= 300 && grados <= 329)) {
      setPremio('Has ganado 300 puntos!');
      setPuntos(300);
      guardarPuntaje(jugador_id, 300);
    } else {
      setPremio('Has ganado 500 puntos!');
      setPuntos(500);
      guardarPuntaje(jugador_id, 500);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    if (puntos > 0 && tiradas === 0) {
      const timeout = setTimeout(() => {
        setPremio('');
      }, 5000); // 2 segundos

      return () => clearTimeout(timeout);
    }
  }, [puntos, tiradas]);

  return (
    <div className='flex flex-col items-center mt-5'>
      <div className='tiradas'>
        <img src='./assets/ticket.png' alt='ticket' />
        {tiradas === 1 ? (
          <p className='text-2xl text-white'>
            1 ticket disponible — <b>{formatHMS(0)}</b>
          </p>
        ) : (
          <p className='text-2xl text-white text-center'>
            0 tickets — vuelve en <b>{formatHMS(remainingMs)}</b>
          </p>
        )}
      </div>

      <div className='plafon'>
        <div className='central'>
          <img src='/assets/puntero.png' alt='puntero' />
        </div>

        <div
          className='ruleta'
          style={{
            backgroundImage: `url('/assets/ruleta.png')`,
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 3s cubic-bezier(0.2,0.8,0.7,0.99)',
          }}
          onTransitionEnd={final}
        ></div>

        <motion.div
          className='text-5xl font-bold text-center my-6'
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className='bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] animate-pulse'>
            {tiradas > 0 ? 'Haz click en girar!' : premio}
          </span>
        </motion.div>

        {tiradas > 0 && (
          <div className='barra1'>
            <div className='mi_barra' ref={barraRef}></div>
          </div>
        )}

        <motion.button
          type='button'
          className={`lanzar text-2xl font-semibold rounded-full px-10 py-3 mt-6 shadow-lg transition-all duration-300  cursor-pointer ${tiradas !== 0
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 hover:shadow-[0_0_15px_rgba(147,51,234,0.6)]'
            : 'bg-gray-500 cursor-not-allowed text-gray-300'
            }`}
          whileTap={tiradas !== 0 ? { scale: 0.9 } : {}}
          onClick={lanzar}
          disabled={tiradas === 0}
          title={tiradas === 0 ? `Vuelve en ${formatHMS(remainingMs)}` : ''}
        >
          🎡 Girar
        </motion.button>
      </div>

      <audio ref={audioRef} src='/sounds/giraLaRueda.mp3' preload='auto' />
    </div>
  );
}
