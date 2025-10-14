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
  const userId = user?.id; // puede ser undefined si no hay user guardado
  const jugador_id = user?.jugador_id;


  // 2) estados
  const [selected, setSelected] = useState(null);
  const [estadisticas, setEstadisticas] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [eliminado, setEliminado] = useState(false);
  const eliminadoTimerRef = useRef(null);

  // 3) edición
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});


  const getEstadisticas = async () => {

    const values = {
      jugador_id: jugador_id
    };

    try {
      const { data } = await axios.get("http://localhost:3006/estadisticas/", values);
      setEstadisticas(data);
    } catch (error) {
      console.log("@@@@ Error GET: estadisticas\n", error);
    }

  }

  // Carga del perfil
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

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

  const [amigos, setAmigos] = useState([]);

  // obtiene todos los amigos del jugador_id
  const getAmigos = async () => {

    const values = {
      jugador_id: jugador_id,
    };

    try {
      const { data } = await axios.get(`http://localhost:3006/amigos`, values);
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
  }

  useEffect(() => {
    getAmigos();
    getEstadisticas();
  }, []);

  if (!userId) return <p>No hay usuario en sesión.</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (loadingPerfil) return <p>Cargando perfil…</p>;
  if (!perfil) return <p>No se pudo cargar el perfil.</p>;

  return (
    <div className="w-[70%] mb-6">

      {/* avatar */}
      <div className="flex flex-col items-center h-fit w-full cursor-pointer">
        <div className="h-30 w-30 bg-gray-200/80 rounded-full text-black text-6xl text-center flex items-center justify-center">
          <p>👤</p>
        </div>
        <p className="mt-2 text-4xl">{perfil.name}</p>
      </div>

      {/* Mi Perfil */}
      <div className="mt-4 space-y-4">
        <h2 className="text-xl font-semibold">Datos personales</h2>
        {!editMode ? (
          <div className="space-y-2 bg-white/10 p-4 text-xl">
            <p><b>Nombre:</b> {perfil.name}</p>
            <p><b>Email:</b> {perfil.email}</p>
            <p><b>Contraseña:</b> ••••••••</p>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
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
          <form onSubmit={handleSave} className="space-y-3 bg-white/10 p-4 rounded">
            <div>
              <label className="block text-sm mb-1">Nombre</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded text-black bg-white"
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
                className="w-full px-3 py-2 rounded text-black bg-white"
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
                className="w-full px-3 py-2 rounded text-black bg-white"
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

      {/* Estadísticas */}
      <div className="flex flex-row gap-2 mt-4">
        <h2 className="text-xl font-semibold mb-3 mt-3 cursor-pointer hover:text-white/90">Partidas</h2>
        <h2 className="text-xl flex items-center justify-center">|</h2>
        <h2 className="text-xl font-semibold mb-3 mt-3 cursor-pointer hover:text-white/90">Gráfico de estadísticas</h2>
      </div>
      {estadisticas.length === 0 ? (
        <p>No hay estadísticas de partidas para mostrar.</p>
      ) : (
        <ul className="">
          {estadisticas.map((e, index) => (
            <motion.li
              key={e.id}
              className="border rounded p-4 bg-white/10 hover:bg-white/20 
                flex space-x-4 mb-2 cursor-pointer"
              whileTap={{ scale: 1.2 }}
              onClick={() => setSelected(index)}
            >
              {e.posicion > 0 ? (
                <div>
                  <p>Ganaste la Partida</p>
                  <p>Fecha: </p>
                </div>
              ) : (
                <div>
                  <p>Perdiste la Partida</p>
                  <p>Fecha: </p>
                </div>
              )}

            </motion.li>
          ))}
        </ul>
      )}

      {/* div overlay absoluto en toda la pantalla) */}
      {selected !== null && (
        <div
          className="fixed h-full inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelected(null)}
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
              onClick={() => setSelected(null)}
            >
              ✕
            </button>

            {/* Informacion detallada */}
            <div className="text-4xl">

              <div className="flex flex-row gap-2 mb-2">
                <button type="button" className="bg-black/80 rounded w-48 p-2 cursor-pointer hover:text-white/90">Resumen</button>
                <div className="flex items-center justify-center">|</div>
                <button type="button" className="rounded w-48 p-2 cursor-pointer hover:text-white/90">Respuestas</button>
                <div className="flex items-center justify-center">|</div>
                <button type="button" className="p-2 cursor-pointer hover:text-white/90">Gráfico de respuestas</button>
              </div>

              <div className="bg-indigo-800/90 p-1.5 mt-1">

                <p className="p-1"><strong>Puntaje total:</strong> {estadisticas[selected].puntaje_total}</p>
                <p className="p-1"><strong>Respuestas correctas:</strong> {estadisticas[selected].total_correctas}</p>
                <p className="p-1"><strong>Respuestas incorrectas:</strong> {estadisticas[selected].total_incorrectas}</p>
                <p className="p-1"><strong>Tiempo:</strong> {estadisticas[selected].tiempo_total_ms} milisegundos</p>
              </div>
            </div>


          </motion.div>
        </div>
      )}

      {/* Mis amigos */}
      <div className="mb-6 mt-4">
        <h2 className="text-xl font-semibold mb-3 mt-3">Amigos</h2>

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
            <div className='mb-6'>
              {amigos.map((e) => (
                <div key={e.id} className="border rounded p-4 bg-white/10 hover:bg-white/20 mb-2 grid grid-cols-2">
                  <p><strong>Amigo_id:</strong> {e.amigo_id}</p>

                  <motion.button
                    type="button"
                    className='bg-red-500 hover:bg-red-600 rounded w-32 cursor-pointer justify-self-end'
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
            <p>No tienes amigos guardado</p>
          )}
        </div>
      </div>

    </div>
  )
}

export default Perfil