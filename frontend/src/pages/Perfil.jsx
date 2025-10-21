import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from 'react';

import axios from "axios";

const Perfil = () => {

  // 1) usuario logueado desde localStorage (parseado)
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }

  });
  const userId = user?.id;
  const jugador_id = user?.jugador_id;

  // botones hooks
  const [selectedPerfil, setSelectedPerfil] = useState(false); // boton de perfil 👤
  const [selectedPefilEditar, setSelectedPefilEditar] = useState(false); // abrir el modal del boton "editar" foto de perfil
  const [selectedAvatar, setSelectedAvatar] = useState(false); // boton mis avatares

  // no lo uso aun=======================================
  // aun no se usa (para cambiar la foto del avatar del perfil)
  const [avatarIdSeleccionado, setAvatarIdSeleccionado] = useState(null); // cuando elige un avatar dentro del listado
  // =======================================================

  const [partidaIdSeleccionada, setPartidaIdSeleccionada] = useState(null);

  const [editMode, setEditMode] = useState(false); // boton editar datos de perfil
  const [saving, setSaving] = useState(false); // boton de guardar los datos de formulario de editar perfil
  const [selectedEstadisticas, setSelectedEstadisticas] = useState(null); // boton estadisticas
  const [eliminado, setEliminado] = useState(false); // boton de eliminar amigo
  const eliminadoTimerRef = useRef(null); // tiempo del msg de eliminar amigo

  // array hook
  const [avatares, setAvatares] = useState([]); // array avatares
  const [jugadorAvatares, setJugadorAvatares] = useState([]); // array userAvatar  
  const [amigos, setAmigos] = useState([]); // array amigos
  const [perfil, setPerfil] = useState([]); // array del perfil del jugador

  const [categorias, setCategorias] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [partida_preguntas, setPartida_preguntas] = useState([]);
  const [respuestas, setRespuestas] = useState([]);

  const [estadisticas, setEstadisticas] = useState([]); // array estadisticas

  // errores o inicializaciones
  const [error, setError] = useState(null); // mensaje de error en general
  const [loadingPerfil, setLoadingPerfil] = useState(true); // verifica si el perfil esta y carga la pagina
  const [form, setForm] = useState({ name: "", email: "", password: "" }); // hook de inicializacion del formulario
  const [formErrors, setFormErrors] = useState({}); // error del formulario

  // Carga el perfil y verifica el usuario
  useEffect(() => {
    if (!userId) { setLoadingPerfil(false); return; }
    let alive = true;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:3006/users/${userId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        //console.log(data);
        if (!alive) return;
        setPerfil(data);
        setForm({ name: data.name || "", email: data.email || "", password: "" });
      } catch (err) {
        if (!alive) return;
        setError(err.response?.data?.error || err.message);
      } finally {
        if (alive) setLoadingPerfil(false);
      }
    })();

    return () => { alive = false; };
  }, [userId]);

  // funcion que hace reemplazar los datos del jugador
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // valida el formulario de editar los datos del jugador
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "El nombre es obligatorio";
    if (!form.email.trim()) errs.email = "El email es obligatorio";
    else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(form.email.trim())) errs.email = "Email inválido";
    }
    // password es opcional; si lo completan, debe tener min 6
    if (form.password && form.password.trim().length < 6) {
      errs.password = "La contraseña debe tener al menos 6 caracteres";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // funcion que guarda y hace llamar 
  // la funcion de validar los datos del formulario para guardar los datos del jugador
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate() || !perfil) return;
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      // armamos payload: no enviamos password si está vacío
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
      };
      if (form.password.trim()) payload.password = form.password.trim();

      //console.log(payload);

      const { data } = await axios.put(
        `http://localhost:3006/users/${perfil.id}`,
        payload,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      // data = user actualizado (idealmente sin password)
      setPerfil(data);
      setEditMode(false);
      setForm(f => ({ ...f, password: "" }));

      // actualizamos localStorage para que el Header refleje el cambio
      const storedUser = {
        ...(JSON.parse(localStorage.getItem("user") || "{}")),
        id: data.id,
        name: data.name,
        email: data.email,
      };
      localStorage.setItem("user", JSON.stringify(storedUser));

    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  // obtiene todos los objetos avatares
  const infoAvatares = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3006/avatar`);
      setAvatares(data);
      //console.log("avatares (data):", data);
    } catch (error) {
      console.log("@@@@ Error GET /avatar\n", error);
    }
  };

  // obtiene los avatares que tiene el jugador comprado user_avatares 
  // pero no hay url de las fotos
  const infoJugadorIdAvatares = async () => {

    try {
      const { data } = await axios.get(
        "http://localhost:3006/userAvatar",
        { params: { jugador_id } }   // <-- params
      );
      setJugadorAvatares(data);
      //console.log("GET: jugadorId_avatares (data):", data);
    } catch (error) {
      console.log("@@@@ Error GET /jugadorId_avatares\n", error);
    }
  }

  // Une el array jugadorAvatares (avatar_id) con el array avatares (id)
  // Usa el jugador_id del contexto (ya lo tenés como const jugador_id = user?.jugador_id)
  const inventarioAvataresDos = () => {
    if (!Array.isArray(avatares) || !Array.isArray(jugadorAvatares)) return [];

    const jid = Number(jugador_id);
    if (!Number.isFinite(jid)) {
      console.warn("jugador_id inválido:", jugador_id);
      return [];
    }

    // 1) quedate solo con los registros del jugador actual
    const jAsDelJugador = jugadorAvatares.filter(ja => Number(ja.jugador_id) === jid);

    // 2) armá el set de avatar_id (normalizado a número)
    const idsDelJugador = new Set(jAsDelJugador.map(ja => Number(ja.avatar_id)));

    // 3) filtrá avatares por ese set (normalizando id)
    const out = avatares.filter(avatar => idsDelJugador.has(Number(avatar.id)));

    // debug útil
    console.log("inventarioAvataresDos →", { jid, idsDelJugador: [...idsDelJugador], out });

    return out;
  };

  // obtiene todos los amigos del jugador_id
  const getAmigos = async () => {

    try {
      const { data } = await axios.get(
        "http://localhost:3006/amigos",
        { params: { jugador_id } }   // <-- params
      );
      setAmigos(data);
    } catch (error) {
      console.log("@@@@ Error GET: amigos\n", error);
    }
  };

  const eliminarAmigo = async (id) => {
    try {
      // Idealmente debería ser DELETE, pero uso tu endpoint tal cual:
      const { data } = await axios.delete(`http://localhost:3006/amigos/eliminar/${id}`);

      // actualiza el nuevo array de amigos
      setAmigos(prev => prev.filter(a => a.id !== id));
      setEliminado(true);

      if (eliminadoTimerRef.current) clearTimeout(eliminadoTimerRef.current);
      eliminadoTimerRef.current = setTimeout(() => {
        setEliminado(false);
        eliminadoTimerRef.current = null;
      }, 2000);

    } catch (err) {
      console.error("Error al eliminar un amigo:", err);
    }
  };

  // obtiene un objeto categoria
  const getCategorias = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3006/categorias`);
      setCategorias(data);
    } catch (error) {
      console.log("@@@@ Error GET: categorias\n", error);
    }
  };

  // obtiene un objeto pregunta
  const getPreguntas = async (id) => {
    try {
      // /${id}
      const { data } = await axios.get(`http://localhost:3006/preguntas`);
      setPreguntas(data);
    } catch (error) {
      console.log("@@@@ Error GET: preguntas\n", error);
    }
  };

  // obtiene un objeto opcion
  const getOpciones = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3006/opciones`);
      setOpciones(data);
    } catch (error) {
      console.log("@@@@ Error GET: opciones\n", error);
    }
  };

  // obtiene un objeto partida
  const getPartdias = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3006/partidas`);
      setPartidas(data);
    } catch (error) {
      console.log("@@@@ Error GET: partidas\n", error);
    }
  };

  // obtiene un objeto partida_pregunta
  const getPartidaPreguntas = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3006/partida_preguntas`);
      setPartida_preguntas(data);
    } catch (error) {
      console.log("@@@@ Error GET: partida_preguntas\n", error);
    }
  };

  // obtiene un objeto respuesta
  const getRespuestas = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3006/respuestas`);
      setRespuestas(data);
    } catch (error) {
      console.log("@@@@ Error GET: respuestas\n", error);
    }
  };

  // obtiene un array de todas las estadisticas del jugador
  const getEstadisticas = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3006/estadisticas/",
        { params: { jugador_id } }   // <-- params
      );
      setEstadisticas(data);
    } catch (error) {
      console.log("@@@@ Error GET: estadisticas\n", error);
    }
  };

  // Une el array jugadorAvatares (avatar_id) con el array avatares (id)
  const inventarioIdPartidaSeleccionado = () => {

    // id de partida seleccionada
    const idPartida = partidaIdSeleccionada;
    let arreglo = [];

    // modificar aca......................
    if (Array.isArray(avatares) && Array.isArray(jugadorAvatares)) {

      // armamos un set con los avatar_id del jugador
      const idsDelJugador = new Set(jugadorAvatares.map(ja => ja.avatar_id));

      // filtramos avatares cuyo id esté en ese set
      const outArreglo = avatares.filter(avatar => idsDelJugador.has(avatar.id));

      arreglo = outArreglo;
      // console.log(outArreglo);
    }
    return arreglo;
  };

  // funcion de buscador entre estadisticas y amigos - (tengo que hacer 2 diferetes o uno para ambas)
  const handleSearch = () => {
    console.log("Buscar…");
  };

  useEffect(() => {
    getAmigos();
    getEstadisticas();
    infoJugadorIdAvatares();
    infoAvatares();
    getCategorias();
    getPreguntas();
    getOpciones();
    getPartdias();
    getPartidaPreguntas();
    getRespuestas();
  }, []);

  // hace desaparecer el scroll
  useEffect(() => {
    if (selectedPerfil) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [selectedPerfil]);

  // verifica datos para correr perfil o envia mensaje de errores visual en la interfaz
  if (!userId) return <p>No hay usuario en sesión.</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (loadingPerfil) return <p>Cargando perfil…</p>;
  if (!perfil) return <p>No se pudo cargar el perfil.</p>;

  /* 
    getCategorias();
    getPreguntas();
    getOpciones();
    getPartdias();
    getPartidaPreguntas();
    getRespuestas();
  

    console.log("\ncategorias");
    console.log(categorias);
    console.log("\npreguntas");
    console.log(preguntas);
    console.log("\nopciones");
    console.log(opciones);
    console.log("\npartidas");
    console.log(partidas);
    console.log("\npartida_preguntas");
    console.log(partida_preguntas);
    console.log("\nrespuestas");
    console.log(respuestas);
    */

  //console.log(partidaIdSeleccionada);

  return (
    <div className="w-[70%] mb-6">

      {/* perfil */}
      <div className="flex flex-col items-center h-fit w-full">
        <motion.div
          className="h-32 w-32 bg-gray-200/80 rounded-full cursor-pointer  text-black text-6xl text-center flex items-center justify-center"
          whileTap={{ scale: 1.2 }}
          onClick={() =>
            setSelectedPerfil(true)
          }
          role="button"
          aria-pressed={selectedPerfil}
        >
          <p>👤</p>
        </motion.div>

        {/* agranda la foto de perfil - poder editar */}
        {selectedPerfil && (

          <motion.div
            onClick={(e) => {
              e.stopPropagation();
            }}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 z-40 
              bg-black/5 backdrop-blur-sm 
                flex items-center justify-center"
          >
            <button
              type="button"
              aria-label="Cerrar"
              className="absolute top-2 right-2 rounded-full w-9 h-9 
                              grid place-items-center hover:bg-black/5 active:scale-95 
                              cursor-pointer text-2xl"
              onClick={() =>
                setSelectedPerfil(false)
              }
            >
              ✕
            </button>

            <div className="relative inline-block">
              <div className="rounded-full w-72 h-72 bg-white/60">
                <p className="text-[190px] text-center">👤</p>
              </div>

              {selectedPefilEditar ? (
                <div className="absolute left-14 top-56 
                      bg-white text-black rounded-2xl px-3 py-3">

                  <button
                    type="button"
                    aria-label="Cerrar"
                    className="text-end rounded-full w-full h-fit hover:text-red/5 cursor-pointer text-md text-red-500"
                    onClick={() =>
                      setSelectedPefilEditar(false)
                    }
                  >
                    ✕
                  </button>

                  <ul>
                    <li className="indent-1 cursor-pointer hover:text-gray-600">Elegir de la biblioteca </li>
                    <li className="indent-1 mt-2 cursor-pointer hover:text-gray-600">Elegir un avatar</li>
                    <li className="indent-1 mt-2 cursor-pointer hover:text-red-700 text-red-500">Eliminar foto</li>
                  </ul>
                </div>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className="absolute left-52 top-60 -translate-y-1/2 ml-4
                                rounded-full px-2 py-2 bg-black text-white 
                                cursor-pointer text-sm"
                  aria-pressed={selectedPefilEditar}
                  onClick={() =>
                    setSelectedPefilEditar(true)
                  }
                >
                  Editar
                </motion.button>
              )}
            </div>

          </motion.div>

        )}
        <p className="mt-2 text-4xl">{perfil.name}</p>
      </div>

      {/* ====================================================================================== */}

      {/* boton "mis avatares" */}
      <div className="flex flex-col items-center mt-6 h-fit w-full">
        <motion.button
          className="bg-violet-500 rounded-xl w-32 h-8 mb-4 cursor-pointer"
          whileTap={{ scale: 1.2 }}
          onClick={() => {
            setSelectedAvatar(true);
          }}
          type="button"
        //aria-pressed={selectedAvatar}
        >
          Mis Avatares
        </motion.button>

        {/* lista de avatares del jugador */}
        {inventarioAvataresDos().length === 0 && selectedAvatar ? (
          <div>
            <div
              className="fixed h-full inset-0 z-50 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()} // evita que el click burbujee al overlay
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      w-full max-w-8/12 h-fit rounded-2xl bg-indigo-900 text-white p-6 shadow-2xl"
              >
                <button
                  type="button"
                  aria-label="Cerrar"
                  className="absolute top-2 right-2 rounded-full w-9 h-9 
                              grid place-items-center hover:bg-black/5 active:scale-95 
                              cursor-pointer text-2xl"
                  onClick={() => {
                    setSelectedAvatar(false);
                  }}
                >
                  ✕
                </button>
                <h2 className="w-48 p-2">Lista de mis avatares</h2>

                <hr />

                <p className="mt-3 text-center">No tienes avatares en la lista...</p>
              </motion.div>
            </div>
          </div>
        ) : (
          <div>

            {selectedAvatar && (
              <div
                className="fixed h-full inset-0 z-50 bg-black/50 backdrop-blur-sm"
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()} // evita que el click burbujee al overlay
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      w-full max-w-8/12 h-fit rounded-2xl bg-indigo-900 text-white p-6 shadow-2xl"
                >
                  <button
                    type="button"
                    aria-label="Cerrar"
                    className="absolute top-2 right-2 rounded-full w-9 h-9 
                              grid place-items-center hover:bg-black/5 active:scale-95 
                              cursor-pointer text-2xl"
                    onClick={() => setSelectedAvatar(false)}
                  >
                    ✕
                  </button>

                  <div>

                    <h2 className="w-48 p-2">Lista de mis avatares</h2>

                    <hr />

                    <ul className="flex flex-row gap-3 mt-4 w-full max-w-md">
                      {inventarioAvataresDos().map((item) => (
                        <motion.li
                          key={`${item.id}`}
                          className="border rounded-xl p-3 bg-white/10 hover:bg-white/20 cursor-pointer"
                          whileTap={{ scale: 1.02 }}
                          onClick={() => {
                            setAvatarIdSeleccionado(item.id);
                          }}
                        >
                          <div>
                            <img
                              src={item.preview_url}
                              alt={`Imagen del avatar ${item.nombre}`}
                              className="flex w-40 h-50 object-cover rounded-full p-4"
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-center">{item.nombre}</span>
                          </div>
                        </motion.li>
                      ))}
                    </ul>

                  </div>

                </motion.div>
              </div>

            )}

          </div>

        )}
      </div>

      {/* ====================================================================================== */}

      {/* Mi Perfil */}
      <div className="mt-4 space-y-4">
        <h2 className="text-xl font-semibold">Datos personales</h2>
        {!editMode ? (
          <div className="space-y-2 bg-white/10 p-4 text-xl rounded-xl">
            <p><b>Nombre:</b> {perfil.name}</p>
            <p><b>Email:</b> {perfil.email}</p>
            <p><b>Contraseña:</b> ••••••</p>
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              onClick={() => {
                setEditMode(true);
                setForm({ name: perfil.name || "", email: perfil.email || "", password: "" });
                setFormErrors({});
              }}
            >
              Editar Datos de Perfil
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3 bg-white/10 p-4 rounded-xl">
            <div>
              <label className="block text-sm mb-1">Nombre</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded text-black bg-white/90 hover:bg-white"
                placeholder="Tu nombre"
              />
              {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded text-black bg-white/90 hover:bg-white"
                placeholder="tu@email.com"
              />
              {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded text-black bg-white/90 hover:bg-white"
                placeholder="Nueva contraseña"
              />
              {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => { setEditMode(false); setFormErrors({}); setForm(f => ({ ...f, password: "" })); }}
                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ====================================================================================== */}

      {/* Estadísticas */}
      <div className="flex flex-row gap-2 mt-4">
        <h2 className="text-xl font-semibold mb-3 mt-3 cursor-pointer hover:text-white/90">Resultados de partidas</h2>
        <h2 className="text-xl flex items-center justify-center">|</h2>
        <h2 className="text-xl font-semibold mb-3 mt-3 cursor-pointer hover:text-white/90">Estadísticas general</h2>
      </div>

      {/* buscador de estadísticas */}
      <div className="relative inline-block mb-4">
        <input
          className="bg-white/95 w-96 indent-2 border rounded-xl px-1 py-2 text-black placeholder-black/70 hover:bg-white"
          placeholder="Buscar una partida…"
        />

        <button
          type="button"
          onClick={handleSearch}
          className="absolute h-full w-fit top-0 right-0 flex items-center rounded-r-xl 
          bg-slate-800 px-2 border border-transparent text-sm 
          transition-all 
          shadow-sm hover:shadow focus:bg-slate-700 active:bg-slate-700 
          disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd" clipRule="evenodd"
              d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
            />
          </svg>
        </button>
      </div>

      {estadisticas.length === 0 ? (
        <p>No hay estadísticas de partidas para mostrar.</p>
      ) : (
        <ul className="">
          {estadisticas.map((e, index) => (
            <motion.li
              key={e.id}
              className="border rounded-xl p-4 bg-white/10 hover:bg-white/20 
                flex space-x-4 mb-2 cursor-pointer"
              whileTap={{ scale: 1.05 }}
              onClick={() => {
                setSelectedEstadisticas(index);
                setPartidaIdSeleccionada(e.partida_id)
              }}
            >
              {e.posicion > 0 ? (
                <div>
                  <p className="text-green-500">Ganaste!</p>
                  <p>Fecha: </p>
                </div>
              ) : (
                <div>
                  <p className="text-red-500">Perdiste!</p>
                  <p>Fecha: </p>
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      )}

      {/* div overlay absoluto en toda la pantalla) */}
      {selectedEstadisticas !== null && (
        <div
          className="fixed h-full inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedEstadisticas(null)}
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
                        hover:bg-black/5 active:scale-95 cursor-pointer text-2xl"
              onClick={() => setSelectedEstadisticas(null)}
            >
              ✕
            </button>

            {/* Informacion detallada */}
            <div className="text-2xl">

              <div className="flex flex-row gap-2 mb-2 w-fit">
                <button type="button" className="bg-black/80 rounded w-48 p-2 cursor-pointer hover:text-white/90">Resumen</button>
                <div className="flex items-center justify-center">|</div>
                <button type="button" className="rounded w-48 p-2 cursor-pointer hover:text-white/90">Respuestas</button>
                <div className="flex items-center justify-center">|</div>
                <button type="button" className="p-2 cursor-pointer hover:text-white/90">Estadísticas de respuestas</button>
              </div>

              <div className="bg-indigo-800/90 p-1.5 mt-1">
                {estadisticas[selectedEstadisticas].posicion > 0 ? (
                  <p className="p-1"><strong>Posición:</strong> Ganador</p>
                ) : (
                  <p className="p-1"><strong>Posición:</strong> Perdedor</p>
                )}
                <p className="p-1"><strong>Categoría:</strong> ...</p>
                <p className="p-1"><strong>Dificultad:</strong> ...</p>
                <p className="p-1"><strong>Puntaje total:</strong> {estadisticas[selectedEstadisticas].puntaje_total}</p>
                <p className="p-1"><strong>Respuestas correctas:</strong> {estadisticas[selectedEstadisticas].total_correctas}</p>
                <p className="p-1"><strong>Respuestas incorrectas:</strong> {estadisticas[selectedEstadisticas].total_incorrectas}</p>
                <p className="p-1"><strong>Tiempo de partida:</strong> {estadisticas[selectedEstadisticas].tiempo_total_ms} milisegundos</p>
              </div>

            </div>


          </motion.div>
        </div>
      )}

      {/* ====================================================================================== */}

      {/* Mis amigos */}
      <div className="mb-6 mt-8 bg-white/10 rounded-xl p-1">
        <h2 className="text-xl font-semibold mb-3 mt-2 indent-2">Amigos</h2>

        <div>
          {/* Mensaje de amigo eliminado */}
          <AnimatePresence>
            {eliminado && (
              <motion.p
                key="toast"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
                exit={{ opacity: 0, y: 8, transition: { duration: 0.8 } }}  // salida lenta
                className='bg-green-600 text-white mb-4 px-4 py-2 rounded shadow-lg z-[100]'
              >
                Amigo eliminado de la lista.</motion.p>
            )}
          </AnimatePresence>

          {/* divs de cada amigo */}
          {amigos.length > 0 ? (
            // lista de amigos
            <div className='mb-2 p-0.5'>

              {/* buscador de amigos */}
              <div className="relative inline-block mb-4">
                <input
                  className="bg-white/90 hover:bg-white w-[75%] indent-2 border rounded-xl px-1 py-2 text-black placeholder-black/70"
                  placeholder="Buscar un amigo…"
                />

                <button
                  type="button"
                  onClick={handleSearch}
                  className="absolute h-full w-fit top-0 right-0 flex items-center rounded-r-xl 
                bg-slate-800 px-2 border border-transparent text-sm 
                  transition-all shadow-sm hover:shadow focus:bg-slate-700 active:bg-slate-700 
                  disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill="currentColor" className="w-4 h-4">
                    <path
                      fillRule="evenodd" clipRule="evenodd"
                      d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                    />
                  </svg>
                </button>
              </div>


              {amigos.map((e) => (
                <div key={e.id} className="border rounded-xl p-4 bg-white/10 hover:bg-white/20 
                mb-2 grid grid-cols-2">
                  <p><strong>Amigo_id:</strong> {e.amigo_id}</p>

                  <motion.button
                    type="button"
                    className='bg-red-500 hover:bg-red-600 rounded w-32 cursor-pointer 
                    justify-self-end'
                    whileTap={{ scale: 1.3 }}
                    onClick={() => eliminarAmigo(e.id)}
                  >
                    Eliminar Amigo
                  </motion.button>
                </div>
              ))}
            </div>
          ) : (
            // lista de amigos vacio
            <p className="indent-2 mb-4">No tienes amigos guardado...</p>
          )}
        </div>
      </div>

    </div>
  )
};

export default Perfil;