import "../assets/css/Ruleta.css";

import { useEffect, useRef, useState } from "react";

import axios from "axios";

export default function Ruleta() {
    const barraRef = useRef(null);
    const cooldownTimerRef = useRef(null);
    const [ancho, setAncho] = useState(1);
    const [tiradas, setTiradas] = useState(1);
    const [premio, setPremio] = useState("Haz click en girar");
    const [rotation, setRotation] = useState(0);
    const [puntos, setPuntos] = useState(0);
    const [remainingMs, setRemainingMs] = useState(0);

    // usuario logueado desde localStorage (parseado)
    const [user] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }

    });

    const userId = user?.id;

    // logica de 24 hs
    const COOLDOWN_MS = 24 * 60 * 60 * 1000;
    const spinKey = `roulette:lastSpin:${userId ?? "anonymous"}`;

    const formatHMS = (ms) => {
        const total = Math.max(0, Math.floor(ms / 1000));
        const h = String(Math.floor(total / 3600)).padStart(2, "0");
        const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
        const s = String(total % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    useEffect(() => {
        // limpiar un timeout previo
        if (cooldownTimerRef.current) {
            clearTimeout(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
        }

        const last = Number(localStorage.getItem(spinKey) || 0);
        const now = Date.now();

        if (!last || now - last >= COOLDOWN_MS) {
            setTiradas(1); // disponible
            setRemainingMs(0);
        } else {
            setTiradas(0); // en cooldown
            const remaining = COOLDOWN_MS - (now - last);
            setRemainingMs(remaining);
            cooldownTimerRef.current = setTimeout(() => {
                setTiradas(1);
                setRemainingMs(0);
                cooldownTimerRef.current = null;
            }, remaining);
        }

        // Sync entre pestañas/ventanas
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
                setRemainingMs(rem)
                // reprogramar timeout con el nuevo valor
                if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
                cooldownTimerRef.current = setTimeout(() => {
                    setTiradas(1);
                    setRemainingMs(0);
                    cooldownTimerRef.current = null;
                }, rem);
            }
        };
        window.addEventListener("storage", onStorage);

        return () => {
            window.removeEventListener("storage", onStorage);
            if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        };
    }, [spinKey]); // se recalcula si cambia el usuario

    // nuevo: “tick” cada 1s para refrescar el contador en pantalla
    useEffect(() => {
        const tick = () => {
            const last = Number(localStorage.getItem(spinKey) || 0);
            const now = Date.now();
            const rem = Math.max(0, COOLDOWN_MS - (now - last));
            setRemainingMs(rem);
        };
        tick(); // primer cálculo inmediato
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [spinKey]);


    const guardarPuntaje = async (userId, puntosGanados) => {
        try {
            await axios.put(`http://localhost:3006/api/jugadores/${userId}`, { puntaje: puntosGanados });
        } catch (err) {
            console.log("PUT /jugadores error:", err.response?.data?.error || err.message);
        }
    };

    const lanzar = () => {
        // si no hay tiradas, no hace nada
        if (tiradas === 0) return;

        // si hay tirada consume la entrada y arrancar cooldown
        setTiradas(0);
        localStorage.setItem(spinKey, String(Date.now()));
        setRemainingMs(COOLDOWN_MS);
        // (re)programar el re-enable por si la SPA queda abierta
        if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = setTimeout(() => {
            setTiradas(1);
            setRemainingMs(0);
            cooldownTimerRef.current = null;
        }, COOLDOWN_MS);

        barraRef.current.classList.toggle('parate');
        const width2 = barraRef.current.getBoundingClientRect().width;
        setAncho(width2);
        girar();
    };

    const girar = () => {
        const nuevaRotacion = 6 * (Math.floor(Math.random() * 210) + 340);
        setRotation(rotation + ancho + nuevaRotacion);
        //setTiradas(0);
    }

    const final = () => {
        barraRef.current.classList.toggle('parate');
        const grados = (rotation % 360 + 360) % 360;

        if (grados >= 0 && grados <= 29 || grados >= 180 && grados <= 209) {
            // 400
            setPremio("Has ganado 400 puntos!");
            setPuntos(400);
            guardarPuntaje(userId, 400);
        } else if (grados >= 30 && grados <= 59 || grados >= 210 && grados <= 239) {
            // 200
            setPremio("Has ganado 200 puntos!");
            setPuntos(200);
            guardarPuntaje(userId, 200);
        } else if (grados >= 60 && grados <= 89 || grados >= 240 && grados <= 269) {
            // 100
            setPremio("Has ganado 100 puntos!");
            setPuntos(100);
            guardarPuntaje(userId, 100);
        } else if (grados >= 90 && grados <= 119 || grados >= 270 && grados <= 299) {
            // 500
            setPremio("Has ganado 500 puntos!");
            setPuntos(500);
            guardarPuntaje(userId, 500);
        } else if (grados >= 120 && grados <= 149 || grados >= 300 && grados <= 329) {
            // 300
            setPremio("Has ganado 300 puntos!");
            setPuntos(300);
            guardarPuntaje(userId, 300);
        } else {
            if (grados >= 150 && grados <= 179 || grados >= 330 && grados <= 359) {
                // 500
                setPremio("Has ganado 500 puntos!");
                setPuntos(500);
                guardarPuntaje(userId, 500);
            }
        }
    }

    return (
        <div>

            <div className="tiradas">
                <img src="./assets/ticket.png" alt="ticket" />
                {tiradas === 1 ? (
                    <p>1 ticket disponible — <b>{formatHMS(0)}</b></p>
                ) : (
                    <p>0 tickets — vuelve en <b>{formatHMS(remainingMs)}</b></p>
                )}
            </div>

            {/* conteiner de ruleta */}
            <div className="plafon">

                {/* puntero de la ruleta */}
                <div className="central">
                    <img src="/assets/puntero.png" alt="puntero" />
                </div>

                {/* ruleta */}
                <div
                    className='ruleta'
                    style={{
                        backgroundImage: `url('/assets/ruleta.png')`,
                        transform: `rotate(${rotation}deg)`,
                        transition: 'transform 3s cubic-bezier(0.2,0.8,0.7,0.99)'
                    }}
                    onTransitionEnd={final}
                >
                </div>

                {/* mensaje de premio */}
                <div className="premio">{premio}</div>

                {/* barra de fuerza */}
                <div className="barra1">
                    <div className="mi_barra" ref={barraRef}></div>
                </div>

                {/* boton de girar ruleta */}
                {tiradas !== 0 ? (
                    <button
                        type="button"
                        className="lanzar bg-sky-500 hover:bg-sky-600 cursor-pointer"
                        onClick={lanzar}
                    >
                        Girar
                    </button>
                ) : (
                    <button
                        type="button"
                        className="lanzar bg-gray-400 cursor-not-allowed"
                        onClick={lanzar}
                        disabled
                        title={`Vuelve en ${formatHMS(remainingMs)}`}
                    >
                        Girar ({formatHMS(remainingMs)})
                    </button>
                )}


            </div>
        </div>
    );
}
