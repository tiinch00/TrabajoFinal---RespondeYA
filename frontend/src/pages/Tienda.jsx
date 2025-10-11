import { useEffect, useState } from 'react'

import axios from "axios";
import { motion } from "motion/react";

const Tienda = () => {

  const numAvatares = 14;
  const [selected, setSelected] = useState(null); // indice o null 
  const [jugador, setJugador] = useState(null);
  const [avatares, setAvatares] = useState([]);
  const [confirmar, setConfirmar] = useState(false);

  // 1) usuario logueado desde localStorage (parseado)
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }

  });
  //const userId = user?.id;
  const jugador_id = user?.jugador_id;

  const infoJugador = async () => {
    if (!jugador_id) {
      console.log("jugador_id vacío");
      setJugador(null);
      return;
    }
    try {
      const { data } = await axios.get(`http://localhost:3006/jugadores/${jugador_id}`);
      setJugador(data);
      //console.log("jugador (data):", data);        
    } catch (error) {
      console.log("@@@@ Error GET /jugadores/:jugador_id\n", error);
    }
  };

  const infoAvatares = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3006/avatar`);
      setAvatares(data);
      //console.log("avatares (data):", data);
    } catch (error) {
      console.log("@@@@ Error GET /avatar\n", error);
    }
  };

  const pad = (n) => {
    return String(n).padStart(2, "0");
  };

  const formatDateTimeLocal = () => {
    const date = new Date();
    //date.toLocaleString("sv-SE").replace("T", " ");
    const parts = new Intl.DateTimeFormat("en-CA", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires"
    }).formatToParts(date);

    const get = (t) => parts.find(x => x.type === t)?.value;
    return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
  };

  const handleSubmit = async (idAvatar) => {
    const date = new Date();

    const values = {
      jugador_id: jugador.jugador_id,
      avatar_id: idAvatar,
      origen: "compra",
      adquirido_at: formatDateTimeLocal()
    };

    try {
      const response = await axios.post('http://localhost:3006/userAvatar', values);
    } catch (error) {
      console.log("@@@@ Error Post /user_Avatar\n", error);
    }

  };

  useEffect(() => {
    infoJugador();
    infoAvatares();
  }, []);

  // si querés ver el estado cuando realmente cambie:
  // useEffect(() => {
  //   console.log("jugador:", jugador);
  //   console.log("confirmar compra:", confirmar);
  // }, [jugador, confirmar]);


  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div>
      <h1 className='text-6xl mb-6'>Tienda</h1>
      <hr className='border-1 border-sky-600' />

      <div className="grid grid-cols-6 gap-4 p-12">
        {
          avatares.map((avatar, index) => (
            <motion.img
              key={index}
              src={avatar.preview_url}
              alt={`Avatar ${index + 1}`}
              className="flex w-40 h-50 object-cover rounded-full p-4 cursor-pointer"
              whileHover={{ scale: 1.5 }}
              whileTap={{ scale: 1.3 }}
              onClick={() => setSelected(index)}
            ></motion.img>
          ))
        }
      </div>

      {/* div overlay absoluto en toda la pantalla) */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelected(null)} // click fuera cierra
        >
          <motion.div
            onClick={(e) => e.stopPropagation()} // evita que el click burbujee al overlay
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      w-full max-w-8/12 h-fit rounded-2xl bg-indigo-900 text-white p-6 shadow-2xl"
          >
            {/* Boton X */}
            <button
              type="button"
              aria-label="Cerrar"
              className="absolute top-2 right-2 rounded-full w-9 h-9 grid place-items-center
                        hover:bg-black/5 active:scale-95 cursor-pointer"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>

            <img
              // src={`/assets/avatares/avatar${selected + 1}.png`}
              src={avatares[selected].preview_url}
              alt={`Avatar ${selected + 1}`}
              className="w-60 h-80 object-cover rounded-full mx-auto"
            />

            <hr className="my-8 border-1 border-sky-500" />

            <div className='text-6xl text-center mt-6'>
              {avatares[selected].nombre}
            </div>

            <div className='text-2xl text-center mt-4 mb-4'>
              {avatares[selected].division}
            </div>

            <div className="mt-4 text-center">

              <div className="text-4xl font-semibold mb-6">
                Precio: ${avatares[selected].precio_puntos}
              </div>

              {/* boton de compra */}
              {jugador.puntaje >= avatares[selected].precio_puntos ?
                (
                  <div>
                    <button className="text-xl mt-3 px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 cursor-pointer"
                      onClick={() => { setConfirmar(true) }}
                    >
                      Comprar
                    </button>

                    {confirmar && (
                      <div className='mt-6 p-4'>
                        <p className='text-4xl'>¿Estas seguro de comprar este avatar?</p>
                        <div className='flex justify-center gap-3 mt-6 text-xl'>

                          <button
                            className="cursor-pointer w-24 rounded bg-green-600 hover:bg-green-700"
                            onClick={() => handleSubmit(avatares[selected].id)}
                            disabled={selected == null || !avatares[selected]}
                          >
                            Aceptar
                          </button>

                          <button className='cursor-pointer w-24 rounded bg-red-600 hover:bg-red-700' onClick={() => { setConfirmar(false) }}>Cancelar</button>

                        </div>
                      </div>
                    )}

                  </div>

                ) : (
                  <div>
                    <p>Fondos Insuficiente</p>
                    <button className="mt-3 px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500 cursor-not-allowed">
                      Comprar
                    </button>
                  </div>
                )
              }

            </div>
          </motion.div>
        </div>
      )}

      <hr className="my-12 border-1 border-sky-500" />
    </div >
  )
}

export default Tienda