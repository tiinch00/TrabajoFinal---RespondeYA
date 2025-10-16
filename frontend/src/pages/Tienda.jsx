import { AnimatePresence, motion } from 'motion/react';
import { use, useEffect, useRef, useState } from 'react';

import axios from 'axios';

const Tienda = () => {
  const [selected, setSelected] = useState(null); // indice o null
  const [jugador, setJugador] = useState(null);
  const [avatares, setAvatares] = useState([]);
  const [jugadorAvatares, setJugadorAvatares] = useState([]);
  const [confirmar, setConfirmar] = useState(false);
  const [comprado, setComprado] = useState(false);
  const compradoTimerRef = useRef(null);

  // todo lo usado para agregar avatar a la tienda.
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalConfirmarEliminar, setModalConfirmarEliminar] = useState(false);
  const [alerta, setAlerta] = useState('');

  const [form, setForm] = useState({
    admin_id: 1,
    nombre: '',
    division: '',
    precio_puntos: '',
    activo: true,
    preview_url: '',
  });
  const handleChangeForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAgregarAvatar = async () => {
    try {
      const data = await axios.post(`http://localhost:3006/avatar/create`, form);
      if (data) {
        setForm({
          admin_id: 1,
          nombre: '',
          division: '',
          precio_puntos: '',
          activo: true,
          preview_url: '',
        });
        setMostrarModal(false);
        await infoAvatares();
      }
    } catch (error) {
      console.log(error);
      setAlerta({ error: 'No se pudo agregar el avatar.' });
    }
  };

  const handleEliminarAvatar = async (avatar_id) => {
    try {
      const data = await axios.delete(`http://localhost:3006/avatar/${avatar_id}/delete`);
      if (data) {
        setModalConfirmarEliminar(false);
        setSelected(null);
        await infoAvatares();
      }
    } catch (error) {
      console.log(error);
      setAlerta({ error: 'No se pudo eliminar el avatar.' });
    }
  };

  // obitne el usuario logueado desde localStorage (parseado)
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const jugador_id = user?.jugador_id;
  const administrador = user?.role;

  // // obtiene el objeto jugador
  const infoJugador = async () => {
    if (!jugador_id) {
      console.log('jugador_id vacío');
      setJugador(null);
      return;
    }
    try {
      const { data } = await axios.get(`http://localhost:3006/jugadores/${jugador_id}`);
      setJugador(data);
    } catch (error) {
      console.log('@@@@ Error GET /jugadores/:jugador_id\n', error);
    }
  };

  // obtiene todos los objetos avatares
  const infoAvatares = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3006/avatar`);
      setAvatares(data);
    } catch (error) {
      console.log('@@@@ Error GET /avatar\n', error);
    }
  };

  // obtiene los avatares que tiene el jugador comprado
  const infoJugadorIdAvatares = async () => {
    // prepara todos los atributos de la lista de avatares de un jugador
    const values = {
      jugador_id: jugador_id,
    };

    try {
      const { data } = await axios.get(`http://localhost:3006/userAvatar`, values);
      setJugadorAvatares(data);
      //console.log("GET: jugadorId_avatares (data):", data);
    } catch (error) {
      console.log('@@@@ Error GET /jugadorId_avatares\n', error);
    }
  };

  const formatDateTimeAR = (date = new Date()) => {
    // restar 3 horas
    const shifted = new Date(date.getTime() - 3 * 60 * 60 * 1000);

    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = fmt.formatToParts(shifted);
    const get = (t) => parts.find((p) => p.type === t)?.value;

    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get(
      'second'
    )}`;
  };

  // hace que el mensaje de compra desaparezca en 2 segundos
  const scheduleToastHide = () => {
    if (compradoTimerRef.current) clearTimeout(compradoTimerRef.current);
    compradoTimerRef.current = setTimeout(() => {
      setComprado(false);
      compradoTimerRef.current = null;
    }, 2000);
  };

  // funcion que crea un user_avatar para un usuario
  const handleSubmit = async (idAvatar) => {
    const nuevoSaldo = jugador.puntaje - avatares[selected].precio_puntos;

    // prepara todos los atributos del objeto user_avatar
    const values = {
      jugador_id: jugador.jugador_id,
      avatar_id: idAvatar,
      origen: 'compra',
      adquirido_at: formatDateTimeAR(),
    };

    //console.log("puntaje del jugador " + jugador.puntaje);
    //console.log("costo del avatar " + avatares[selected].precio_puntos);
    //console.log("puntaje del jugador actualizado " + values.puntaje);

    try {
      // compra un avatar y se guarda en user_avatares
      const { data: ua } = await axios.post('http://localhost:3006/userAvatar', values);

      // actualiza el puntaje
      const { data: jUpdated } = await axios.put(
        `http://localhost:3006/jugadores/update/${jugador_id}`,
        { puntaje: nuevoSaldo }
      );

      // actualiza el puntaje del jugador
      setJugador(jUpdated ?? { ...jugador, puntaje: nuevoSaldo });

      setJugadorAvatares((prev) => {
        // si el POST devuelve el objeto, usalo; si no, añadí uno mínimo
        const item = ua ?? { jugador_id, avatar_id: idAvatar };
        return prev.some((a) => a.avatar_id === idAvatar) ? prev : [...prev, item];
      });

      setConfirmar(false);
      setComprado(true);
      scheduleToastHide();
    } catch (error) {
      console.log('@@@@ Error Post /user_Avatar\n', error);
    }
  };

  // actualiza los valores cuando se produce un nuevo evento
  useEffect(() => {
    infoJugador();
    infoAvatares();
    infoJugadorIdAvatares();
  }, []);

  // Cerrar con ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelected(null);
        setConfirmar(false); // cierra el div de confirmacion
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const yaLoTiene =
    Array.isArray(jugadorAvatares) &&
    avatares[selected] &&
    jugadorAvatares.some((a) => a.avatar_id === avatares[selected].id);

  return (
    <div>
      <h1 className='text-6xl mb-6'>Tienda</h1>
      <hr className='border-1 border-sky-600' />

      {administrador && administrador === 'administrador' && (
        <div className='text-center mt-6'>
          <button
            onClick={() => setMostrarModal(true)}
            className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded cursor-pointer'
          >
            + Agregar nueva skin
          </button>
        </div>
      )}
      {mostrarModal && (
        <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center'>
          <div className='bg-indigo-900 p-6 rounded-2xl w-96 text'>
            <h2 className='text-2xl mb-4 text-center'>Agregar nueva Skin</h2>
            <label htmlFor='nombre'>
              <input
                type='text'
                name='nombre'
                placeholder='Nombre'
                value={form.nombre}
                onChange={handleChangeForm}
                className='w-full mb-2 p-2 rounded'
              />
            </label>
            <label htmlFor='division'>
              <input
                type='text'
                name='division'
                placeholder='División'
                value={form.division}
                onChange={handleChangeForm}
                className='w-full mb-2 p-2 rounded'
              />
            </label>
            <label htmlFor='precio_puntos'>
              <input
                type='number'
                name='precio_puntos'
                placeholder='Valor'
                value={form.precio_puntos}
                onChange={handleChangeForm}
                className='w-full mb-2 p-2 rounded'
              />
            </label>
            <label htmlFor='preview_url'>
              <input
                type='text'
                name='preview_url'
                placeholder='URL de imagen'
                value={form.preview_url}
                onChange={handleChangeForm}
                className='w-full mb-2 p-2 rounded'
              />
            </label>
            <div className='flex justify-between mt-4'>
              <button
                onClick={() => setMostrarModal(false)}
                className='px-3 py-2 bg-red-600 hover:bg-red-700 rounded cursor-pointer'
              >
                Cancelar
              </button>
              <button
                onClick={handleAgregarAvatar}
                className='px-3 py-2 bg-green-600 hover:bg-green-700 rounded cursor-pointer'
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='grid grid-cols-6 gap-4 p-12'>
        {avatares.map((avatar, index) => (
          <motion.img
            key={index}
            src={avatar.preview_url}
            alt={`Avatar ${index + 1}`}
            className='flex w-40 h-50 object-cover rounded-full p-4 cursor-pointer'
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 1.3 }}
            onClick={() => setSelected(index)}
          ></motion.img>
        ))}
      </div>

      {/* div overlay absoluto en toda la pantalla) */}
      {selected !== null && (
        <div
          className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm'
          onClick={() => setSelected(null)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()} // evita que el click burbujee al overlay
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      w-full max-w-8/12 h-fit rounded-2xl bg-indigo-900 text-white p-6 shadow-2xl'
          >
            {/* Boton X */}
            <button
              type='button'
              aria-label='Cerrar'
              className='absolute top-2 right-2 rounded-full w-9 h-9 grid place-items-center
                        hover:bg-black/5 active:scale-95 cursor-pointer'
              onClick={() => setSelected(null)}
            >
              ✕
            </button>

            {/* Imagen */}
            <img
              src={avatares[selected].preview_url}
              alt={`Avatar ${selected + 1}`}
              className='w-60 h-80 object-cover rounded-full mx-auto'
            />

            <hr className='my-8 border-1 border-sky-500' />

            {/* Nombre */}
            <div className='text-6xl text-center mt-6'>{avatares[selected].nombre}</div>

            {/* Division */}
            <div className='text-2xl text-center mt-4 mb-4'>{avatares[selected].division}</div>

            {/* Precio */}
            <div className='text-4xl text-center font-semibold'>
              Precio: {`$${avatares[selected].precio_puntos}`}
            </div>

            {/* boton de compra */}
            {jugador.puntaje >= avatares[selected].precio_puntos ? (
              <div className='text-center mt-4'>
                {confirmar ? (
                  <div>
                    <p className='text-4xl'>¿Estas seguro de comprar este avatar?</p>

                    <div className='flex justify-center gap-3 mt-6 text-xl'>
                      <button
                        className='cursor-pointer w-24 rounded bg-red-600 hover:bg-red-700'
                        onClick={() => {
                          setConfirmar(false);
                        }}
                      >
                        Cancelar
                      </button>

                      <button
                        className='cursor-pointer w-24 rounded bg-green-600 hover:bg-green-700'
                        onClick={() => handleSubmit(avatares[selected].id)}
                        disabled={selected == null || !avatares[selected]}
                      >
                        Aceptar
                      </button>
                    </div>
                  </div>
                ) : yaLoTiene ? (
                  <button
                    className='text-xl mt-3 px-4 py-2 rounded bg-gray-500 hover:bg-gray-600  text-white cursor-not-allowed'
                    disabled
                  >
                    Ya lo tienes
                  </button>
                ) : (
                  <button
                    className='text-xl mt-3 px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 cursor-pointer'
                    onClick={() => setConfirmar(true)}
                  >
                    Comprar
                  </button>
                )}
              </div>
            ) : (
              <div className='text-center mt-4'>
                <p>Fondos Insuficiente</p>
                <button className='mt-3 px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 cursor-not-allowed'>
                  Comprar
                </button>
              </div>
            )}

            {administrador && administrador === 'administrador' && (
              <div className='text-center mt-6'>
                <button
                  onClick={() => setModalConfirmarEliminar(true)}
                  className='px-4 py-2 bg-red-500 hover:bg-amber-700 text-white rounded cursor-pointer'
                >
                  Eliminar Skin
                  {console.log(avatares[selected].id)}
                </button>
              </div>
            )}
            {modalConfirmarEliminar && (
              <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-indigo-900 p-6 rounded-2xl w-96 '>
                  <p className='text-center'>Seguro desea eliminar el avatar?</p>
                  <div className='flex justify-between'>
                    <button
                      onClick={() => {
                        setModalConfirmarEliminar(false);
                        setSelected(null);
                      }}
                      className='px-4 py-2 bg-green-500 hover:bg-amber-700 text-white rounded cursor-pointer'
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleEliminarAvatar(avatares[selected].id)}
                      className='px-4 py-2 bg-red-500 hover:bg-amber-700 text-white rounded cursor-pointer'
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {comprado && (
                <motion.p
                  key='toast'
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
                  exit={{ opacity: 0, y: 8, transition: { duration: 0.8 } }} // salida lenta
                  className='fixed bottom-6 left-1/2 -translate-x-1/2
                            bg-green-600 text-white px-4 py-2 rounded shadow-lg z-[100]'
                >
                  Su avatar ha sido agregado a su lista de avatares
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      <hr className='my-12 border-1 border-sky-500' />
    </div>
  );
};

export default Tienda;
