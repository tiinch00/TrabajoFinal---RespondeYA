import { AnimatePresence, motion } from 'motion/react';
import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';

import axios from 'axios';
import { useAuth } from "../context/auth-context.jsx";

const Tienda = () => {
  const [selected, setSelected] = useState(null); // indice o null
  const [jugadores, setJugadores] = useState([]);
  const [jugador, setJugador] = useState([]);
  const [avatares, setAvatares] = useState([]);
  const [jugadorAvatares, setJugadorAvatares] = useState([]);
  const [confirmar, setConfirmar] = useState(false);
  const [comprado, setComprado] = useState(false);
  const compradoTimerRef = useRef(null);
  const { user, updateUser } = useAuth(); 

  const { t, i18n } = useTranslation();

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
  /*const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });*/

  const jugador_id = user?.jugador_id;
  const administrador = user?.role;

  // // obtiene el objeto jugador
  const infoallJugadores = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3006/jugadores`);
      setJugadores(data);
    } catch (error) {
      console.log('@@@@ Error GET /jugadores/:id\n', error);
    }
  };

  // // obtiene el objeto jugador
  const infoJugador = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3006/jugadores/${jugador_id}`);
      setJugador(data);
    } catch (error) {
      console.log('@@@@ Error GET /jugadores/:id\n', error);
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
    try {
      const { data } = await axios.get(
        `http://localhost:3006/userAvatar`,
        { params: { jugador_id } } // <-- params
      );
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
    const nuevoSaldo = avatares[selected].precio_puntos;

    // prepara todos los atributos del objeto user_avatar
    const values = {
      jugador_id: jugador.jugador_id,
      avatar_id: idAvatar,
      origen: 'compra',
      adquirido_at: formatDateTimeAR(),
    };
    try {
      // compra un avatar y se guarda en user_avatares
      const { data: ua } = await axios.post('http://localhost:3006/userAvatar', values);

      // actualiza el puntaje
      try {
        const { data: jUpdated } = await axios.put(
          `http://localhost:3006/jugadores/update/${jugador_id}`,
          { puntajeRestado: nuevoSaldo }
        );

        // actualiza el puntaje del jugador
        setJugador(jUpdated ?? { ...jugador, puntaje: nuevoSaldo });
        updateUser(jUpdated ?? {
          ...user,
          puntaje: nuevoSaldo,
        });
      } catch (err) {
        console.log('@@@@ Error PUT jugadores/update\n', err.response?.data?.error || err.message);
      }

      setJugadorAvatares((prev) => {
        // si el POST devuelve el objeto, usalo; si no, añadí uno mínimo
        const item = ua ?? { jugador_id, avatar_id: idAvatar };
        return prev.some((a) => a.avatar_id === idAvatar) ? prev : [...prev, item];
      });

      setConfirmar(false);
      setComprado(true);
      scheduleToastHide();
    } catch (err) {
      console.log('@@@@ Error Post /user_Avatar\n', err.response?.data?.error || err.message);
    }
  };

  const crearPago = async (avatarNombre) => {
    try {
      const avatarSeleccionado = avatares.find((a) => a.nombre === avatarNombre);

      if (!avatarSeleccionado) {
        console.error('Avatar no encontrado');
        return;
      }

      const imagenUrl = 'https://via.placeholder.com/200x200.png?text=Avatar';

      const values = {
        nombre: avatarSeleccionado.nombre,
        precio: 1000,
        imagen: imagenUrl,
      };

      const res = await axios.post('http://localhost:3006/api/crearOrden', values);
      if (res.data.id && res.data.init_point) {
        window.open(res.data.init_point, '_blank');
        setSelected(null);
      }
    } catch (error) {
      console.log('Error al crear pago:', error);
    }
  };

  // actualiza los valores cuando se produce un nuevo evento
  useEffect(() => {
    infoallJugadores();
    if (user.role !== 'administrador') {
      infoJugador();
    }
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
    <div className='min-h-full my-5 py-5 '>
      <motion.h1
        className='text-6xl font-extrabold text-center tracking-wider text-white neon-text'
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        ✨ {t('store')} ✨
      </motion.h1>

      <h2 className="text-white/80 text-3xl mt-8 mb-4 text-center">Puntos: {user.puntaje}</h2>

      {administrador && administrador === 'administrador' && (
        <div className='text-center mt-6'>
          <button
            onClick={() => setMostrarModal(true)}
            className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded cursor-pointer'
          >
            {t('addSkin')}
          </button>
        </div>
      )}
      {mostrarModal && (
        <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center'>
          <div className='bg-indigo-900 p-6 rounded-2xl w-96 text-white'>
            <h2 className='text-2xl mb-4 text-center'>{t('addSkin2')}</h2>
            <label htmlFor='nombre'>
              <input
                type='text'
                name='nombre'
                placeholder={t('formName')}
                value={form.nombre}
                onChange={handleChangeForm}
                className='w-full mb-2 p-2 rounded'
              />
            </label>
            <label htmlFor='division'>
              <input
                type='text'
                name='division'
                placeholder={t('formDivition')}
                value={form.division}
                onChange={handleChangeForm}
                className='w-full mb-2 p-2 rounded'
              />
            </label>
            <label htmlFor='precio_puntos'>
              <input
                type='number'
                name='precio_puntos'
                placeholder={t('formValue')}
                value={form.precio_puntos}
                onChange={handleChangeForm}
                className='w-full mb-2 p-2 rounded'
              />
            </label>
            <label htmlFor='preview_url'>
              <input
                type='text'
                name='preview_url'
                placeholder={t('formUrl')}
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
                {t('cancel')}
              </button>
              <button
                onClick={handleAgregarAvatar}
                className='px-3 py-2 bg-green-600 hover:bg-green-700 rounded cursor-pointer'
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='grid grid-cols-6 gap-4 py-10'>
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
            className='absolute left-1/2 top-125 -translate-x-1/2 -translate-y-1/2
                      w-150 max-w-8/12 h-195 rounded-2xl bg-indigo-900 text-white p-6 shadow-2xl'
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

            <hr className='my-7 border-1 border-sky-500' />

            {/* Nombre */}
            <div className='text-6xl text-center mt-6'>{avatares[selected].nombre}</div>

            {/* Division */}
            <div className='text-2xl text-center mt-4 mb-4'>{avatares[selected].division}</div>

            <div className='text-center mt-4'>
              <p className='text-3xl font-bold text-yellow-400'>
                {avatares[selected].precio_puntos} {t('points')}
              </p>
              <p className='text-lg text-gray-400'>o</p>
              <p className='text-2xl font-semibold text-green-400'>$1000 ARS {t('mp')} </p>
            </div>

            {/* boton de compra */}
            {administrador === 'administrador' ? (
              // 💼 Modo Administrador → solo mostrar eliminar
              <div className='text-center mt-6'>
                <button
                  onClick={() => setModalConfirmarEliminar(true)}
                  className='px-4 py-2 bg-red-500 hover:bg-amber-700 text-white rounded cursor-pointer'
                >
                  {t('deleteSkin')}
                </button>
              </div>
            ) : (
              // 👤 Modo Jugador → todo el flujo normal de compra
              <>
                {/* Botón de compra con puntos o estado actual */}
                {yaLoTiene ? (
                  <div className='flex-col items-center justify-center text-center mt-5'>
                    <button
                      className='text-xl mt-3 px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white cursor-not-allowed'
                      disabled
                    >
                      {t('gotThis')}
                    </button>
                  </div>
                ) : jugador.puntaje >= avatares[selected].precio_puntos ? (
                  confirmar ? (
                    <div className='mt-2'>
                      <p className='text-4xl text-center'>¿Estás seguro de comprar este avatar?</p>
                      <div className='flex justify-center gap-5 my-5 text-xl'>
                        <button
                          className='cursor-pointer w-24 rounded bg-red-600 hover:bg-red-700'
                          onClick={() => setConfirmar(false)}
                        >
                          {t('cancel')}
                        </button>

                        <button
                          className='cursor-pointer w-24 rounded bg-green-600 hover:bg-green-700'
                          onClick={() => handleSubmit(avatares[selected].id)}
                          disabled={selected == null || !avatares[selected]}
                        >
                          {t('acepted')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className='flex-col items-center justify-center text-center'>
                      <button
                        className='text-xl mt-3 px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 cursor-pointer mr-2'
                        onClick={() => setConfirmar(true)}
                      >
                        {t('buyWPoints')}
                      </button>
                    </div>
                  )
                ) : (
                  <div className='flex-col items-center justify-center text-center'>
                    <button
                      className='mt-3 px-2 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 cursor-not-allowed'
                      disabled
                    >
                      {t('buyWPoints')}
                    </button>
                    <p className='text-red-700'>{t('noMoney')}</p>
                  </div>
                )}

                {/* Botón de Mercado Pago */}
                <div className='flex items-center justify-center'>
                  <button
                    onClick={() => crearPago(avatares[selected].nombre)}
                    className={`text-xl mt-3 px-2 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer ${
                      yaLoTiene || confirmar ? 'hidden' : ''
                    }`}
                  >
                    {t('buyWMP')}
                  </button>
                </div>
              </>
            )}
            {modalConfirmarEliminar && (
              <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-indigo-900 p-6 rounded-2xl w-96 '>
                  <p className='text-center'>{t('avatarDeleteSure')}</p>
                  <div className='flex justify-between'>
                    <button
                      onClick={() => {
                        setModalConfirmarEliminar(false);
                        setSelected(null);
                      }}
                      className='px-4 py-2 bg-green-500 hover:bg-amber-700 text-white rounded cursor-pointer'
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={() => handleEliminarAvatar(avatares[selected].id)}
                      className='px-4 py-2 bg-red-500 hover:bg-amber-700 text-white rounded cursor-pointer'
                    >
                      {t('acepted')}
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
                  {t('avatarADDED')}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Tienda;
