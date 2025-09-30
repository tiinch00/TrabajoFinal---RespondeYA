import { useEffect, useState } from 'react'

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


  // 2) estados
  const [estadisticas, setEstadisticas] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPerfil, setLoadingPerfil] = useState(true);

  // 3) edición
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});

  // 4) Traer estadísticas (mías si hay token, públicas si no)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        if (token) {
          try {
            const { data } = await axios.get("http://localhost:3006/estadisticas/mias", { headers });
            if (alive) {
              setEstadisticas(Array.isArray(data) ? data : []);
              setLoadingStats(false);
              return;
            }
          } catch (err) {
            const status = err?.response?.status;
            if (status !== 401 && status !== 403) {
              if (alive) {
                setError(err.response?.data?.error || err.message);
                setLoadingStats(false);
              }
              return;
            }
            // si 401/403, cae al público
          }
        }

        // publicas
        const { data } = await axios.get("http://localhost:3006/estadisticas");
        if (alive) setEstadisticas(Array.isArray(data) ? data : []);
      } catch (err) {
        if (alive) setError(err.response?.data?.error || err.message);
      } finally {
        if (alive) setLoadingStats(false);
      }
    })();
    return () => { alive = false; };
  }, []);




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

  if (!userId) return <p>No hay usuario en sesión.</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (loadingPerfil) return <p>Cargando perfil…</p>;
  if (!perfil) return <p>No se pudo cargar el perfil.</p>;

  return (
    <div>

      {/* Mi Perfil */}
      <div className="max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold">Mi Perfil</h2>
        {!editMode ? (
          <div className="space-y-2 bg-white/10 p-4">
            {/* <p><b>ID:</b> {perfil.id}</p> */}
            <p><b>Nombre:</b> {perfil.name}</p>
            <p><b>Email:</b> {perfil.email}</p>
            <p><b>Contraseña:</b> ••••••••</p>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                setEditMode(true);
                setForm({ name: perfil.name || "", email: perfil.email || "", password: "" });
                setFormErrors({});
              }}
            >
              Editar
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
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => { setEditMode(false); setFormErrors({}); setForm(f => ({ ...f, password: "" })); }}
                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Estadísticas */}
      <h2 className="text-xl font-semibold mb-3 mt-3">Mis estadísticas</h2>
      {loadingStats ? (
        <p>Cargando estadísticas…</p>
      ) : estadisticas.length === 0 ? (
        <p>No hay estadísticas de partidas para mostrar.</p>
      ) : (
        <ul className="space-x-4 mb-3 flex">
          {estadisticas.map((e) => (
            <li key={e.id} className="border rounded p-6 bg-white/10">
              <div><strong>Partida:</strong> {e.partida_id}</div>
              <div><strong>Posición:</strong> {e.posicion}</div>
              <div><strong>Puntaje:</strong> {e.puntaje_total}</div>
              <div><strong>Correctas:</strong> {e.total_correctas}</div>
              <div><strong>Incorrectas:</strong> {e.total_incorrectas}</div>
              <div><strong>Tiempo:</strong> {e.tiempo_total_ms} ms</div>
            </li>
          ))}
        </ul>
      )}

    </div>
  )
}

export default Perfil