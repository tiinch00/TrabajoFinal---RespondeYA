import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import ChartMultilineLabels from '../components/graficosQuickchart.io/ChartMultilineLabels.jsx';
import ChartVerticalLabels from '../components/graficosQuickchart.io/ChartVerticalLabels.jsx';
import Cropper from 'react-easy-crop';
import QCChartStable from '../components/graficosQuickchart.io/QCChartStable.jsx';
import SimpleBarChart from '../components/simpleBarChart';
import axios from 'axios';
import { getCroppedImg } from '../utils/cropImage.js';
import { useAuth } from '../context/auth-context.jsx';
import { useTranslation } from 'react-i18next';

// normalizador simple (tildes, mayúsculas, espacios) y evita errores con null/undefined/objetos raros.
function normalize(s) {
  return (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const Perfil = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const userId = user?.id;
  const jugador_id = user?.jugador_id;
  const [eliminando, setEliminando] = useState(false);

  const modeTranslations = {
    individual: t('singlePlayer'),
    multijugador: t('multiPlayer'),
  };
  const categoryTranslations = {
    Cine: t('cinema'),
    Historia: t('history'),
    'Conocimiento General': t('generalKnowLedge'),
    Geografía: t('geography'),
    Informatica: t('informatic'),
  };

  const timeDifficultyTranslations = {
    facil: t('easy'),
    normal: t('medium'),
    dificil: t('hard'),
  };

  const difficultyTranslations = {
    facil: t('easy'),
    normal: t('medium'),
    dificil: t('hard'),
  };
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
  const [friendsSearch, setFriendsSearch] = useState("");

  const [modalEstadisticaAbierto, setModalEstadisticaAbierto] = useState(null);
  const [selectedEstadisticasResultadosDePartidas, setSelectedEstadisticasResultadosDePartidas] =
    useState(true); // boton "resultados de partidas"
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
  const [listaObjetosPartidaInformacion, setListaObjetosPartidaInformacion] = useState(null);
  const [arraySalaJugadores, setArraySalaJugadores] = useState([]);
  const [salaId, setSalaId] = useState(null);

  const [estadisticas, setEstadisticas] = useState([]); // array estadisticas

  // hooks de foto de perfil
  const API = 'http://localhost:3006'; // URL base de tu API
  const [foto, setFoto] = useState(user.foto_perfil);
  const [preview, setPreview] = useState(null); // URL local de previsualización
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef(null);
  //para recorte de foto de perfil
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState(null); // URL de la imagen original para cropear

  // agregar un amigo
  const [addingFriendId, setAddingFriendId] = useState(null);
  const [friendMessage, setFriendMessage] = useState(null);

  // solicitudes que me llegan
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendRequestsDetails, setFriendRequestsDetails] = useState([]);

  // detalles de amigos aceptados
  const [friendsDetails, setFriendsDetails] = useState([]);

  // --- filtro de amigos por nombre ---
  const normalizedFriendQuery = normalize(friendsSearch);

  const filteredFriendsDetails = (friendsDetails ?? []).filter(({ usuario }) => {
    if (!normalizedFriendQuery) return true; // sin filtro, devuelve todos
    const nameNorm = normalize(usuario?.name ?? "");
    return nameNorm.includes(normalizedFriendQuery);
  });

  // para botones de aceptar/cancelar
  const [processingRequestId, setProcessingRequestId] = useState(null);

  // errores o inicializaciones
  const [error, setError] = useState(null); // mensaje de error en general
  const [loadingPerfil, setLoadingPerfil] = useState(true); // verifica si el perfil esta y carga la pagina
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });// hook de inicializacion del formulario
  const [formErrors, setFormErrors] = useState({}); // error del formulario

  // buscador de partidas - estado para el input y la lista filtrada
  const [search, setSearch] = useState("");
  const [listaFiltrada, setListaFiltrada] = useState(listaObjetosPartidaInformacion);

  // --- estado de paginado ---
  const PAGE_SIZE = 5; // cada 5 li hace el paginado
  const [currentPage, setCurrentPage] = useState(1);
  // --- paginado solicitudes de amistad ---
  const REQUESTS_PAGE_SIZE = 5;
  const [requestsPage, setRequestsPage] = useState(1);
  // --- paginado de amigos ---
  const FRIENDS_PAGE_SIZE = 5;
  const [friendsPage, setFriendsPage] = useState(1);

  // cuando cambia la lista filtrada, volvemos a página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [listaFiltrada]);

  useEffect(() => {
    setRequestsPage(1);
  }, [friendRequestsDetails]);

  // cálculo de páginas e items visibles
  const total = (listaFiltrada?.length ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);
  const visible = (listaFiltrada ?? []).slice(startIndex, endIndex);

  // ====== paginado solicitudes ======
  const totalRequests = friendRequestsDetails.length;
  const totalRequestsPages = Math.max(
    1,
    Math.ceil(totalRequests / REQUESTS_PAGE_SIZE)
  );
  const requestsStartIndex = (requestsPage - 1) * REQUESTS_PAGE_SIZE;
  const requestsEndIndex = requestsStartIndex + REQUESTS_PAGE_SIZE;
  const visibleFriendRequests = friendRequestsDetails.slice(
    requestsStartIndex,
    requestsEndIndex
  );

  // ====== paginado amigos ======
  const totalFriends = filteredFriendsDetails.length;
  const totalFriendsPages = Math.max(
    1,
    Math.ceil(totalFriends / FRIENDS_PAGE_SIZE)
  );
  const friendsStartIndex = (friendsPage - 1) * FRIENDS_PAGE_SIZE;
  const friendsEndIndex = friendsStartIndex + FRIENDS_PAGE_SIZE;
  const visibleFriends = filteredFriendsDetails.slice(
    friendsStartIndex,
    friendsEndIndex
  );

  // si cambia la lista o el filtro, volvemos a página 1
  useEffect(() => {
    setFriendsPage(1);
  }, [friendsDetails, friendsSearch])

  // handlers
  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const goTo = (p) => setCurrentPage(() => Math.min(Math.max(1, p), totalPages));

  // Carga el perfil y verifica el usuario
  useEffect(() => {
    if (!userId) {
      setLoadingPerfil(false);
      return;
    }
    let alive = true;

    (async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`http://localhost:3006/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        //console.log(data);
        if (!alive) return;
        setPerfil(data);
        setForm({
          name: data.name || '',
          email: data.email || '',
          password: '',
          confirmPassword: '',
        });
      } catch (err) {
        if (!alive) return;
        setError(err.response?.data?.error || err.message);
      } finally {
        if (alive) setLoadingPerfil(false);
      }
    })();

    return () => {
      alive = false;
    };
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
      setFoto(null);
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

      const token = localStorage.getItem('token');
      const { data } = await axios.post(`http://localhost:3006/users/${user.id}/foto`, fd, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // El server debería responder algo así:
      // { ok: true, url: '/uploads/fotos_perfil/abc.jpg', user: {...} }
      const nuevaRuta = data?.url;
      if (nuevaRuta) {
        // Actualizá el perfil en estado para que se vea la nueva foto
        setPerfil((prev) => ({ ...prev, foto_perfil: nuevaRuta }));
        setFoto(nuevaRuta);

        // 2) ACTUALIZÁ EL CONTEXTO (esto refresca el Header automáticamente)
        updateUser({
          ...user,
          foto_perfil: nuevaRuta,
        });

        // Opcional: actualizá el localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...storedUser,
            foto_perfil: nuevaRuta,
          })
        );

        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setCropModalOpen(false);
        //setSelectedPefilEditar(false);
        window.dispatchEvent(new CustomEvent('user:changed', { detail: { user: storedUser } }));
      } else {
        throw new Error('El servidor no devolvió la URL de la imagen');
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
    const ok = window.confirm('¿Seguro querés eliminar tu foto de perfil?');
    if (!ok) return;

    try {
      setEliminando(true);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3006/users/${user.id}/foto`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // 1) limpiar estado local
      setPreview(null);
      setFoto(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // 2) actualizar usuario global (Header se refresca solo)
      updateUser({ ...user, foto_perfil: null });
    } catch (err) {
      console.error('Error eliminando foto:', err);
    } finally {
      setEliminando(false);
    }
  };

  // funcion que hace reemplazar los datos del jugador
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // valida el formulario de editar los datos del jugador
  const validate = () => {
    const errs = {};

    // Nombre obligatorio
    if (!form.name.trim()) {
      errs.name = 'El nombre es obligatorio';
    }

    // Email obligatorio + formato
    if (!form.email.trim()) {
      errs.email = 'El email es obligatorio';
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(form.email.trim())) {
        errs.email = 'Email inválido';
      }
    }

    // Password opcional, pero si lo completan:
    if (form.password && form.password.trim().length < 6) {
      errs.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Confirmación: solo valida si se completó la contraseña
    if (form.password) {
      if (!form.confirmPassword.trim()) {
        errs.confirmPassword = 'Confirmá la contraseña';
      } else if (form.confirmPassword.trim() !== form.password.trim()) {
        errs.confirmPassword = 'Las contraseñas no coinciden';
      }
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
      const token = localStorage.getItem('token');
      // armamos payload: no enviamos password si está vacío
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
      };
      if (form.password.trim()) payload.password = form.password.trim();

      //console.log(payload);

      const { data } = await axios.put(`http://localhost:3006/users/${perfil.id}`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // data = user actualizado (idealmente sin password)
      setPerfil(data);
      setEditMode(false);
      updateUser(data); // data = { id, name, email, role, foto_perfil, ... }
      setForm((f) => ({
        ...f,
        password: '',
        confirmPassword: '',
      }));

      // actualizamos localStorage para que el Header refleje el cambio
      const storedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        id: data.id,
        name: data.name,
        email: data.email,
      };
      localStorage.setItem('user', JSON.stringify(storedUser));
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
      console.log('@@@@ Error GET /avatar\n', error);
    }
  };

  // obtiene los avatares que tiene el jugador comprado user_avatares
  // pero no hay url de las fotos
  const infoJugadorIdAvatares = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:3006/userAvatar',
        { params: { jugador_id } } // <-- params
      );
      setJugadorAvatares(data);
      //console.log("GET: jugadorId_avatares (data):", data);
    } catch (error) {
      console.log('@@@@ Error GET /jugadorId_avatares\n', error);
    }
  };

  // Une el array jugadorAvatares (avatar_id) con el array avatares (id)
  // Usa el jugador_id del contexto (ya lo tenés como const jugador_id = user?.jugador_id)
  const inventarioAvataresDos = () => {
    if (!Array.isArray(avatares) || !Array.isArray(jugadorAvatares)) return [];

    const jid = Number(jugador_id);
    if (!Number.isFinite(jid)) {
      console.warn('jugador_id inválido:', jugador_id);
      return [];
    }

    // 1) quedate solo con los registros del jugador actual
    const jAsDelJugador = jugadorAvatares.filter((ja) => Number(ja.jugador_id) === jid);

    // 2) armá el set de avatar_id (normalizado a número)
    const idsDelJugador = new Set(jAsDelJugador.map((ja) => Number(ja.avatar_id)));

    // 3) filtrá avatares por ese set (normalizando id)
    const out = avatares.filter((avatar) => idsDelJugador.has(Number(avatar.id)));

    // debug útil
    //console.log("inventarioAvataresDos →", { jid, idsDelJugador: [...idsDelJugador], out });

    return out;
  };

  const getAmigos = async () => {
    try {
      if (!jugador_id) return;

      // 1) Amigos donde YO soy jugador_id
      const [comoJugadorRes, comoAmigoRes] = await Promise.all([
        axios.get('http://localhost:3006/amigos', {
          params: { jugador_id },   // yo en la columna jugador_id
        }),
        axios.get('http://localhost:3006/amigos', {
          params: { amigo_id: jugador_id },  // yo en la columna amigo_id
        }),
      ]);

      const lista1 = Array.isArray(comoJugadorRes.data) ? comoJugadorRes.data : [];
      const lista2 = Array.isArray(comoAmigoRes.data) ? comoAmigoRes.data : [];

      // 2) Merge + dedupe por id
      const mapa = new Map();
      [...lista1, ...lista2].forEach((a) => {
        if (!a || a.id == null) return;
        // si ya existe, me quedo con la que tenga aceptado_en seteado
        if (!mapa.has(a.id)) {
          mapa.set(a.id, a);
        } else {
          const prev = mapa.get(a.id);
          if (!prev.aceptado_en && a.aceptado_en) {
            mapa.set(a.id, a);
          }
        }
      });

      // 3) Sólo amigos aceptados (para el listado de "Mis Amigos")
      const soloAceptados = [...mapa.values()].filter((a) => !!a.aceptado_en);

      setAmigos(soloAceptados);
    } catch (error) {
      console.log('@@@@ Error GET: amigos\n', error);
    }
  };


  const eliminarAmigo = async (id) => {
    try {
      // Idealmente debería ser DELETE, pero uso tu endpoint tal cual:
      const { data } = await axios.delete(`http://localhost:3006/amigos/eliminar/${id}`);

      // actualiza el nuevo array de amigos
      setAmigos((prev) => prev.filter((a) => a.id !== id));
      setEliminado(true);

      if (eliminadoTimerRef.current) clearTimeout(eliminadoTimerRef.current);
      eliminadoTimerRef.current = setTimeout(() => {
        setEliminado(false);
        eliminadoTimerRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('Error al eliminar un amigo:', err);
    }
  };

  const handleAgregarAmigo = async (registroSala) => {
    try {
      setFriendMessage(null);

      if (!jugador_id) {
        setFriendMessage("No se encontró tu jugador_id");
        return;
      }

      // el contrincante es un jugador, no un user
      const amigoJugadorId = registroSala?.jugador?.id;
      if (!amigoJugadorId) {
        setFriendMessage("No se encontró el jugador del contrincante");
        return;
      }

      setAddingFriendId(amigoJugadorId);

      const payload = {
        jugador_id: Number(jugador_id),       // yo
        amigo_id: Number(amigoJugadorId),     // el otro jugador
        aceptado_en: null,                    // pendiente
      };

      const { data } = await axios.post(
        "http://localhost:3006/amigos/create",
        payload
      );

      // lo guardo en mi lista local de amigos (pendiente)
      setAmigos((prev) => [...prev, data]);
      setFriendMessage("Solicitud enviada ✅");
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setFriendMessage(msg);
    } finally {
      setAddingFriendId(null);
    }
  };




  // obtiene un objeto categoria
  const getCategorias = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3006/categorias`);
      setCategorias(data);
    } catch (error) {
      console.log('@@@@ Error GET: categorias\n', error);
    }
  };

  // obtiene un objeto pregunta
  const getPreguntas = async (id) => {
    try {
      // /${id}
      const { data } = await axios.get(`http://localhost:3006/preguntas`);
      setPreguntas(data);
    } catch (error) {
      console.log('@@@@ Error GET: preguntas\n', error);
    }
  };

  // obtiene un objeto opcion
  const getOpciones = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3006/opciones`);
      setOpciones(data);
    } catch (error) {
      console.log('@@@@ Error GET: opciones\n', error);
    }
  };

  // obtiene un array de sala_jugadores
  const getArraySalaJugadores = async (id) => {
    try {
      const { data } = await axios.get('http://localhost:3006/sala_jugadores', {
        params: { sala_id: id },
      });
      // asegura el array verificandolo
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.sala_jugadores)
          ? data.sala_jugadores
          : [];
      setArraySalaJugadores(arr);
    } catch (e) {
      console.error('GET /sala_jugadores', e.response?.data?.error || e.message);
      setArraySalaJugadores([]); // fallback, caso mal retorna array vacio
    }
  };

  // obtiene un objeto partida
  const getPartdias = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3006/partidas`);
      setPartidas(data);
    } catch (error) {
      console.log('@@@@ Error GET: partidas\n', error);
    }
  };

  // obtiene un objeto partida_pregunta
  const getPartidaPreguntas = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3006/partida_preguntas`);
      setPartida_preguntas(data);
    } catch (error) {
      console.log('@@@@ Error GET: partida_preguntas\n', error);
    }
  };

  // obtiene un objeto respuesta
  const getRespuestas = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3006/respuestas`);
      setRespuestas(data);
    } catch (error) {
      console.log('@@@@ Error GET: respuestas\n', error);
    }
  };

  // obtiene un array de todas las estadisticas del jugador
  const getEstadisticas = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:3006/estadisticas/',
        { params: { jugador_id } } // <-- params
      );
      setEstadisticas(data);
    } catch (error) {
      console.log('@@@@ Error GET: estadisticas\n', error);
    }
  };

  // obtiene un array de PartidaJugadores (saber que jugadores jugaron en una partida)
  const getPartidaJugadores = async () => {
    try {
      const { data } = await axios.get('http://localhost:3006/partida_jugadores');
      setPartida_jugadores(data);
    } catch (error) {
      console.log('@@@@ Error GET: partida_jugadores\n', error);
    }
  };

  const inventarioInforCompletaDeTodasLasPartidas = () => {
    if (
      Array.isArray(partidas) &&
      Array.isArray(categorias) &&
      Array.isArray(preguntas) &&
      Array.isArray(partidas)
    ) {
      const partidasById = new Map(partidas.map(p => [p.id, p]));
      const categoriasById = new Map(categorias.map(c => [c.id, c]));
      const preguntasById = new Map(preguntas.map(q => [q.id, q]));

      const ppByPartida = partida_preguntas.reduce((m, pp) => {
        if (!m.has(pp.partida_id)) m.set(pp.partida_id, []);
        m.get(pp.partida_id).push(pp);
        return m;
      }, new Map());

      const contar = (arr) =>
        arr.reduce((acc, k) => ((acc[k] = (acc[k] || 0) + 1), acc), {});

      const joined = estadisticas.map(e => {
        const partida = partidasById.get(e.partida_id) || null;

        const modo = partida?.modo ?? null;
        const categoria_id = partida?.categoria_id ?? null;
        const categoria = categoriasById.get(categoria_id)?.nombre ?? null;
        const created_at = partida?.created_at ?? null;
        const started_at = partida?.started_at ?? null;
        const ended_at = partida?.ended_at ?? null;
        const dificultad_pregunta = partida?.dificultad_pregunta ?? null;
        const dificultad_tiempo = partida?.dificultad_tiempo ?? null;

        const pps = ppByPartida.get(e.partida_id) || [];

        const dificultadesPorPregunta = pps
          .map(pp => {
            const q = preguntasById.get(pp.pregunta_id);
            return q?.dificultad || null;
          })
          .filter(Boolean);

        const resumenDificultad = contar(dificultadesPorPregunta);

        return {
          ...e,
          modo,
          categoria_id,
          categoria,
          created_at,
          started_at,
          ended_at,
          dificultad_pregunta,
          dificultad_tiempo,
          preguntasDeLaPartida: pps.map(
            ({ pregunta_id, orden, question_text_copy, correct_option_id_copy, correct_option_text_copy }) => ({
              pregunta_id,
              orden,
              question_text_copy,
              correct_option_id_copy,
              correct_option_text_copy,
            })
          ),
          dificultad: dificultadesPorPregunta[0],
          resumenDificultad,
          total_preguntas_partida: pps.length,
        };
      });

      return joined;
    } else {
      console.log('Alguno de los arrays no es un array:', { partidas, categorias, preguntas });
      return [];
    }
  };

  // Une el array jugadorAvatares (avatar_id) con el array avatares (id)
  const inventarioIdPartidaSeleccionado = () => {
    if (
      Array.isArray(partidas) &&
      Array.isArray(preguntas) &&
      Array.isArray(partida_jugadores) &&
      Array.isArray(partida_preguntas) &&
      Array.isArray(opciones) &&
      Array.isArray(respuestas)
    ) {
      // id de partida seleccionada
      let idPartida = Number(partidaIdSeleccionada); // convierte el string a int
      //if (typeof idPartida === "string") console.log("Es string");   // true si es string
      //if (typeof idPartida === "number") console.log("Es numero");    // true si es número (NaN incluido)
      //console.log("idPartida", idPartida);

      if (!Number.isFinite(idPartida)) {
        //console.log('partidaIdSeleccionada no es numérico:', idPartida);
      } else {
        // 1) obtiene un objeto de partidas con todos sus atributos segun el id de la partida seleccionada en la lista.
        const partidaDelJugador = partidas.filter((e) => Number(e.id) === idPartida);
        //console.log("array partidaDelJugador:", partidaDelJugador);

        // verifica si la partida existe
        if (partidaDelJugador.length !== 0) {
          // 2.1) obtiene el obj de partida_pregunta.
          const objPartida_Pregunta = partida_preguntas.find((partida_pregunta) => partida_pregunta.partida_id == partidaDelJugador[0].id);
          //console.log("objPartida_Pregunta: ", objPartida_Pregunta);

          // 2.2) obtiene el id de categoria.
          const categoriaIds = partidaDelJugador[0].categoria_id;
          //console.log("array categoriaIds:", categoriaIds); // id: 1 (geografia)

          // 3) obtiene el string categoria
          const objCategoria = categorias.find((category) => category.id == categoriaIds);
          //console.log("objCategoria:", objCategoria);

          // 4) filtra el array preguntas segun el id de categoria y obtiene un array de 10 objetos de preguntas
          const resultDificultad = preguntas.find(
            (pregunta) => pregunta.id == objPartida_Pregunta.pregunta_id
          );
          //console.log("array resultDificultad:", resultDificultad);

          // 5) obtiene el valor string de la dificultad del objeto pregunta (categoria_id)
          const dificultadPregunta = resultDificultad.dificultad;
          //console.log("dificultadPregunta:", dificultadPregunta);

          // 6) obtiene el objeto partida_jugadores asi se puede ver los id/s de los jugador/es de la partida
          const jugadoresDeUnaPartdia = partida_jugadores.find(
            (e) => Number(e.partida_id) === idPartida
          );
          //console.log("jugadoresDeUnaPartdia:", jugadoresDeUnaPartdia);

          // 7) obtiene un array donde se verifica las preguntas que se eligieron al azar el orden de la partida (partida_preguntas)
          const preguntasDeLaPartida = partida_preguntas.filter(
            (e) => Number(e.partida_id) === idPartida
          );
          //console.log("preguntasDeLaPartida:", preguntasDeLaPartida);

          // 8) obtiene un array de las respuestas que el jugador selecciono en la partida (respuestas)
          const respuestasDeLaPartida = respuestas.filter(
            (e) => Number(e.partida_id) === idPartida
          );
          //console.log("respuestasDeLaPartida:", respuestasDeLaPartida);

          // 9) se crea un array indexado donde los elementos son  id de opciones de respuesta del array respuestasDeLaPartida
          const arrayPreguntasIdsDeLaPartida = respuestasDeLaPartida.map((opcion) => ({
            opcionId: opcion.opcion_elegida_id,
            pregunta_id: opcion.pregunta_id,
            es_correcta: opcion.es_correcta,
          })); // es_correcta se puede eliminar
          //console.log("arrayPreguntasIdsDeLaPartida:", arrayPreguntasIdsDeLaPartida);

          // 10) obtiene un array de opciones de respuestas segun la preguntas. como hay 10 preguntas, va haber 40 opciones de respuestas
          // 10.1) Normalizá y armá un Set con los preguntaId de la partida
          const preguntaIdsSet = new Set(
            (arrayPreguntasIdsDeLaPartida ?? []).map((x) => Number(x.pregunta_id))
          );
          // array con los ids de preguntas
          //console.log(preguntaIdsSet);

          // 10.2) Filtrá opciones por partida y por pertenencia de pregunta_id al Set
          const opcionesDeLaPartida = (opciones ?? []).filter(
            (o) => Number(o.pregunta_id) && preguntaIdsSet.has(Number(o.pregunta_id))
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
      console.log('Alguno de los arrays no es un array:', {
        partidas,
        preguntas,
        partida_jugadores,
        partida_preguntas,
        opciones,
        respuestas,
      });
      return null;
    }
  };

  // si cambia la fuente, reseteamos filtro (sincroniza)
  useEffect(() => {
    setListaFiltrada(listaObjetosPartidaInformacion);
  }, [listaObjetosPartidaInformacion]);


  // construye el “texto buscable” para cada item
  const buildHaystack = (e) => {
    const etiquetaPractica =
      e?.modo === "individual"
        ? "practica"
        : e?.modo === "multijugador"
          ? "multijugador"
          : "";

    const fecha = formatDateDMYLocal(e?.ended_at) ?? "-";   // ej: 11/11/2025
    const hora = formatTimeHMLocal(e?.ended_at) ?? "-";    // ej: 23:35
    const modo = modeTranslations[e?.modo] ?? e?.modo ?? "";
    const cat = categoryTranslations[e?.categoria] ?? e?.categoria ?? "";

    // dificultad de PREGUNTA (texto traducido o crudo)
    const diffPregunta =
      difficultyTranslations[e?.dificultad_pregunta ?? e?.dificultad] ??
      (e?.dificultad_pregunta ?? e?.dificultad ?? "");

    // dificultad de TIEMPO (texto traducido o crudo)
    const diffTiempo =
      timeDifficultyTranslations?.[e?.dificultad_tiempo] ??
      (e?.dificultad_tiempo ?? "");

    return normalize(
      [etiquetaPractica, fecha, hora, modo, cat, diffPregunta, diffTiempo]
        .filter(Boolean)
        .join(" ")
    );
  };

  // buscador de partidas
  const handleSearch = () => {
    const q = normalize(search);
    if (!q) {
      setListaFiltrada(listaObjetosPartidaInformacion); // reset si vacío
      return;
    }
    const tokens = q.split(/[\s,]+/).filter(Boolean);
    const filtrados = listaObjetosPartidaInformacion.filter((e) => {
      const haystack = buildHaystack(e);
      return tokens.every(tok => haystack.includes(tok));
    });
    setListaFiltrada(filtrados);
  };

  // ENTER dispara búsqueda
  const onKeyDownSearch = (ev) => {
    if (ev.key === "Enter") handleSearch();
  };

  // si borrás todo, resetea automáticamente
  const onChangeSearch = (ev) => {
    const val = ev.target.value;
    setSearch(val);
    if (val.trim() === "") {
      setListaFiltrada(listaObjetosPartidaInformacion); // volver al estado original
    }
  };

  // botón para limpiar
  const handleClear = () => {
    setSearch("");
    setListaFiltrada(listaObjetosPartidaInformacion);
  };

  // helper para saber si hay consulta activa
  const hasQuery = normalize(search) !== "";

  const getJugador = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3006/jugadores/${id}`);
      return data ?? null;
    } catch (e) {
      console.error('GET /jugadores/:id', e.response?.data?.error || e.message);
      return null;
    }
  };

  const getUsuario = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3006/users/${id}`);
      if (!data) return null;
      const { password, ...safe } = data;
      return safe;
    } catch (e) {
      console.error('GET /users/:id', e.response?.data?.error || e.message);
      return null;
    }
  };

  const segundaParteInvetario = () => {
    if (Array.isArray(arraySalaJugadores)) {
    } else {
      console.log('No es un array:');
    }
  };

  // toggle para abri una o mas preguntas en el detalle completo de una partida
  const togglePregunta = (id) => {
    setOpenPreguntaIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };



  const formatDateDMYLocal = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString); // interpreta el ISO en UTC y lo muestra en hora local
    if (isNaN(d)) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0'); // 0-based
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatTimeHMLocal = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString); // interpreta en UTC si trae Z; si no, como local
    if (isNaN(d)) return '';
    const dPlus3 = new Date(d.getTime() + 3 * 60 * 60 * 1000);
    const hh = String(dPlus3.getHours()).padStart(2, '0');
    const mm = String(dPlus3.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
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
    if (!Number.isFinite(n) || n < 0) return '—';

    const m = Math.floor(n / 60000)
      .toString()
      .padStart(2, '0');
    const s = Math.floor((n % 60000) / 1000)
      .toString()
      .padStart(2, '0');
    const x = Math.floor(n % 1000)
      .toString()
      .padStart(3, '0');

    return `${m}:${s}.${x}`;
  };

  // ej: fmtMsDetallado(600000);   // "10 minutos, 0 segundos, 0 milisegundos"
  const fmtMsDetallado = (ms) => {
    const n = Number(ms);
    if (!Number.isFinite(n) || n < 0) return '—';

    const minutos = Math.floor(n / 60000);
    const segundos = Math.floor((n % 60000) / 1000);
    const milis = Math.floor(n % 1000);

    return `${minutos} ${t('minutes')}, ${segundos} ${t('seconds')}, ${milis} ${t('milliseconds')}`;
  };

  const fmtMs = (ms) => (Number(ms) / 1000).toFixed(1) + ' segundos';

  // 1) Todas las respuestas de la partida
  const respuestasBrutas = objetoPartidaCompleto?.respuestasDeLaPartida ?? [];

  // 2) Me quedo SOLO con las respuestas del jugador logueado
  const respuestasEspecificas = respuestasBrutas.filter(
    (r) => Number(r.jugador_id) === Number(jugador_id)
  );

  // 3) A partir de ahí armo los Maps
  const elegidaPorPregunta = new Map(
    respuestasEspecificas.map((r) => [Number(r.pregunta_id), Number(r.opcion_elegida_id)])
  );

  const correctaPorPregunta = new Map(
    respuestasEspecificas.map((r) => [Number(r.pregunta_id), Number(r.es_correcta) > 0])
  );

  const tiempoPorPregunta = new Map(
    respuestasEspecificas.map((r) => [Number(r.pregunta_id), Number(r.tiempo_respuesta_ms)])
  );

  const getFriendRequests = async () => {
    try {
      if (!jugador_id) return; // por las dudas

      const { data } = await axios.get("http://localhost:3006/amigos", {
        params: { amigo_id: jugador_id }, // 👈 ahora jugador_id
      });

      // solo solicitudes pendientes
      const pendientes = (data ?? []).filter((a) => !a.aceptado_en);
      setFriendRequests(pendientes);
    } catch (error) {
      console.log("@@@@ Error GET: friend requests\n", error);
    }
  };

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
          getFriendRequests(),
        ]);
      } finally {
        if (!alive) return;
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1) para inventarioIdPartidaSeleccionado -  efecto a
  useEffect(() => {
    const obj = inventarioIdPartidaSeleccionado(); // función pura
    if (!obj) return;
    setObjetoPartidaCompleto(obj); // guardo base
    setSalaId(obj.partida?.[0]?.sala_id ?? null); // dispara fetch en efecto B
  }, [
    partidas,
    preguntas,
    categorias,
    partida_jugadores,
    partida_preguntas,
    opciones,
    respuestas,
    partidaIdSeleccionada,
  ]);

  // 2)  efecto b
  useEffect(() => {
    if (salaId == null) {
      setArraySalaJugadores([]);
      return;
    }
    getArraySalaJugadores(salaId); // no retorna; sólo setea el estado
  }, [salaId]);

  // 3)  efecto c
  useEffect(() => {
    if (!objetoPartidaCompleto) return;

    const prevSala = Array.isArray(objetoPartidaCompleto.sala_jugadores)
      ? objetoPartidaCompleto.sala_jugadores
      : [];

    const nuevoObj = {
      ...objetoPartidaCompleto,
      sala_jugadores: [...prevSala, ...arraySalaJugadores],
    };

    setObjetoPartidaCompleto(nuevoObj);
  }, [arraySalaJugadores]);

  const [arrayUsuariosJugadores, setArrayUsuariosJugadores] = useState([]);

  // Efecto D: a partir de arraySalaJugadores → traer jugadores y usuarios y componer
  useEffect(() => {
    let cancel = false;

    (async () => {
      // Reset si no hay sala_jugadores
      if (!Array.isArray(arraySalaJugadores) || arraySalaJugadores.length === 0) {
        if (!cancel) setArrayUsuariosJugadores([]);
        return;
      }

      // 1) IDs únicos de jugadores (normalizados a número)
      const jugadorIds = [
        ...new Set(
          arraySalaJugadores.map((sj) => Number(sj?.jugador_id)).filter((n) => Number.isFinite(n))
        ),
      ];
      // console.log('1) jugadorIds:', jugadorIds);

      // 2) Traer jugadores en paralelo
      const jugadoresArr = await Promise.all(jugadorIds.map((id) => getJugador(id)));
      const jugadores = jugadoresArr.filter(Boolean).map((j) => {
        const id = Number(j.id ?? j.jugador_id);
        const user_id = Number(j.user_id ?? j.usuario_id ?? j.userId);
        return { ...j, id, user_id: Number.isFinite(user_id) ? user_id : null };
      });
      // console.log('2) jugadores:', jugadores);

      // Diccionario por id de jugador
      const jugadoresById = Object.fromEntries(jugadores.map((j) => [String(j.id), j]));

      // 3) IDs únicos de usuarios (desde jugadores)
      const userIds = [
        ...new Set(jugadores.map((j) => Number(j.user_id)).filter((n) => Number.isFinite(n))),
      ];
      // console.log('3) userIds:', userIds);

      // 4) Traer usuarios en paralelo
      const usuariosArr = await Promise.all(userIds.map((id) => getUsuario(id)));
      const usuarios = usuariosArr.filter(Boolean).map((u) => {
        const id = Number(u.id ?? u.user_id ?? u.usuario_id ?? u.userId);
        const { password, pass, ...safe } = u; // por si llegara a venir
        return { ...safe, id };
      });
      // console.log('4) usuarios:', usuarios);

      // Diccionario por id de usuario
      const usuariosById = Object.fromEntries(usuarios.map((u) => [String(u.id), u]));

      // 5) Componer: a cada sala_jugador le pego su jugador y su usuario
      const compuesto = arraySalaJugadores.map((sj) => {
        const jugador = jugadoresById[String(Number(sj?.jugador_id))] || null;
        const uid = jugador?.user_id ?? null;
        const usuario = uid != null ? usuariosById[String(Number(uid))] || null : null;
        return { ...sj, jugador, usuario };
      });

      if (!cancel) {
        // Reemplazo directo (lo más simple y evita duplicados)
        setArrayUsuariosJugadores(compuesto);

        // Si querés ACUMULAR sin duplicar por sala_id+jugador_id, usá esto en cambio:
        // setArrayUsuariosJugadores(prev => {
        //   const seen = new Set(prev.map(x => `${x.sala_id}-${x.jugador_id}`));
        //   const nuevos = compuesto.filter(x => !seen.has(`${x.sala_id}-${x.jugador_id}`));
        //   return [...prev, ...nuevos];
        // });
      }
    })();

    return () => {
      cancel = true;
    };
  }, [arraySalaJugadores]);

  //Inyectando al objetoPartidaCompleto sin loops
  /*useEffect(() => {
    if (!objetoPartidaCompleto) return;
    objetoPartidaCompletobjetoPartidaCompleto(prev => ({
      ...prev,
      usuarios_jugadores: arrayUsuariosJugadores,  // o el nombre que prefieras
    }));
  }, [arrayUsuariosJugadores]);*/

  useEffect(() => {
    const objDos = inventarioInforCompletaDeTodasLasPartidas(); // debe ser una funcion pura (sin setState adentro)
    setListaObjetosPartidaInformacion((prev) =>
      JSON.stringify(prev) === JSON.stringify(objDos) ? prev : objDos
    );
  }, [partidas, preguntas, categorias, estadisticas]);

  //
  const algunModalAbierto =
    selectedPerfil || selectedEstadisticas || modalEstadisticaAbierto || selectedAvatar !== null;
  useEffect(() => {
    if (!algunModalAbierto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [algunModalAbierto]);

  // console.log(partidaIdSeleccionada);

  // Buscar la partida seleccionada por partidaIdSeleccionada
  const partidaSeleccionada =
    listaObjetosPartidaInformacion?.find(
      (p) => Number(p.partida_id) === Number(partidaIdSeleccionada)
    ) ?? null;

  // Sala actual de la partida (si existe)
  const salaIdActual = objetoPartidaCompleto?.partida?.[0]?.sala_id ?? null;

  // Jugadores que participaron en esa sala
  const jugadoresSalaActual = Array.isArray(arrayUsuariosJugadores)
    ? arrayUsuariosJugadores.filter(
      (sj) =>
        salaIdActual != null &&
        Number(sj.sala_id) === Number(salaIdActual)
    )
    : [];

  // Contrincantes = todos menos el jugador logueado
  const contrincantes = jugadoresSalaActual.filter(
    (sj) => Number(sj.jugador_id) !== Number(jugador_id)
  );

  // Por ahora mostramos solo el primero (si hay)
  const contrincante = contrincantes[0] ?? null;

  // Relación (si existe) entre YO y el contrincante
  const relacionConContrincante = contrincante
    ? amigos.find((a) => {
      const miJid = Number(jugador_id);
      const otroJid = Number(contrincante?.jugador?.id);

      const jidA = Number(a.jugador_id);
      const jidB = Number(a.amigo_id);

      // ¿La relación es entre yo y el contrincante, en cualquier orden?
      const esMismaPareja =
        (jidA === miJid && jidB === otroJid) ||
        (jidA === otroJid && jidB === miJid);

      return esMismaPareja;
    })
    : null;

  const esAmigo = !!relacionConContrincante && !!relacionConContrincante.aceptado_en;
  const pendienteConContrincante =
    !!relacionConContrincante && !relacionConContrincante.aceptado_en;


  const handleAceptarSolicitud = async (solicitudId) => {
    try {
      setProcessingRequestId(solicitudId);

      const aceptado_en = new Date().toISOString();
      const idNum = Number(solicitudId);

      // 1) Aviso al backend que esta solicitud quedó aceptada
      await axios.put(`http://localhost:3006/amigos/${solicitudId}`, {
        aceptado_en,
      });

      // 2) La saco de las solicitudes pendientes (UI de arriba)
      setFriendRequests((prev) =>
        prev.filter((r) => Number(r.id) !== idNum)
      );

      // 3) Actualizo "amigos" localmente para que el effect de friendsDetails la vea
      setAmigos((prev) => {
        // ¿ya existe un registro con ese id en amigos?
        const existe = prev.some((a) => Number(a.id) === idNum);

        if (existe) {
          // lo actualizo agregando aceptado_en
          return prev.map((a) =>
            Number(a.id) === idNum ? { ...a, aceptado_en } : a
          );
        }

        // si no existe, la busco en friendRequests (estado actual del componente)
        const original = friendRequests.find(
          (r) => Number(r.id) === idNum
        );

        if (original) {
          // la agrego con aceptado_en seteado
          return [...prev, { ...original, aceptado_en }];
        }

        // fallback: si no la encuentro, devuelvo igual
        return prev;
      });
    } catch (err) {
      console.error('Error al aceptar solicitud:', err);
    } finally {
      setProcessingRequestId(null);
    }
  };




  const handleRechazarSolicitud = async (solicitudId) => {
    try {
      setProcessingRequestId(solicitudId);
      await axios.delete(
        `http://localhost:3006/amigos/eliminar/${solicitudId}`
      );
      setFriendRequests((prev) => prev.filter((r) => r.id !== solicitudId));
    } catch (err) {
      console.error("Error al rechazar solicitud:", err);
    } finally {
      setProcessingRequestId(null);
    }
  };


  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        const aceptados = (amigos ?? [])
          .filter(Boolean)
          .filter((a) => !!a.aceptado_en);

        if (!aceptados.length) {
          if (!cancel) setFriendsDetails([]);
          return;
        }

        const miJid = Number(jugador_id); // 👈 tu jugador_id

        const detalles = await Promise.all(
          aceptados.map(async (a) => {
            // Detectar quién es "el otro":
            const jidA = Number(a.jugador_id);
            const jidB = Number(a.amigo_id);

            const otroJugadorId =
              miJid === jidA
                ? jidB        // yo soy jugador_id → amigo es el otro
                : miJid === jidB
                  ? jidA        // yo soy amigo_id → jugador_id es el otro
                  : jidB;       // fallback por las dudas

            const jugador = await getJugador(otroJugadorId).catch((err) => {
              console.error('Error en getJugador(otroJugadorId):', otroJugadorId, err);
              return null;
            });

            let usuario = null;
            if (jugador?.user_id) {
              usuario = await getUsuario(jugador.user_id).catch((err) => {
                console.error('Error en getUsuario(jugador.user_id):', jugador.user_id, err);
                return null;
              });
            }

            return { amigo: a, jugador, usuario };
          })
        );

        if (!cancel) {
          setFriendsDetails(detalles);
        }
      } catch (err) {
        console.error('Error construyendo friendsDetails:', err);
        if (!cancel) setFriendsDetails([]);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [amigos, jugador_id]); // 👈 agregá jugador_id en deps




  useEffect(() => {
    (async () => {
      if (!friendRequests.length) {
        setFriendRequestsDetails([]);
        return;
      }

      const detalles = await Promise.all(
        friendRequests.map(async (req) => {
          const jugador = await getJugador(req.jugador_id);
          let usuario = null;
          if (jugador?.user_id) {
            usuario = await getUsuario(jugador.user_id);
          }
          return { solicitud: req, jugador, usuario };
        })
      );

      setFriendRequestsDetails(detalles);
    })();
  }, [friendRequests]);

  // useEffect(() => {
  //   console.log('📌 amigos:', amigos);
  //   console.log('📌 friendsDetails:', friendsDetails);
  // }, [amigos, friendsDetails]);

  // verifica datos para correr perfil o envia mensaje de errores visual en la interfaz
  if (!userId) return <p className='text-red-600'>{t('noUser')}.</p>;
  if (error)
    return (
      <p className='text-red-600'>
        {t('error')}: {error}
      </p>
    );
  if (loadingPerfil) return <p className='text-white'>{t('loadingPerfil')}</p>;
  if (!perfil) return <p className='text-red-600'>{t('noPerfil')}.</p>;


  return (
    <div className='w-[70%] mb-6 mt-20'>
      {/* perfil */}
      <div className='flex flex-col items-center h-fit w-full'>
        <motion.div
          className='h-32 w-32 bg-gray-200/90 hover:bg-gray-300/90 rounded-full cursor-pointer  text-black text-6xl text-center flex items-center justify-center'
          whileTap={{ scale: 1.2 }}
          onClick={() => setSelectedPerfil(true)}
          role='button'
          aria-pressed={selectedPerfil}
        >
          {foto == null ? (
            <p>👤</p>
          ) : (
            <img
              src={
                preview
                  ? preview
                  : perfil?.foto_perfil
                    ? `${API}${perfil.foto_perfil}` // el server devuelve ruta relativa
                    : 'https://placehold.co/128x128?text=Foto' // placeholder opcional
              }
              alt='Foto de perfil'
              className='w-32 h-32 rounded-full object-cover bg-white/20'
            />
          )}
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
            className='fixed inset-0 z-40 
              bg-black/5 backdrop-blur-sm 
                flex items-center justify-center mt-22'
          >
            <button
              type='button'
              aria-label='Cerrar'
              className='absolute top-2 right-2 rounded-full w-9 h-9 
                              grid place-items-center text-red-600 hover:text-red-500 active:scale-95 
                              cursor-pointer text-2xl'
              onClick={() => setSelectedPerfil(false)}
            >
              ✕
            </button>

            <div className='relative inline-block'>
              {foto == null ? (
                <p className='text-[190px] bg-gray-200/90 rounded-full text-center'>👤</p>
              ) : (
                <img
                  src={
                    preview
                      ? preview
                      : perfil?.foto_perfil
                        ? `${API}${perfil.foto_perfil}` // el server devuelve ruta relativa
                        : 'https://placehold.co/128x128?text=Foto' // placeholder opcional
                  }
                  alt='Foto de perfil'
                  className='w-68 h-68 rounded-full object-cover bg-white/20'
                />
              )}

              {selectedPefilEditar ? (
                <div
                  className='absolute left-8 top-56 
                      
                    bg-white text-black rounded-2xl px-3 py-3'
                >
                  <ul>
                    {/* Elegir de la biblioteca */}

                    <li className='flex flex-row gap-2'>
                      <div>
                        {/* Input file oculto */}
                        <input
                          id='file-picker'
                          ref={fileInputRef}
                          type='file'
                          accept='image/*'
                          className='sr-only'
                          onChange={onPickFile}
                        />

                        {/* Botón visible */}
                        <label
                          htmlFor='file-picker'
                          className='rounded-md text-black hover:text-gray-600 cursor-pointer'
                        >
                          Elegir de la biblioteca
                        </label>

                        <div className='flex flex-row'>
                          {/* Guardar */}
                          {preview && (
                            <button
                              type='button'
                              onClick={subirFoto}
                              disabled={subiendo}
                              className='p-1 rounded-md bg-violet-600 hover:bg-violet-800 text-white disabled:opacity-50 cursor-pointer'
                            >
                              {subiendo ? 'Subiendo...' : 'Guardar foto'}
                            </button>
                          )}

                          {/* Cancelar */}
                          {preview && (
                            <button
                              type='button'
                              onClick={cancelarFotoLocal}
                              className='ml-2 px-3 py-1.5 rounded-md bg-gray-600 hover:bg-gray-800  text-white cursor-pointer'
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
                          <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center'>
                            <div className='bg-white rounded-2xl p-4 w-[90vw] max-w-xl'>
                              <div className='relative w-full h-[60vh] max-h-[70vh] bg-black/5 rounded'>
                                {tempImageUrl && (
                                  <Cropper
                                    image={tempImageUrl}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1} // cuadrado (ideal para avatar)
                                    cropShape='round' // círculo visual (opcional)
                                    showGrid={false}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                  />
                                )}
                              </div>

                              {/* Controles */}
                              <div className='mt-4 flex items-center justify-between'>
                                <input
                                  type='range'
                                  min={1}
                                  max={3}
                                  step={0.01}
                                  value={zoom}
                                  onChange={(e) => setZoom(Number(e.target.value))}
                                  className='w-2/3 cursor-pointer'
                                />
                                <div className='flex gap-2'>
                                  <button
                                    type='button'
                                    className='px-3 ml-1 py-1.5 rounded bg-gray-200 hover:bg-gray-400 cursor-pointer'
                                    onClick={cancelarCrop}
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type='button'
                                    className='px-3 py-1.5 rounded bg-violet-600 hover:bg-violet-800 text-white cursor-pointer'
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
                        type='button'
                        aria-label='Cerrar'
                        className='text-end rounded-full w-3 h-6 hover:text-red/5 cursor-pointer text-md text-red-600 hover:text-red-500'
                        onClick={() => setSelectedPefilEditar(false)}
                      >
                        ✕
                      </button>
                    </li>

                    <li className='cursor-pointer hover:text-gray-600'>Elegir un avatar</li>
                    {foto && (
                      <li className='cursor-pointer hover:text-red-700 text-red-500'>
                        <button
                          type='button'
                          onClick={eliminarFoto}
                          disabled={eliminando}
                          className=' cursor-pointer hover:text-red-500 text-red-600 disabled:opacity-50'
                        >
                          {eliminando ? 'Eliminando...' : 'Eliminar foto'}
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              ) : (
                <motion.button
                  type='button'
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className='absolute left-46 top-60 -translate-y-1/2 ml-4
                                rounded-full px-2 py-2 bg-black text-white 
                                cursor-pointer text-sm'
                  aria-pressed={selectedPefilEditar}
                  onClick={() => setSelectedPefilEditar(true)}
                >
                  Editar
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
        <p className='mt-2 text-4xl text-white'>{perfil.name}</p>
        <p className='text-gray-400 text-xl mt-4'>
          {t('points')}: {user.puntaje}
        </p>
      </div>

      {/* ====================================================================================== */}

      {/* boton "mis avatares" */}
      <div className='flex flex-col items-center mt-6 h-fit w-full'>
        <motion.button
          className='bg-fuchsia-500 hover:bg-pink-500/90 text-white rounded-xl w-32 h-8 mb-4 cursor-pointer'
          whileTap={{ scale: 1.2 }}
          onClick={() => {
            setSelectedAvatar(true);
          }}
          type='button'
        //aria-pressed={selectedAvatar}
        >
          {t('myavatars')}
        </motion.button>

        {/* lista de avatares del jugador */}
        {inventarioAvataresDos().length === 0 && selectedAvatar ? (
          <div>
            <div className='fixed h-full inset-0 z-50 bg-black/50 backdrop-blur-sm'>
              <motion.div
                onClick={(e) => e.stopPropagation()} // evita que el click burbujee al overlay
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      w-full max-w-8/12 h-fit rounded-2xl bg-indigo-900 text-white p-6 shadow-2xl'
              >
                <button
                  type='button'
                  aria-label='Cerrar'
                  className='absolute top-2 right-2 rounded-full w-9 h-9 
                              grid place-items-center hover:bg-black/5 active:scale-95 
                              cursor-pointer text-2xl'
                  onClick={() => setSelectedAvatar(null)}
                >
                  ✕
                </button>
                <h2 className='w-48 p-2'>{t('avatarsList')}</h2>

                <hr />

                <p className='mt-3 text-center'>{t('noHaveAvatars')}</p>
              </motion.div>
            </div>
          </div>
        ) : (
          <div>
            {selectedAvatar && (
              <div className='fixed h-full inset-0 z-50 bg-black/50 backdrop-blur-sm'>
                <motion.div
                  onClick={(e) => e.stopPropagation()} // evita que el click burbujee al overlay
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      w-full max-w-8/12 h-fit rounded-2xl bg-indigo-900 text-white p-6 shadow-2xl'
                >
                  <button
                    type='button'
                    aria-label='Cerrar'
                    className='absolute top-2 right-2 rounded-full w-9 h-9 
                              grid place-items-center hover:bg-black/5 active:scale-95 
                              cursor-pointer text-2xl'
                    onClick={() => setSelectedAvatar(null)}
                  >
                    ✕
                  </button>

                  <div>
                    <h2 className='w-48 p-2'>Lista de mis avatares</h2>

                    <hr />

                    <ul className='flex flex-row gap-3 mt-4 w-full max-w-md'>
                      {inventarioAvataresDos().map((item) => (
                        <motion.li
                          key={`${item.id}`}
                          className='border rounded-xl p-3 bg-white/10 hover:bg-white/20 cursor-pointer'
                          whileTap={{ scale: 1.02 }}
                          onClick={() => {
                            setAvatarIdSeleccionado(item.id);
                          }}
                        >
                          <div>
                            <img
                              src={item.preview_url}
                              alt={`Imagen del avatar ${item.nombre}`}
                              className='flex w-40 h-50 object-cover rounded-full p-4'
                            />
                          </div>
                          <div className='flex flex-col items-center'>
                            <span className='font-semibold text-center'>{item.nombre}</span>
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
      <div className='mt-4 space-y-4'>
        <h2 className='text-xl text-white font-semibold'>{t('personalData')}</h2>
        {!editMode ? (
          <div className='space-y-2 bg-white/10 text-white p-4 text-xl rounded-xl'>
            <p>
              <b>{t('formName')}:</b> {perfil.name}
            </p>
            <p>
              <b>{t('email')}:</b> {perfil.email}
            </p>
            <p>
              <b>{t('pass')}:</b> ••••••
            </p>
            <button
              className='px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              onClick={() => {
                setEditMode(true);
                setForm({
                  name: perfil.name || '',
                  email: perfil.email || '',
                  password: '',
                  confirmPassword: '',
                });
                setFormErrors({});
              }}
            >
              {t('editData')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className='space-y-3 bg-white/10 text-white p-4 rounded-xl'>
            <div>
              <label className='block text-sm mb-1'>{t('name')}</label>
              <input
                name='name'
                value={form.name}
                onChange={handleChange}
                className='w-full px-3 py-2 rounded text-black bg-white/90 hover:bg-white'
                placeholder='Tu nombre'
              />
              {formErrors.name && <p className='text-red-500 text-sm'>{formErrors.name}</p>}
            </div>

            <div>
              <label className='block text-sm mb-1'>{t('email')}</label>
              <input
                name='email'
                value={form.email}
                onChange={handleChange}
                className='w-full px-3 py-2 rounded text-black bg-white/90 hover:bg-white'
                placeholder='tu@email.com'
              />
              {formErrors.email && <p className='text-red-500 text-sm'>{formErrors.email}</p>}
            </div>

            <div>
              <label className='block text-sm mb-1'>{t('pass')}</label>
              <input
                type='password'
                name='password'
                value={form.password}
                onChange={handleChange}
                className='w-full px-3 py-2 rounded text-black bg-white/90 hover:bg-white'
                placeholder={t('newPass')}
              />
              {formErrors.password && <p className='text-red-500 text-sm'>{formErrors.password}</p>}
            </div>

            <div>
              <label className='block text-sm mb-1'>Confirmar contraseña</label>
              <input
                type='password'
                name='confirmPassword'
                value={form.confirmPassword}
                onChange={handleChange}
                className='w-full px-3 py-2 rounded text-black bg-white/90 hover:bg-white'
                placeholder='Repetí la nueva contraseña'
              />
              {formErrors.confirmPassword && (
                <p className='text-red-500 text-sm'>{formErrors.confirmPassword}</p>
              )}
            </div>

            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={saving}
                className='px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 cursor-pointer'
              >
                {saving ? t('saving') : t('save')}
              </button>
              <button
                type='button'
                onClick={() => {
                  setEditMode(false);
                  setFormErrors({});
                  setForm({
                    name: perfil.name || '',
                    email: perfil.email || '',
                    password: '',
                    confirmPassword: '',
                  });
                }}
                className='px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 cursor-pointer'
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ================= estadisticas ===================================================================== */}

      {selectedEstadisticasResultadosDePartidas ? (
        <div>
          {/* Estadísticas */}
          <div className='flex flex-row gap-2 mt-4'>
            <button>
              <h2 className='text-xl font-semibold mb-3 mt-3 text-fuchsia-500/95 p-1'>
                {t('machtResults')}
              </h2>
            </button>
            <h2 className='text-xl text-white flex items-center justify-center p-1'>|</h2>
            <button
              type='button'
              onClick={() => {
                setSelectedEstadisticasResultadosDePartidas(false);
              }}
            >
              <h2 className='text-xl text-white font-semibold mb-3 mt-3 cursor-pointer hover:text-fuchsia-500/95  p-1'>
                {t('stadisticGrafict')}
              </h2>
            </button>
          </div>

          {estadisticas.length === 0 ? (
            <p className='indent-2 text-white'>
              {'No encontramos resultados' ?? t('noResultsMatches')}:
            </p>
          ) : (
            <div>
              {/* buscador de estadísticas */}
              <div className='relative inline-block mb-4'>
                <input
                  className='bg-white/95 w-96 indent-2 border rounded-xl px-1 py-2 text-black placeholder-black/70 hover:bg-white'
                  placeholder={t('findAMatch')}
                  value={search}
                  onChange={onChangeSearch}
                  onKeyDown={onKeyDownSearch}
                />
                {search && (
                  <button
                    type='button'
                    onClick={handleClear}
                    className='absolute top-0 right-8 h-full px-2 text-slate-600 hover:text-black cursor-pointer'
                    aria-label='Limpiar búsqueda'
                    title='Limpiar'
                  >
                    ✕
                  </button>
                )}

                <button
                  type='button'
                  onClick={handleSearch}
                  className='absolute h-full top-0 right-0 flex items-center rounded-r-xl 
                bg-slate-800 hover:bg-slate-700 px-2 border border-transparent text-sm transition-all 
                  shadow-sm hover:shadow text-white cursor-pointer'
                >
                  {/* ícono lupa */}
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='w-4 h-4'
                  >
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z'
                    />
                  </svg>
                </button>
              </div>

              {/* listado / mensaje */}
              {(listaFiltrada?.length ?? 0) === 0 && hasQuery ? (
                <div className='p-3 rounded-xl bg-white/10 text-white'>
                  {'No encontramos resultados' ?? t('noResults')}: <b> "{search}"</b>
                </div>
              ) : (
                <ul className=''>
                  {/* {console.log('visible: ', visible)} */}
                  {(visible ?? []).map((e, index) => {
                    const globalIndex = startIndex + index; // índice global del item
                    return (
                      <motion.li
                        key={e.id}
                        className='border rounded-xl p-4 bg-white/10 hover:bg-white/20 
                        flex space-x-4 mb-2 cursor-pointer'
                        whileTap={{ scale: 1.05 }}
                        onClick={() => {
                          // si lo querés para resaltar el li, usamos el índice global
                          setSelectedEstadisticas(globalIndex);
                          // esta es la clave real que usaremos en el modal
                          setPartidaIdSeleccionada(e.partida_id);
                          setModalEstadisticaAbierto(true);
                        }}
                      >
                        {e.posicion > 0 ? (
                          <div className='flex flex-row gap-5'>
                            {e?.modo == 'individual' ? (
                              <p className='text-yellow-400'>Práctica</p>
                            ) : (
                              <p className='text-green-500'>{t('youWon')}</p>
                            )}
                            <p className='text-white'>
                              {t('date')}: {formatDateDMYLocal(e?.ended_at) ?? '-'}
                            </p>
                            <p className='text-white'>
                              {t('dateHs')}: {formatTimeHMLocal(e?.ended_at) ?? '-'}
                            </p>
                            <p className='text-white'>
                              {t('mode')}: {modeTranslations[e?.modo] ?? '-'}
                            </p>
                            <p className='text-white'>
                              {t('category')}:{' '}
                              {categoryTranslations[e?.categoria] ?? '-'}
                            </p>
                            <p className='text-white'>
                              {t('dificultyquestion')}:{' '}
                              {difficultyTranslations[e?.dificultad] ?? '-'}
                            </p>
                            <p className='text-white'>
                              {t('dificultytime')}:{' '}
                              {timeDifficultyTranslations[e?.dificultad_tiempo] ?? '-'}
                            </p>
                          </div>
                        ) : (
                          <div className='flex flex-row gap-5'>
                            {e?.modo == 'individual' ? (
                              <p className='text-yellow-400'>Práctica</p>
                            ) : (
                              <p className='text-red-500'>{t('youLoss')}</p>
                            )}
                            <p className='text-white'>
                              {t('date')}: {formatDateDMYLocal(e?.ended_at) ?? '-'}
                            </p>
                            <p className='text-white'>
                              {t('dateHs')}: {formatTimeHMLocal(e?.ended_at) ?? '-'}
                            </p>
                            <p className='text-white'>
                              {t('mode')}: {modeTranslations[e?.modo] ?? '-'}
                            </p>
                            <p className='text-white'>
                              {t('category')}:{' '}
                              {categoryTranslations[e?.categoria] ?? '-'}
                            </p>
                            <p className='text-white'>
                              {t('dificultyquestion')}:{' '}
                              {difficultyTranslations[e?.dificultad] ?? '-'}
                            </p>
                            <p className='text-white'>
                              {t('dificultytime')}:{' '}
                              {timeDifficultyTranslations[e?.dificultad_tiempo] ?? '-'}
                            </p>
                          </div>
                        )}
                      </motion.li>
                    );
                  })}
                </ul>
              )}

              {/* Paginado: aparece solo si hay más de 5 */}
              {total > PAGE_SIZE && (
                <div className='mt-3 flex items-center justify-between gap-2'>
                  <span className='text-white/80 text-sm'>
                    {'Mostrando' ?? t('showing')} {startIndex + 1}–{endIndex}{' '}
                    {'de' ?? t('of')} {total}
                  </span>

                  <div className='flex items-center gap-1'>
                    <button
                      type='button'
                      onClick={goPrev}
                      disabled={currentPage === 1}
                      className='px-3 py-1 rounded-lg bg-white/10 text-white disabled:opacity-50 hover:bg-white/20'
                    >
                      ‹
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type='button'
                        onClick={() => goTo(p)}
                        className={`px-3 py-1 rounded-lg ${p === currentPage
                          ? 'bg-slate-800 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      type='button'
                      onClick={goNext}
                      disabled={currentPage === totalPages}
                      className='px-3 py-1 rounded-lg bg-white/10 text-white disabled:opacity-50 hover:bg-white/20'
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* div overlay absoluto en toda la pantalla) */}
          {selectedEstadisticas !== null && partidaSeleccionada && (
            <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm mt-22 '>
              {/* fonde desenfocado */}
              <motion.div
                onClick={(e) => e.stopPropagation()} // evita que el click burbujee al overlay
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-[95vw] max-w-5xl max-h-[800px] h-[720px] rounded-2xl
                  bg-gradient-to-b from-violet-900 via-purple-700 to-purple-900
                text-white shadow-2xl p-3 
                  flex flex-col overflow-hidden'
              >
                {/* seccion de resumen */}
                {selectedEstResumen && (
                  <>
                    {/* 1) header (no scroll) */}
                    <div className='flex items-center gap-2 mb-2'>
                      {/* Tabs / encabezados */}
                      <div className='flex flex-row gap-2 mb-2 w-fit text-2xl'>
                        <button
                          type='button'
                          className='rounded text-fuchsia-500 [text-shadow:_0_4px_8px_#000000] w-48 p-2'
                        >
                          {t('resume')}
                        </button>

                        <div className='flex items-center justify-center'>|</div>

                        <button
                          type='button'
                          onClick={() => {
                            setSelectedEstRespuestas(true);
                            setSelectedEstResumen(false);
                          }}
                          className='w-48 p-2 cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
                        >
                          {t('answer')}
                        </button>

                        <div className='flex items-center justify-center'>|</div>

                        <button
                          type='button'
                          onClick={() => {
                            setSelectedEstGraficaDeRespuestas(true);
                            setSelectedEstResumen(false);
                          }}
                          className='p-2 cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
                        >
                          {t('answerGrafics')}
                        </button>
                      </div>

                      {/* Encabezado: Botón cerrar */}
                      <button
                        type='button'
                        aria-label='Cerrar'
                        className='ml-auto rounded-full w-9 h-9 grid place-items-center text-2xl cursor-pointer
                        hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]
                        '
                        onClick={() => {
                          setSelectedEstadisticas(null);
                          setPartidaIdSeleccionada(null);
                          setSelectedEstRespuestas(null);
                          setSelectedEstGraficaDeRespuestas(null);
                          setSelectedEstResumen(true);
                          setOpenPreguntaIds(new Set());
                          setModalEstadisticaAbierto(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Informacion detallada */}
                    <div
                      className='bg-gradient-to-b from-purple-800 via-purple-700 to-purple-800
                      rounded-xl p-4 mt-1 text-xl flex-1 min-h-0 text-[28px]'
                    >
                      {/* {console.log('partidaSeleccionada: ', partidaSeleccionada)} */}
                      <p className='p-1'>
                        <strong>{t('mode')}:</strong> {partidaSeleccionada.modo ?? '—'}
                      </p>
                      {partidaSeleccionada.posicion > 0 ? (
                        <p className='p-1'>
                          <strong>{t('position')}:</strong> {t('won')}
                        </p>
                      ) : (
                        <p className='p-1'>
                          <strong>{t('position')}:</strong> {t('youWon')}
                        </p>
                      )}
                      <p className='p-1'>
                        <strong>{t('scoreGeneral')}:</strong>{' '}
                        {partidaSeleccionada.puntaje_total}
                      </p>
                      <p className='p-1'>
                        <strong>{t('category')}:</strong>{' '}
                        {categoryTranslations[partidaSeleccionada.categoria] ?? '—'}
                      </p>
                      <p className='p-1'>
                        <strong>{t('date')}:</strong>{' '}
                        {formatDateDMYLocal(partidaSeleccionada?.ended_at) ?? '—'}{' '}
                        {formatTimeHMLocal(partidaSeleccionada?.ended_at) ?? '—'}
                      </p>
                      <p className='p-1'>
                        <strong>{t('rightAnswer')}:</strong>{' '}
                        {partidaSeleccionada.total_correctas}
                      </p>
                      <p className='p-1'>
                        <strong>{t('wrongAnswer')}:</strong>{' '}
                        {partidaSeleccionada.total_incorrectas}
                      </p>
                      <p className='p-1'>
                        <strong>{t('questionDificulty')}:</strong>{' '}
                        {difficultyTranslations[partidaSeleccionada?.dificultad] ?? '—'}
                      </p>
                      <p className='p-1'>
                        <strong>{t('dificultytime')}:</strong>{' '}
                        {timeDifficultyTranslations[
                          partidaSeleccionada?.dificultad_tiempo
                        ] ?? '—'}
                      </p>
                      <p className='p-1'>
                        <strong>{t('matchTime')}:</strong>{' '}
                        {fmtMsDetallado(partidaSeleccionada.tiempo_total_ms)}
                      </p>
                    </div>

                    {/* Sección Contrincante */}
                    {objetoPartidaCompleto?.partida?.[0]?.modo === 'multijugador' && contrincante && (
                      <div className='mt-4 pt-3 border-t border-purple-600/60 text-[22px]'>
                        <h3 className='font-semibold mb-3'>Contrincante</h3>

                        <div className='flex items-center gap-4'>
                          {/* Foto del contrincante */}
                          <div className='w-16 h-16 rounded-full overflow-hidden bg-black/30 flex items-center justify-center'>
                            {contrincante.usuario?.foto_perfil ? (
                              <img
                                src={`${API}${contrincante.usuario.foto_perfil}`}
                                alt={contrincante.usuario?.name ?? 'Contrincante'}
                                className='w-16 h-16 object-cover'
                              />
                            ) : (
                              <span className='text-2xl'>👤</span>
                            )}
                          </div>

                          {/* Nombre y correo */}
                          <div className='flex flex-col'>
                            <span className='font-semibold'>
                              {contrincante.usuario?.name ?? '—'}
                            </span>
                            <span className='text-sm text-purple-200'>
                              {contrincante.usuario?.email ?? '—'}
                            </span>

                            {friendMessage && (
                              <span className='mt-1 text-xs text-purple-200'>
                                {friendMessage}
                              </span>
                            )}
                          </div>

                          {/* Botón Agregar amigo */}
                          <button
                            type='button'
                            disabled={
                              esAmigo ||
                              pendienteConContrincante ||
                              addingFriendId === contrincante.jugador?.id
                            }
                            onClick={() => handleAgregarAmigo(contrincante)}
                            className={`ml-auto px-4 py-2 rounded-xl text-sm cursor-pointer
                        ${esAmigo
                                ? 'bg-green-700/70 text-white cursor-default'
                                : pendienteConContrincante
                                  ? 'bg-yellow-600/80 text-white cursor-default'
                                  : 'bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-60'
                              }`}
                          >
                            {esAmigo
                              ? 'Amigos'
                              : pendienteConContrincante
                                ? 'Pendiente'
                                : addingFriendId === contrincante.jugador?.id
                                  ? 'Agregando...'
                                  : 'Agregar amigo'}
                          </button>

                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* seccion de respuestas */}
                {selectedEstRespuestas && (
                  <>
                    {/* 1) header (no scroll) */}
                    <div className='flex items-center gap-2 mb-2'>
                      {/* Tabs / encabezado */}
                      <div className='flex flex-row gap-2 mb-2 w-fit text-2xl'>
                        <button
                          type='button'
                          onClick={() => {
                            setSelectedEstResumen(true);
                            setSelectedEstRespuestas(false);
                          }}
                          className='w-48 p-2 cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
                        >
                          {t('resume')}
                        </button>

                        <div className='flex items-center justify-center'>|</div>

                        <button
                          type='button'
                          className='rounded w-48 p-2 text-fuchsia-500 [text-shadow:_0_4px_8px_#000000]'
                        >
                          {t('answer')}
                        </button>

                        <div className='flex items-center justify-center'>|</div>

                        <button
                          type='button'
                          onClick={() => {
                            setSelectedEstGraficaDeRespuestas(true);
                            setSelectedEstRespuestas(false);
                          }}
                          className='p-2 cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
                        >
                          {t('answerGrafics')}
                        </button>
                      </div>

                      {/* Botón cerrar */}
                      <button
                        type='button'
                        aria-label='Cerrar'
                        className='ml-auto rounded-full w-9 h-9 grid place-items-center text-2xl cursor-pointer
                        hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
                        onClick={() => {
                          setSelectedEstadisticas(null);
                          setPartidaIdSeleccionada(null);
                          setSelectedEstRespuestas(null);
                          setSelectedEstGraficaDeRespuestas(null);
                          setSelectedEstResumen(true);
                          setOpenPreguntaIds(new Set());
                          setModalEstadisticaAbierto(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* 2) wrapper (contenedor) que da altura al contenido */}
                    <div className='flex-1 min-h-0'>
                      {/* 3) área scrollable */}
                      <div
                        ref={listRef}
                        className='h-full overflow-y-auto overscroll-contain touch-pan-y pr-2
                      bg-gradient-to-b from-purple-800 via-purple-700 to-purple-800
                      rounded-xl'
                      >
                        {/* {console.log('objetoPartidaCompleto: ', objetoPartidaCompleto)} */}

                        <div className='flex flex-row gap-2 mb-2 sticky top-0 p-2 bg-purple-800'>
                          <button
                            onClick={() =>
                              setOpenPreguntaIds(
                                new Set(
                                  (objetoPartidaCompleto?.preguntasDeLaPartida ?? []).map(
                                    (e) => Number(e.pregunta_id ?? e.id)
                                  )
                                )
                              )
                            }
                            className='hover:text-rose-600 rounded p-2 cursor-pointer text-[20px]'
                          >
                            {t('openAnswer')}
                          </button>

                          <button
                            onClick={() => setOpenPreguntaIds(new Set())}
                            className='hover:text-rose-600 rounded p-2 cursor-pointer text-[20px]'
                          >
                            {t('closeAnswer')}
                          </button>
                        </div>

                        {objetoPartidaCompleto?.preguntasDeLaPartida?.length ? (
                          <ul className='p-2'>
                            {(objetoPartidaCompleto?.preguntasDeLaPartida ?? []).map(
                              (e, index) => (
                                <motion.li
                                  key={Number(e.pregunta_id ?? e.id)}
                                  className='border rounded-xl p-3 odd:bg-black/5 even:bg-black/30 flex flex-col mb-2'
                                  whileTap={{ scale: 1.01 }}
                                >
                                  <button
                                    type='button'
                                    className='text-left w-full cursor-pointer hover:bg-black/30 rounded p-0.5 text-[20px]'
                                    onClick={() =>
                                      togglePregunta(Number(e.pregunta_id ?? e.id))
                                    }
                                  >
                                    <span className='shrink-0 inline-flex items-center justify-center w-7 h-7 font-semibold'>
                                      {`${index + 1})`}
                                    </span>

                                    <span className='leading-snug'>
                                      {e.question_text_copy}
                                    </span>
                                  </button>

                                  {openPreguntaIds.has(Number(e.pregunta_id ?? e.id)) && (
                                    <div className='mt-2'>
                                      {(objetoPartidaCompleto?.opcionesDeRespuestas ?? [])
                                        .filter(
                                          (o) =>
                                            Number(o.pregunta_id) ===
                                            Number(e.pregunta_id ?? e.id)
                                        )
                                        .map((o) => (
                                          <span
                                            key={o.id}
                                            className={[
                                              'block mb-1 indent-2 rounded text-[22px] border',
                                              (() => {
                                                const qId = Number(
                                                  e.pregunta_id ?? e.id
                                                );
                                                const chosenId =
                                                  elegidaPorPregunta.get(qId);
                                                const userCorrect =
                                                  !!correctaPorPregunta.get(qId);
                                                const isChosen =
                                                  chosenId === Number(o.id);
                                                const isOptionCorrect =
                                                  !!o.es_correcta;

                                                if (isChosen) {
                                                  return userCorrect
                                                    ? 'bg-green-600/30 border-green-500'
                                                    : 'bg-red-600/30 border-red-500';
                                                }
                                                if (isOptionCorrect) {
                                                  return 'bg-yellow-600/35 border-yellow-500';
                                                }
                                                return 'bg-gray-800/30 hover:bg-gray-800/50 border-transparent';
                                              })(),
                                            ].join(' ')}
                                          >
                                            {(() => {
                                              const qId = Number(
                                                e.pregunta_id ?? e.id
                                              );
                                              const chosenId =
                                                elegidaPorPregunta.get(qId);
                                              const userCorrect =
                                                !!correctaPorPregunta.get(qId);
                                              const isChosen =
                                                chosenId === Number(o.id);
                                              const isOptionCorrect =
                                                !!o.es_correcta;

                                              if (isChosen)
                                                return userCorrect ? '✅ ' : '❌ ';
                                              if (isOptionCorrect) return '🥲 ';
                                              return '';
                                            })()}
                                            {o.texto ?? o.option_text ?? '—'}
                                          </span>
                                        ))}
                                    </div>
                                  )}
                                  {/* tiempo de respuesta (al abrir) */}
                                  {openPreguntaIds.has(Number(e.pregunta_id ?? e.id)) && (
                                    <div className='mt-1 text-sm opacity-80'>
                                      {t('answerTime')}:{' '}
                                      <b>
                                        {fmtMs(
                                          tiempoPorPregunta.get(
                                            Number(e.pregunta_id ?? e.id)
                                          )
                                        )}
                                      </b>
                                    </div>
                                  )}
                                </motion.li>
                              )
                            )}
                          </ul>
                        ) : (
                          <span>{t('answerList')}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* seccion de grafica de respuestas */}
                {selectedEstGraficaDeRespuestas && (
                  <>
                    {/* 1) header (no scroll) */}
                    <div className='flex items-center gap-2'>
                      {/* Tabs / encabezado */}
                      <div className='flex flex-row gap-2 mb-2 w-fit text-2xl'>
                        <button
                          type='button'
                          onClick={() => {
                            setSelectedEstResumen(true);
                            setSelectedEstGraficaDeRespuestas(false);
                          }}
                          className='w-48 p-2 cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
                        >
                          {t('resume')}
                        </button>

                        <div className='flex items-center justify-center'>|</div>

                        <button
                          type='button'
                          onClick={() => {
                            setSelectedEstRespuestas(true);
                            setSelectedEstGraficaDeRespuestas(false);
                          }}
                          className='w-48 p-2 cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
                        >
                          {t('answer')}
                        </button>

                        <div className='flex items-center justify-center'>|</div>

                        <button
                          type='button'
                          onClick={() => {
                            setSelectedEstGraficaDeRespuestas(true);
                            setSelectedEstRespuestas(false);
                          }}
                          className='text-fuchsia-500 rounded p-2 [text-shadow:_0_4px_8px_#000000]'
                        >
                          {t('answerGrafics')}
                        </button>
                      </div>

                      {/* Botón cerrar */}
                      <button
                        type='button'
                        aria-label='Cerrar'
                        onClick={() => {
                          setSelectedEstadisticas(null);
                          setPartidaIdSeleccionada(null);
                          setSelectedEstRespuestas(null);
                          setSelectedEstGraficaDeRespuestas(null);
                          setSelectedEstResumen(true);
                          setOpenPreguntaIds(new Set());
                          setModalEstadisticaAbierto(null);
                        }}
                        className='ml-auto rounded-full w-9 h-9 grid place-items-center text-2xl cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
                      >
                        ✕
                      </button>
                    </div>

                    {/* grafica lineal de respuestas */}
                    <div className='text-xl rounded p-1.5 mt-1 flex-1 min-h-0'>
                      {objetoPartidaCompleto.partida[0].modo == 'individual' ? (
                        <div className='bg-gradient-to-b from-purple-800 via-purple-700 to-purple-800 rounded-xl'>
                          <ChartVerticalLabels
                            arregloCompleto={objetoPartidaCompleto}
                            className=' mt-1 p-1'
                          />
                        </div>
                      ) : (
                        <div>
                          <ChartMultilineLabels
                            arregloCompleto={objetoPartidaCompleto}
                            className=' bg-gradient-to-b from-purple-800 via-purple-700 to-purple-800 rounded-xl mt-4'
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Estadísticas */}
          <div className='flex flex-row gap-2 mt-4'>
            <button
              type='button'
              onClick={() => {
                setSelectedEstadisticasResultadosDePartidas(true);
              }}
            >
              <h2 className='text-xl text-white font-semibold mb-3 mt-3 cursor-pointer hover:text-fuchsia-500/95 p-1'>
                {t('matchResults')}
              </h2>
            </button>
            <h2 className='text-xl text-white flex items-center justify-center p-1'>|</h2>
            <button>
              <h2 className='text-xl font-semibold text-fuchsia-500/95 mb-3 mt-3 p-1'>
                {t('graficStadistic')}
              </h2>
            </button>
          </div>
          {estadisticas.length !== 0 ? (
            <>
              <QCChartStable
                arregloCompleto={{ listaObjetosPartidaInformacion, categorias }}
                className='bg-gradient-to-b from-purple-800 via-purple-700 to-purple-800  mt-4 rounded p-4 pl-1'
              />
            </>
          ) : (
            <>
              <p className='indent-2 text-white'>{t('noGraficStadistic')}</p>
            </>
          )}
        </div>
      )}


      {/* ============================= Solicitudes de amistad ================================================= */}

      <div className='mb-6 mt-8 bg-white/10 rounded-xl p-1'>
        <h2 className='text-xl text-white font-semibold mb-3 mt-2 indent-2'>
          Solicitudes de amistad
        </h2>

        {friendRequestsDetails.length === 0 ? (
          <p className='indent-2 text-white mb-4'>
            No tenés solicitudes pendientes.
          </p>
        ) : (
          <>
            <div className='mb-2 p-0.5 space-y-2'>
              {visibleFriendRequests.map(({ solicitud, usuario }) => (
                <div
                  key={solicitud.id}
                  className='border rounded-xl p-4 bg-white/10 hover:bg-white/20 
                    mb-2 flex items-center justify-between gap-4'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 rounded-full overflow-hidden bg-black/30 flex items-center justify-center'>
                      {usuario?.foto_perfil ? (
                        <img
                          src={`${API}${usuario.foto_perfil}`}
                          alt={usuario?.name ?? 'Jugador'}
                          className='w-12 h-12 object-cover'
                        />
                      ) : (
                        <span className='text-2xl'>👤</span>
                      )}
                    </div>
                    <div className='flex flex-col'>
                      <span className='font-semibold'>
                        {usuario?.name ?? '—'}
                      </span>
                      <span className='text-sm text-purple-200'>
                        {usuario?.email ?? '—'}
                      </span>
                      <span className='text-xs text-purple-200'>
                        Puntaje: {usuario?.puntaje ?? '—'} · País: {usuario?.pais ?? '—'}
                      </span>
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={() => handleAceptarSolicitud(solicitud.id)}
                      disabled={processingRequestId === solicitud.id}
                      className='px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 
                         text-white text-sm cursor-pointer disabled:opacity-60'
                    >
                      {processingRequestId === solicitud.id ? 'Aceptando...' : 'Aceptar'}
                    </button>
                    <button
                      type='button'
                      onClick={() => handleRechazarSolicitud(solicitud.id)}
                      disabled={processingRequestId === solicitud.id}
                      className='px-3 py-1.5 rounded bg-gray-600 hover:bg-gray-700 
                         text-white text-sm cursor-pointer disabled:opacity-60'
                    >
                      {processingRequestId === solicitud.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalRequestsPages > 1 && (
              <div className='flex items-center justify-end gap-2 px-2 pb-2 text-sm text-white'>
                <button
                  type='button'
                  onClick={() =>
                    setRequestsPage((p) => Math.max(1, p - 1))
                  }
                  disabled={requestsPage === 1}
                  className='px-2 py-1 rounded bg-white/10 disabled:opacity-40'
                >
                  « Anterior
                </button>
                <span>
                  Página {requestsPage} de {totalRequestsPages}
                </span>
                <button
                  type='button'
                  onClick={() =>
                    setRequestsPage((p) => Math.min(totalRequestsPages, p + 1))
                  }
                  disabled={requestsPage === totalRequestsPages}
                  className='px-2 py-1 rounded bg-white/10 disabled:opacity-40'
                >
                  Siguiente »
                </button>
              </div>
            )}
          </>
        )}
      </div>


      {/* ============================= Mis Amigos ================================================= */}

      <div className='mb-6 mt-4 bg-white/10 rounded-xl p-1'>
        <h2 className='text-xl text-white font-semibold mb-1 mt-2 indent-2'>
          {t('friends')}
        </h2>

        {/* Input de búsqueda */}
        <div className='px-2 mb-2'>
          <input
            type='text'
            value={friendsSearch}
            onChange={(e) => setFriendsSearch(e.target.value)}
            placeholder='Buscar amigo por nombre...'
            className='w-full px-3 py-1.5 rounded-lg bg-black/30 text-white text-sm 
                 border border-white/20 focus:outline-none focus:ring-1 focus:ring-purple-400'
          />
        </div>

        <div>
          <AnimatePresence>
            {eliminado && (
              <motion.p
                key='toast'
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
                exit={{ opacity: 0, y: 8, transition: { duration: 0.8 } }}
                className='bg-green-600 text-white mb-4 px-4 py-2 rounded shadow-lg z-[100]'
              >
                {t('friendDeleted')}
              </motion.p>
            )}
          </AnimatePresence>

          {filteredFriendsDetails.length > 0 ? (
            <>
              <div className='mb-2 p-0.5 space-y-2'>
                {visibleFriends.map(({ amigo, usuario }) => (
                  <div
                    key={amigo.id}
                    className='border rounded-xl p-4 bg-white/10 hover:bg-white/20 
                      mb-2 flex items-center justify-between gap-4'
                  >
                    <div className='flex items-center gap-3'>
                      {/* {console.log("usuario: ", usuario)} */}
                      <div className='w-12 h-12 rounded-full overflow-hidden bg-black/30 flex items-center justify-center'>
                        {usuario?.foto_perfil ? (
                          <img
                            src={`${API}${usuario.foto_perfil}`}
                            alt={usuario?.name ?? 'Amigo'}
                            className='w-12 h-12 object-cover'
                          />
                        ) : (
                          <span className='text-2xl'>👤</span>
                        )}
                      </div>
                      <div className='flex flex-col'>
                        <span className='font-semibold text-white'>
                          {usuario?.name ?? '—'}
                        </span>
                        <span className='text-sm text-purple-200'>
                          {usuario?.email ?? '—'}
                        </span>
                        <span className='text-xs text-purple-200'>
                          {/* Puntaje: {usuario?.puntaje ?? '—'} ·*/} País: {usuario?.pais ?? '—'}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      type='button'
                      className='bg-red-500 hover:bg-red-600 rounded w-32 cursor-pointer 
                         justify-self-end text-white py-1.5'
                      whileTap={{ scale: 1.1 }}
                      onClick={() => eliminarAmigo(amigo.id)}
                    >
                      {t('deleteFriend')}
                    </motion.button>
                  </div>
                ))}
              </div>

              {totalFriendsPages > 1 && (
                <div className='flex items-center justify-end gap-2 px-2 pb-2 text-sm text-white'>
                  <button
                    type='button'
                    onClick={() =>
                      setFriendsPage((p) => Math.max(1, p - 1))
                    }
                    disabled={friendsPage === 1}
                    className='px-2 py-1 rounded bg-white/10 disabled:opacity-40'
                  >
                    « Anterior
                  </button>
                  <span>
                    Página {friendsPage} de {totalFriendsPages}
                  </span>
                  <button
                    type='button'
                    onClick={() =>
                      setFriendsPage((p) => Math.min(totalFriendsPages, p + 1))
                    }
                    disabled={friendsPage === totalFriendsPages}
                    className='px-2 py-1 rounded bg-white/10 disabled:opacity-40'
                  >
                    Siguiente »
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className='indent-2 text-white mb-4'>
              {friendsDetails.length === 0
                ? t('noHaveFriend')
                : 'No se encontraron amigos con ese nombre.'}
            </p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Perfil;
