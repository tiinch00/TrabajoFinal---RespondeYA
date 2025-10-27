import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from 'react';

import Cropper from 'react-easy-crop';
import SimpleBarChart from "../components/simpleBarChart";
import axios from "axios";
import { getCroppedImg } from '../utils/cropImage.js';
import { useAuth } from "../context/auth-context.jsx";

const Perfil = () => {

  const { user, updateUser } = useAuth();
  const userId = user?.id;
  const jugador_id = user?.jugador_id;
  const [eliminando, setEliminando] = useState(false);

  // scroll respuestas
  const listRef = useRef(null);

  // botones hooks
  const [selectedPerfil, setSelectedPerfil] = useState(false); // boton de perfil 👤
  const [selectedPefilEditar, setSelectedPefilEditar] = useState(false); // abrir el modal del boton "editar" foto de perfil
  const [selectedAvatar, setSelectedAvatar] = useState(null); // boton mis avatares

  // no lo uso aun=======================================
  // aun no se usa (para cambiar la foto del avatar del perfil)
  const [avatarIdSeleccionado, setAvatarIdSeleccionado] = useState(null); // cuando elige un avatar dentro del listado
  // =======================================================

  const [partidaIdSeleccionada, setPartidaIdSeleccionada] = useState(null);

  const [editMode, setEditMode] = useState(false); // boton editar datos de perfil
  const [saving, setSaving] = useState(false); // boton de guardar los datos de formulario de editar perfil

  // tener en cuenta que hago fecth de todas las estadisticas y no lo filtro por jugador_id

  const [selectedEstadisticasResultadosDePartidas, setSelectedEstadisticasResultadosDePartidas] = useState(true); // boton "resultados de partidas"
  //const [selectedEstadisticasGeneral, setSelectedEstadisticasGeneral] = useState(null); // boton "Estadísticas general"
  const [selectedEstadisticas, setSelectedEstadisticas] = useState(null); // boton abrir modal detalle completo de la partida
  const [selectedEstResumen, setSelectedEstResumen] = useState(true);
  const [selectedEstRespuestas, setSelectedEstRespuestas] = useState(null); // boton del modal "Respuestas"

  // creo que no se usa mas...
  const [openPreguntaId, setOpenPreguntaId] = useState(null);
  // estado (al tope del componente)
  const [openPreguntaIds, setOpenPreguntaIds] = useState(() => new Set());


  const [selectedEstGraficaDeRespuestas, setSelectedEstGraficaDeRespuestas] = useState(null); //   

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
  const [partida_jugadores, setPartida_jugadores] = useState([]);
  const [partida_preguntas, setPartida_preguntas] = useState([]);
  const [respuestas, setRespuestas] = useState([]);

  const [objetoPartidaCompleto, setObjetoPartidaCompleto] = useState(null);

  const [estadisticas, setEstadisticas] = useState([]); // array estadisticas

  // hooks de foto de perfil
  const API = "http://localhost:3006"; // URL base de tu API
  const [foto, setFoto] = useState(user.foto_perfil);
  const [preview, setPreview] = useState(null);  // URL local de previsualización
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef(null);
  //para recorte de foto de perfil
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState(null); // URL de la imagen original para cropear




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

  // al elegir archivo
  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // guardo el File original
    setFoto(f);
    // URL temporal para el cropper
    const url = URL.createObjectURL(f);
    setTempImageUrl(url);
    // mostrar modal de recorte
    setCropModalOpen(true);
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // aplicar recorte: genera File/Blob + preview recortada
  const aplicarRecorte = async () => {
    if (!tempImageUrl || !croppedAreaPixels) return;
    const { file, previewUrl } = await getCroppedImg(tempImageUrl, croppedAreaPixels, 'perfil.jpg');
    // reemplazo la foto original por la recortada
    setFoto(file);
    setPreview(previewUrl);
    setCropModalOpen(false);
    // libero memoria de la URL temporal
    URL.revokeObjectURL(tempImageUrl);
    setTempImageUrl(null);
  };

  const cancelarCrop = () => {
    setCropModalOpen(false);
    if (preview) {
      setPreview(null);
      setFoto(null)
    }
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
    // limpiar input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const subirFoto = async () => {
    if (!foto || !perfil?.id) return;
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append('foto', foto); // <-- la recortada (File)

      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `http://localhost:3006/users/${user.id}/foto`,
        fd,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      // El server debería responder algo así:
      // { ok: true, url: '/uploads/fotos_perfil/abc.jpg', user: {...} }
      const nuevaRuta = data?.url;
      if (nuevaRuta) {
        // Actualizá el perfil en estado para que se vea la nueva foto
        setPerfil(prev => ({ ...prev, foto_perfil: nuevaRuta }));
        setFoto(nuevaRuta);

        // 2) ACTUALIZÁ EL CONTEXTO (esto refresca el Header automáticamente)
        updateUser({
          ...user,
          foto_perfil: nuevaRuta,
        });

        // Opcional: actualizá el localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({
          ...storedUser,
          foto_perfil: nuevaRuta,
        }));

        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setCropModalOpen(false);
        //setSelectedPefilEditar(false);
        window.dispatchEvent(new CustomEvent('user:changed', { detail: { user: storedUser } }));
      } else {
        throw new Error("El servidor no devolvió la URL de la imagen");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const cancelarFotoLocal = () => {
    if (foto == null || preview == null) {
      setFoto(null);
      setPreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // liberar la URL del preview cuando cambie (higiene)
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const eliminarFoto = async () => {
    if (!user?.id || !user?.foto_perfil) return;
    const ok = window.confirm("¿Seguro querés eliminar tu foto de perfil?");
    if (!ok) return;

    try {
      setEliminando(true);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3006/users/${user.id}/foto`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // 1) limpiar estado local
      setPreview(null);
      setFoto(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // 2) actualizar usuario global (Header se refresca solo)
      updateUser({ ...user, foto_perfil: null });
    } catch (err) {
      console.error("Error eliminando foto:", err);
    } finally {
      setEliminando(false);
    }
  };

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
    //console.log("inventarioAvataresDos →", { jid, idsDelJugador: [...idsDelJugador], out });

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

  // obtiene un array de PartidaJugadores (saber que jugadores jugaron en una partida)
  const getPartidaJugadores = async () => {
    try {
      const { data } = await axios.get("http://localhost:3006/partida_jugadores");
      setPartida_jugadores(data);
    } catch (error) {
      console.log("@@@@ Error GET: partida_jugadores\n", error);
    }
  };

  // Une el array jugadorAvatares (avatar_id) con el array avatares (id)
  const inventarioIdPartidaSeleccionado = () => {
    if (Array.isArray(partidas) && Array.isArray(preguntas) && Array.isArray(partida_jugadores)
      && Array.isArray(partida_preguntas) && Array.isArray(opciones) && Array.isArray(respuestas)) {

      // id de partida seleccionada
      let idPartida = Number(partidaIdSeleccionada); // convierte el string a int
      //if (typeof idPartida === "string") console.log("Es string");   // true si es string
      //if (typeof idPartida === "number") console.log("Es numero");    // true si es número (NaN incluido)
      //console.log("idPartida", idPartida);

      if (!Number.isFinite(idPartida)) {
        console.log("partidaIdSeleccionada no es numérico:", idPartida);
      } else {
        // 1) obtiene un objeto de partidas con todos sus atributos segun el id de la partida seleccionada en la lista.     
        const partidaDelJugador = partidas.filter(e => Number(e.id) === idPartida);
        //console.log("array partidaDelJugador:", partidaDelJugador);

        // verifica si la partida existe
        if (partidaDelJugador.length !== 0) {
          // 2) obtiene el id de categoria.
          const categoriaIds = partidaDelJugador[0].categoria_id;
          //console.log("array categoriaIds:", categoriaIds); 

          // 3) obtiene el string categoria
          const objCategoria = categorias.find(category => category.id == categoriaIds);
          //console.log("objCategoria:", objCategoria);

          // 4) filtra el array preguntas segun el id de categoria y obtiene un array de 10 objetos de preguntas          
          const resultDificultad = preguntas.find(pregunta => pregunta.categoria_id == categoriaIds);
          //console.log("array resultDificultad:", resultDificultad);

          // 5) obtiene el valor string de la dificultad del objeto pregunta (categoria_id)
          const dificultadPregunta = resultDificultad.dificultad;
          //console.log("dificultadPregunta:", dificultadPregunta);

          // 6) obtiene el objeto partida_jugadores asi se puede ver los id/s de los jugador/es de la partida
          const jugadoresDeUnaPartdia = partida_jugadores.find(e => Number(e.partida_id) === idPartida);
          //console.log("jugadoresDeUnaPartdia:", jugadoresDeUnaPartdia);

          // 7) obtiene un array donde se verifica las preguntas que se eligieron al azar el orden de la partida (partida_preguntas)
          const preguntasDeLaPartida = partida_preguntas.filter(e => Number(e.partida_id) === idPartida);
          //console.log("preguntasDeLaPartida:", preguntasDeLaPartida);

          // 8) obtiene un array de las respuestas que el jugador selecciono en la partida (respuestas)
          const respuestasDeLaPartida = respuestas.filter(e => Number(e.partida_id) === idPartida);
          //console.log("respuestasDeLaPartida:", respuestasDeLaPartida);

          // 9) se crea un array indexado donde los elementos son  id de opciones de respuesta del array respuestasDeLaPartida
          const arrayPreguntasIdsDeLaPartida = respuestasDeLaPartida.map(opcion => ({
            opcionId: opcion.opcion_elegida_id,
            pregunta_id: opcion.pregunta_id,
            es_correcta: opcion.es_correcta,
          })); // es_correcta se puede eliminar
          //console.log("arrayPreguntasIdsDeLaPartida:", arrayPreguntasIdsDeLaPartida);

          // 10) obtiene un array de opciones de respuestas segun la preguntas. como hay 10 preguntas, va haber 40 opciones de respuestas
          // 10.1) Normalizá y armá un Set con los preguntaId de la partida
          const preguntaIdsSet = new Set(
            (arrayPreguntasIdsDeLaPartida ?? []).map(x => Number(x.pregunta_id))
          );
          // array con los ids de preguntas
          //console.log(preguntaIdsSet);

          // 10.2) Filtrá opciones por partida y por pertenencia de pregunta_id al Set          
          const opcionesDeLaPartida = (opciones ?? []).filter(o =>
            Number(o.pregunta_id) && preguntaIdsSet.has(Number(o.pregunta_id))
          );
          //console.log("opcionesDeLaPartida:", opcionesDeLaPartida);

          return {
            idPartida,
            categoriaIds: categoriaIds,
            objCategoria: objCategoria,
            dificultadDePreguntas: dificultadPregunta,
            partida: partidaDelJugador,
            jugadores: jugadoresDeUnaPartdia,
            preguntasDeLaPartida: preguntasDeLaPartida,
            respuestasDeLaPartida: respuestasDeLaPartida,
            preguntasIdsDeLaPartida: arrayPreguntasIdsDeLaPartida,
            opcionesDeRespuestas: opcionesDeLaPartida,
          };
        } else {
          //console.log("No hay un objeto");
          return null;
        }
      }
    } else {
      console.log("Alguno de los arrays no es un array:",
        { partidas, preguntas, partida_jugadores, partida_preguntas, opciones, respuestas });
      return null;
    }
  };

  // toggle para abri una o mas preguntas en el detalle completo de una partida
  const togglePregunta = (id) => {
    setOpenPreguntaIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // funcion de buscador entre estadisticas y amigos - (tengo que hacer 2 diferetes o uno para ambas)
  const handleSearch = () => {
    console.log("Buscar…");
  };

  // const formatMs = (ms) => {
  //   if (ms == null || Number.isNaN(Number(ms))) return "—";
  //   const s = Number(ms) / 1000;
  //   //  mm:ss.mmm
  //   const mm = Math.floor(s / 60).toString().padStart(2, "0");
  //   const ss = Math.floor(s % 60).toString().padStart(2, "0");
  //   const mmm = Math.floor((s - Math.floor(s)) * 1000).toString().padStart(3, "0");
  //   return `${mm}:${ss}.${mmm}`;
  // };

  // ej: fmtCrono(600000);  // "10:00.000"
  const fmtCrono = (ms) => {
    const n = Number(ms);
    if (!Number.isFinite(n) || n < 0) return "—";

    const m = Math.floor(n / 60000).toString().padStart(2, "0");
    const s = Math.floor((n % 60000) / 1000).toString().padStart(2, "0");
    const x = Math.floor(n % 1000).toString().padStart(3, "0");

    return `${m}:${s}.${x}`;
  };

  // ej: fmtMsDetallado(600000);   // "10 minutos, 0 segundos, 0 milisegundos"
  const fmtMsDetallado = (ms) => {
    const n = Number(ms);
    if (!Number.isFinite(n) || n < 0) return "—";

    const minutos = Math.floor(n / 60000);
    const segundos = Math.floor((n % 60000) / 1000);
    const milis = Math.floor(n % 1000);

    return `${minutos} minutos, ${segundos} segundos, ${milis} milisegundos`;
  };

  const fmtMs = (ms) => (Number(ms) / 1000).toFixed(1) + ' segundos';

  // arriba del JSX (dentro del componente, antes del return)
  const respuestasEspecificas = objetoPartidaCompleto?.respuestasDeLaPartida ?? [];
  const elegidaPorPregunta = new Map(respuestasEspecificas.map(r => [Number(r.pregunta_id), Number(r.opcion_elegida_id)]));
  const correctaPorPregunta = new Map(respuestasEspecificas.map(r => [Number(r.pregunta_id), Number(r.es_correcta) > 0]));
  const tiempoPorPregunta = new Map(respuestasEspecificas.map(r => [Number(r.pregunta_id), Number(r.tiempo_respuesta_ms)]));

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await Promise.all([
          getAmigos(),
          infoAvatares(),
          infoJugadorIdAvatares(),
          getCategorias(),
          getPreguntas(),
          getOpciones(),
          getPartidaJugadores(),
          getPartdias(),
          getPartidaPreguntas(),
          getEstadisticas(),
          getRespuestas(),
        ]);
      } finally {
        if (!alive) return;
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recalcular el objeto cuando haya datos suficientes
  useEffect(() => {
    const obj = inventarioIdPartidaSeleccionado(); // debe ser una funcion pura (sin setState adentro)
    //setObjetoPartidaCompleto(obj);
    setObjetoPartidaCompleto(prev =>
      JSON.stringify(prev) === JSON.stringify(obj) ? prev : obj
    );
  }, [
    partidas, preguntas, categorias, partida_jugadores, partida_preguntas,
    opciones, respuestas, partidaIdSeleccionada
  ]);

  const algunModalAbierto = selectedPerfil || selectedEstadisticas || selectedAvatar !== null;
  useEffect(() => {
    if (!algunModalAbierto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [algunModalAbierto]);

  // verifica datos para correr perfil o envia mensaje de errores visual en la interfaz
  if (!userId) return <p>No hay usuario en sesión.</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (loadingPerfil) return <p>Cargando perfil…</p>;
  if (!perfil) return <p>No se pudo cargar el perfil.</p>;

  // console.log(partidaIdSeleccionada);  

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
          {foto == null ?
            (<p>👤</p>)
            :
            (<img
              src={
                preview
                  ? preview
                  : perfil?.foto_perfil
                    ? `${API}${perfil.foto_perfil}` // el server devuelve ruta relativa
                    : "https://placehold.co/128x128?text=Foto" // placeholder opcional
              }
              alt="Foto de perfil"
              className="w-32 h-32 rounded-full object-cover bg-white/20"
            />)}

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

              {foto == null ?
                (<p className="text-[190px] bg-white/60 rounded-full text-center">
                  👤
                </p>)
                :
                (<img
                  src={
                    preview
                      ? preview
                      : perfil?.foto_perfil
                        ? `${API}${perfil.foto_perfil}` // el server devuelve ruta relativa
                        : "https://placehold.co/128x128?text=Foto" // placeholder opcional
                  }
                  alt="Foto de perfil"
                  className="w-68 h-68 rounded-full object-cover bg-white/20"
                />)}

              {selectedPefilEditar ? (
                <div className="absolute left-8 top-56 
                      
                    bg-white text-black rounded-2xl px-3 py-3">

                  <ul>
                    {/* Elegir de la biblioteca */}

                    <li className="flex flex-row gap-2">
                      <div>
                        {/* Input file oculto */}
                        <input
                          id="file-picker"
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={onPickFile}
                        />

                        {/* Botón visible */}
                        <label
                          htmlFor="file-picker"
                          className="rounded-md text-black hover:text-gray-600 cursor-pointer"
                        >
                          Elegir de la biblioteca
                        </label>

                        <div className="flex flex-row">
                          {/* Guardar */}
                          {(preview) && (
                            <button
                              type="button"
                              onClick={subirFoto}
                              disabled={subiendo}
                              className="p-1 rounded-md bg-violet-600 hover:bg-violet-800 text-white disabled:opacity-50 cursor-pointer"
                            >
                              {subiendo ? 'Subiendo...' : 'Guardar foto'}
                            </button>
                          )}

                          {/* Cancelar */}
                          {(preview) && (
                            <button
                              type="button"
                              onClick={cancelarFotoLocal}
                              className="ml-2 px-3 py-1.5 rounded-md bg-gray-600 hover:bg-gray-800  text-white cursor-pointer"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>

                        {/* Preview = pre vista de la for=to recortada (recortada, si ya aplicaste recorte) */}
                        {/*preview && (
                          <div className="mt-3">
                            <img src={preview} alt="preview" className="w-40 h-40 rounded-full object-cover" />
                          </div>
                        )*/}

                        {/* Modal de recorte */}
                        {cropModalOpen && (
                          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                            <div className="bg-white rounded-2xl p-4 w-[90vw] max-w-xl">
                              <div className="relative w-full h-[60vh] max-h-[70vh] bg-black/5 rounded">
                                {tempImageUrl && (
                                  <Cropper
                                    image={tempImageUrl}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}           // cuadrado (ideal para avatar)
                                    cropShape="round"     // círculo visual (opcional)
                                    showGrid={false}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                  />
                                )}
                              </div>

                              {/* Controles */}
                              <div className="mt-4 flex items-center justify-between">
                                <input
                                  type="range"
                                  min={1}
                                  max={3}
                                  step={0.01}
                                  value={zoom}
                                  onChange={(e) => setZoom(Number(e.target.value))}
                                  className="w-2/3 cursor-pointer"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded bg-gray-200 cursor-pointer"
                                    onClick={cancelarCrop}
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded bg-violet-600 text-white cursor-pointer"
                                    onClick={aplicarRecorte}
                                  >
                                    Aplicar recorte
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label="Cerrar"
                        className="text-end rounded-full w-3 h-6 hover:text-red/5 cursor-pointer text-md text-red-500"
                        onClick={() =>
                          setSelectedPefilEditar(false)
                        }
                      >
                        ✕
                      </button>
                    </li>

                    <li className="cursor-pointer hover:text-gray-600">Elegir un avatar</li>
                    {foto && (
                      <li className="cursor-pointer hover:text-red-700 text-red-500"><button
                        type="button"
                        onClick={eliminarFoto}
                        disabled={eliminando}
                        className=" cursor-pointer hover:text-red-700 text-red-500 disabled:opacity-50"
                      >
                        {eliminando ? "Eliminando..." : "Eliminar foto"}
                      </button></li>
                    )}
                  </ul>
                </div>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className="absolute left-46 top-60 -translate-y-1/2 ml-4
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
                    onClick={() => setSelectedAvatar(null)}
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

      {selectedEstadisticasResultadosDePartidas ? (
        <div>
          {/* Estadísticas */}
          <div className="flex flex-row gap-2 mt-4">
            <button><h2 className="text-xl font-semibold mb-3 mt-3 cursor-pointer hover:text-white/90 bg-black/50 rounded p-1">Resultados de partidas</h2></button>
            <h2 className="text-xl flex items-center justify-center p-1">|</h2>
            <button type="button" onClick={() => { setSelectedEstadisticasResultadosDePartidas(false); }}><h2 className="text-xl font-semibold mb-3 mt-3 cursor-pointer hover:text-white/90 p-1">Estadísticas general</h2></button>
          </div>

          {estadisticas.length === 0 ? (
            <p>No hay estadísticas de partidas para mostrar.</p>
          ) : (
            <div>
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
                  bg-slate-800 px-2 border border-transparent text-sm transition-all 
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
            </div>
          )
          }

          {/* div overlay absoluto en toda la pantalla) */}
          {selectedEstadisticas !== null && (
            <div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            >
              {/* fonde desenfocado */}
              <motion.div
                onClick={(e) => e.stopPropagation()} // evita que el click burbujee al overlay
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                // 1) wrapper del modal: altura limitada + columna + oculta desborde externo
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                  w-[95vw] max-w-5xl h-[90vh] max-h-[90vh]
                  rounded-2xl bg-indigo-900 text-white shadow-2xl
                  p-3 flex flex-col overflow-hidden"
              >

                {/* seccion de resumen */}
                {selectedEstResumen && (
                  <>
                    {/* 1) header (no scroll) */}
                    <div className="flex items-center gap-2 mb-2">
                      {/* Tabs / encabezado */}
                      <div className="flex flex-row gap-2 mb-2 w-fit text-2xl">
                        <button
                          type="button"
                          className="bg-black/80 rounded w-48 p-2 hover:text-white/90"
                        >
                          Resumen
                        </button>

                        <div className="flex items-center justify-center">|</div>

                        <button
                          type="button"
                          onClick={() => { setSelectedEstRespuestas(true); setSelectedEstResumen(false); }}
                          className="w-48 p-2 cursor-pointer hover:text-white/90"
                        >
                          Respuestas
                        </button>

                        <div className="flex items-center justify-center">|</div>

                        <button
                          type="button"
                          onClick={() => { setSelectedEstGraficaDeRespuestas(true); setSelectedEstResumen(false); }}
                          className="p-2 cursor-pointer hover:text-white/90"
                        >
                          Gráfica de respuestas
                        </button>
                      </div>

                      {/* Botón cerrar */}
                      <button
                        type="button"
                        aria-label="Cerrar"
                        className="ml-auto rounded-full w-9 h-9 grid place-items-center text-2xl cursor-pointer"
                        onClick={() => { setSelectedEstadisticas(null); setSelectedEstRespuestas(null); setSelectedEstGraficaDeRespuestas(null); setSelectedEstResumen(true); setOpenPreguntaIds(new Set()) }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Informacion detallada */}
                    <div className="bg-indigo-800/90 rounded p-4 mt-1 text-xl flex-1 min-h-0 text-[28px]">
                      {estadisticas[selectedEstadisticas].posicion > 0 ? (
                        <p className="p-1"><strong>Posición:</strong> Ganador</p>
                      ) : (
                        <p className="p-1"><strong>Posición:</strong> Perdedor</p>
                      )}
                      <p className="p-1"><strong>Puntaje total:</strong> {estadisticas[selectedEstadisticas].puntaje_total}</p>
                      <p className="p-1"><strong>Categoría:</strong> {objetoPartidaCompleto?.objCategoria?.nombre ?? "—"}</p>
                      <p className="p-1"><strong>Dificultad de preguntas:</strong> {objetoPartidaCompleto?.dificultadDePreguntas ?? "—"}</p>
                      <p className="p-1"><strong>Respuestas correctas:</strong> {estadisticas[selectedEstadisticas].total_correctas}</p>
                      <p className="p-1"><strong>Respuestas incorrectas:</strong> {estadisticas[selectedEstadisticas].total_incorrectas}</p>
                      <p className="p-1"><strong>Tiempo de partida:</strong> {fmtMsDetallado(estadisticas[selectedEstadisticas].tiempo_total_ms)}</p>
                    </div>
                  </>
                )}

                {/* seccion de respuestas */}
                {selectedEstRespuestas && (
                  <>
                    {/* 1) header (no scroll) */}
                    <div className="flex items-center gap-2 mb-2">
                      {/* Tabs / encabezado */}
                      <div className="flex flex-row gap-2 mb-2 w-fit text-2xl">
                        <button
                          type="button"
                          onClick={() => { setSelectedEstResumen(true); setSelectedEstRespuestas(false); }}
                          className="w-48 p-2 cursor-pointer hover:text-white/90"
                        >
                          Resumen
                        </button>

                        <div className="flex items-center justify-center">|</div>

                        <button
                          type="button"
                          className="bg-black/80 rounded w-48 p-2 hover:text-white/90">
                          Respuestas
                        </button>

                        <div className="flex items-center justify-center">|</div>

                        <button
                          type="button"
                          onClick={() => { setSelectedEstGraficaDeRespuestas(true); setSelectedEstRespuestas(false); }}
                          className="p-2 cursor-pointer hover:text-white/90"
                        >
                          Gráfica de respuestas
                        </button>
                      </div>

                      {/* Botón cerrar */}
                      <button
                        type="button"
                        aria-label="Cerrar"
                        className="ml-auto rounded-full w-9 h-9 grid place-items-center text-2xl cursor-pointer"
                        onClick={() => { setSelectedEstadisticas(null); setSelectedEstRespuestas(null); setSelectedEstGraficaDeRespuestas(null); setSelectedEstResumen(true); setOpenPreguntaIds(new Set()) }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* 2) wrapper (contenedor) que da altura al contenido */}
                    <div className="flex-1 min-h-0">
                      {/* 3) área scrollable */}
                      <div
                        ref={listRef}
                        className="h-full overflow-y-auto overscroll-contain touch-pan-y pr-2
                      bg-indigo-800/90 rounded"
                      >
                        {console.log(objetoPartidaCompleto)}

                        <div className="flex flex-row gap-2 mb-2 sticky top-0 bg-indigo-800 p-2">
                          <button
                            onClick={() => setOpenPreguntaIds(new Set(
                              (objetoPartidaCompleto?.preguntasDeLaPartida ?? []).map(e => Number(e.pregunta_id ?? e.id))
                            ))}
                            className="bg-black/60 hover:bg-black rounded p-2 cursor-pointer text-[20px]"
                          >
                            Abrir todas las preguntas
                          </button>

                          <button
                            onClick={() => setOpenPreguntaIds(new Set())}
                            className="bg-black/60 hover:bg-black rounded p-2 cursor-pointer text-[20px]"
                          >
                            Cerrar todas las preguntas
                          </button>
                        </div>

                        {objetoPartidaCompleto?.preguntasDeLaPartida?.length ? (
                          <ul className="p-2">
                            {(objetoPartidaCompleto?.preguntasDeLaPartida ?? []).map((e, index) => (
                              <motion.li
                                key={Number(e.pregunta_id ?? e.id)}
                                className="border rounded-xl p-3 odd:bg-black/5 even:bg-black/30 flex flex-col mb-2"
                                whileTap={{ scale: 1.01 }}
                              >
                                <button
                                  type="button"
                                  className="text-left w-full cursor-pointer hover:bg-black/30 rounded p-0.5 text-[20px]"
                                  onClick={() => togglePregunta(Number(e.pregunta_id ?? e.id))}
                                >
                                  <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 font-semibold">
                                    {`${index + 1})`}
                                  </span>

                                  <span className="leading-snug">{e.question_text_copy}</span>
                                </button>

                                {openPreguntaIds.has(Number(e.pregunta_id ?? e.id)) && (
                                  <div className="mt-2">
                                    {(objetoPartidaCompleto?.opcionesDeRespuestas ?? [])
                                      .filter(o => Number(o.pregunta_id) === Number(e.pregunta_id ?? e.id))
                                      .map(o => (
                                        <span
                                          key={o.id}
                                          className={[
                                            "block mb-1 indent-2 rounded text-[22px] border",
                                            (() => {
                                              const qId = Number(e.pregunta_id ?? e.id);
                                              const chosenId = elegidaPorPregunta.get(qId);
                                              const userCorrect = !!correctaPorPregunta.get(qId);
                                              const isChosen = chosenId === Number(o.id);
                                              const isOptionCorrect = !!o.es_correcta;

                                              if (isChosen) {
                                                return userCorrect
                                                  ? "bg-green-600/30 border-green-500"
                                                  : "bg-red-600/30 border-red-500";
                                              }
                                              // Si NO es la elegida pero es la correcta → amarillo
                                              if (isOptionCorrect) {
                                                return "bg-yellow-600/35 border-yellow-500";
                                              }
                                              return "bg-gray-800/30 hover:bg-gray-800/50 border-transparent";
                                            })()
                                          ].join(" ")}
                                        >
                                          {(() => {
                                            const qId = Number(e.pregunta_id ?? e.id);
                                            const chosenId = elegidaPorPregunta.get(qId);
                                            const userCorrect = !!correctaPorPregunta.get(qId);
                                            const isChosen = chosenId === Number(o.id);
                                            const isOptionCorrect = !!o.es_correcta;

                                            if (isChosen) return userCorrect ? "✅ " : "❌ ";
                                            if (isOptionCorrect) return "📖 "; // correcta no elegida
                                            return "";
                                          })()}
                                          {o.texto ?? o.option_text ?? "—"}
                                        </span>
                                      ))}
                                  </div>
                                )}
                                {/* tiempo de respuesta (al abrir) */}
                                {openPreguntaIds.has(Number(e.pregunta_id ?? e.id)) && (
                                  <div className="mt-1 text-sm opacity-80">
                                    Tiempo de respuesta:{" "}
                                    {/* <b>{formatMs(tiempoPorPregunta.get(Number(e.pregunta_id ?? e.id)))}</b> */}
                                    <b>{fmtMs(tiempoPorPregunta.get(Number(e.pregunta_id ?? e.id)))}</b>
                                  </div>
                                )}
                              </motion.li>
                            ))}
                          </ul>
                        ) : (
                          <span>Listado de preguntas…</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* seccion de grafica de respuestas */}
                {selectedEstGraficaDeRespuestas && (
                  <>
                    {/* 1) header (no scroll) */}
                    <div className="flex items-center gap-2 mb-2">
                      {/* Tabs / encabezado */}
                      <div className="flex flex-row gap-2 mb-2 w-fit text-2xl">
                        <button
                          type="button"
                          onClick={() => { setSelectedEstResumen(true); setSelectedEstGraficaDeRespuestas(false); }}
                          className="w-48 p-2 cursor-pointer hover:text-white/90"
                        >
                          Resumen
                        </button>

                        <div className="flex items-center justify-center">|</div>

                        <button
                          type="button"
                          onClick={() => { setSelectedEstRespuestas(true); setSelectedEstGraficaDeRespuestas(false); }}
                          className="w-48 p-2 cursor-pointer hover:text-white/90">
                          Respuestas
                        </button>

                        <div className="flex items-center justify-center">|</div>

                        <button
                          type="button"
                          onClick={() => { setSelectedEstGraficaDeRespuestas(true); setSelectedEstRespuestas(false); }}
                          className="bg-black/80 rounded p-2 hover:text-white/90"
                        >
                          Gráfica de respuestas
                        </button>
                      </div>

                      {/* Botón cerrar */}
                      <button
                        type="button"
                        aria-label="Cerrar"
                        onClick={() => { setSelectedEstadisticas(null); setSelectedEstRespuestas(null); setSelectedEstGraficaDeRespuestas(null); setSelectedEstResumen(true); setOpenPreguntaIds(new Set()) }}
                        className="ml-auto rounded-full w-9 h-9 grid place-items-center text-2xl cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* grafica lineal de respuestas */}
                    <div className="text-xl bg-indigo-800/90 rounded p-1.5 mt-1 flex-1 min-h-0">
                      <span className="p-2 text-[20px]">Grafica lineal de respuestas...</span>

                      {/* grafica de respuesta de simpleBarChart */}
                      <SimpleBarChart objPartidaIdInformacion={objetoPartidaCompleto} />
                    </div>
                  </>
                )}

              </motion.div>
            </div>
          )}
        </div >
      ) : (
        <div>
          {/* Estadísticas */}
          <div className="flex flex-row gap-2 mt-4">
            <button type="button" onClick={() => { setSelectedEstadisticasResultadosDePartidas(true); }}><h2 className="text-xl font-semibold mb-3 mt-3 cursor-pointer hover:text-white/90 p-1">Resultados de partidas</h2></button>
            <h2 className="text-xl flex items-center justify-center p-1">|</h2>
            <button><h2 className="text-xl font-semibold mb-3 mt-3 cursor-pointer hover:text-white/90 bg-black/50 rounded p-1">Estadísticas general</h2></button>
          </div>
          <span>Grafica...</span>
        </div>
      )
      }


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

    </div >
  )
};

export default Perfil;