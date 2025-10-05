import "../assets/css/Ruleta.css";

import { useRef, useState } from "react";

import axios from "axios";

export default function Ruleta() {
    const barraRef = useRef(null);
    const [ancho, setAncho] = useState(1);
    const [tiradas, setTiradas] = useState(1);
    const [premio, setPremio] = useState("Haz click en girar");
    const [rotation, setRotation] = useState(0);
    const [puntos, setPuntos] = useState(0);

    // usuario logueado desde localStorage (parseado)
    const [user] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }

    });

    const userId = user?.id;

    const guardarPuntaje = async (userId, puntosGanados) => {
        try {
            await axios.put(`http://localhost:3006/api/jugadores/${userId}`, { puntaje: puntosGanados });
        } catch (err) {
            console.log("PUT /jugadores error:", err.response?.data?.error || err.message);
        }
    };

    const lanzar = () => {
        barraRef.current.classList.toggle('parate');
        const width2 = barraRef.current.getBoundingClientRect().width;
        setAncho(width2);
        girar();
    };

    const girar = () => {
        const nuevaRotacion = 2 * (Math.floor(Math.random() * 210) + 340);
        setRotation(rotation + ancho + nuevaRotacion);
        setTiradas(0);
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
                <p>: {tiradas} ticket restante.</p>
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
                {tiradas != 0
                    ? <button type="button" className="lanzar bg-sky-500 hover:bg-sky-600 cursor-pointer" onClick={lanzar}>Girar</button>
                    : <button type="button" className="lanzar bg-gray-400 cursor-not-allowed" onClick={lanzar} disabled>Girar</button>
                }


            </div>
        </div>
    );
}
