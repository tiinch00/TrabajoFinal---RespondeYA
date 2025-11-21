import { AnimatePresence, motion } from 'motion/react';
import { Trans, useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';

import ChartMultilineLabels from '../components/graficosQuickchart.io/ChartMultilineLabels.jsx';
import ChartVerticalLabels from '../components/graficosQuickchart.io/ChartVerticalLabels.jsx';
import Cropper from 'react-easy-crop';
import QCChartStable from '../components/graficosQuickchart.io/QCChartStable.jsx';
import axios from 'axios';
import { getCroppedImg } from '../utils/cropImage.js';
import i18n from 'i18next';
import { useAuth } from '../context/auth-context.jsx';

//import SimpleBarChart from '../components/simpleBarChart';

// normalizador simple (tildes, mayúsculas, espacios) y evita errores con null/undefined/objetos raros.
function normalize(s) {
  return (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const Perfil = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const userId = user?.id;
  const jugador_id = user?.jugador_id;
  const [eliminando, setEliminando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    amigoId: null,
    nombre: '',
  });

  useEffect(() => {
    const handleLangChange = (lng) => setIdioma(lng);
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);

  const [confirmDeleting, setConfirmDeleting] = useState(false); // loading de borrar un amigo
  const [idioma, setIdioma] = useState(i18n.language);
  // NUEVO: solo para el botón "Mis avatares" de abajo
  const [showAvatarsList, setShowAvatarsList] = useState(false);

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
  const modeTranslationsAvatar = {
    Humano: t('human'),
    Humana: t('human'),
    Soldado: t('soldier'),
    Master: t('master'),
    Mago: t('mage'),
    Computo: t('computo'),
    Maga: t('mage'),
    Ingeniero: t('ingenier'),
    Principal: t('main'),
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
  const [selectedAvatar, setSelectedAvatar] = useState(false); // boton mis avatares
  const [avatarIdSeleccionado, setAvatarIdSeleccionado] = useState(null); // cuando elige un avatar dentro del listado
  const [avatarConfirm, setAvatarConfirm] = useState({
    open: false,
    avatar: null,
  });
  const [applyingAvatar, setApplyingAvatar] = useState(false);
  const [avatarDetalle, setAvatarDetalle] = useState(null); // avatar seleccionado solo para ver detalle

  const [partidaIdSeleccionada, setPartidaIdSeleccionada] = useState(null);

  const [editMode, setEditMode] = useState(false); // boton editar datos de perfil
  const [saving, setSaving] = useState(false); // boton de guardar los datos de formulario de editar perfil
  const [friendsSearch, setFriendsSearch] = useState('');

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
  // tab de sección amigos
  const [activeFriendsTab, setActiveFriendsTab] = useState('friends');
  // 'friends' | 'search'

  // búsqueda en “buscar nuevo amigo”
  const [newFriendSearch, setNewFriendSearch] = useState('');
  // lista de TODOS los users del sistema (para buscar nuevos amigos)
  const [allUsers, setAllUsers] = useState([]);
  const [jugadoresPorId, setJugadoresPorId] = useState({});
  // paginado para “buscar nuevo amigo”
  const NEW_FRIENDS_PAGE_SIZE = 5;
  const [newFriendsPage, setNewFriendsPage] = useState(1);
  // modal con datos de persona (amigo o no amigo)
  const [selectedPerson, setSelectedPerson] = useState(null);
  // { name, email, pais, puntaje }

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
  const [estadisticasTodas, setEstadisticasTodas] = useState([]);

  // hooks de foto de perfil
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006'; // URL base de tu API
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null); // URL local de previsualización
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef(null);
  //para recorte de foto de perfil
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState(null); // URL de la imagen original para cropear
  const hayPreview = !!preview;
  const hayFotoGuardada = !!perfil?.foto_perfil;
  const hayAlgoParaMostrar = hayPreview || hayFotoGuardada;
  const [showDeleteBar, setShowDeleteBar] = useState(false);

  // agregar un amigo
  const [addingFriendId, setAddingFriendId] = useState(null);
  const [friendMessage, setFriendMessage] = useState(null);

  // solicitudes que me llegan
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendRequestsDetails, setFriendRequestsDetails] = useState([]);

  // detalles de amigos aceptados
  const [friendsDetails, setFriendsDetails] = useState([]);

  // --- filtro de amigos SOLO por nombre ---
  const normalizedFriendQuery = normalize(friendsSearch);

  const filteredFriendsDetails = (friendsDetails ?? []).filter(({ usuario, jugador }) => {
    // excluir administradores
    const role = (usuario?.role ?? '').toString().toLowerCase();
    if (role === 'admin' || role === 'administrador' || role === 'superadmin') return false;

    // excluirme a mí misma (por jugador o user)
    if (Number(jugador?.id) === Number(jugador_id)) return false;
    if (Number(usuario?.id) === Number(userId)) return false;

    // si no hay texto, muestro todos
    if (!normalizedFriendQuery) return true;

    const nameNorm = normalize(usuario?.name ?? '');

    // SOLO por nombre
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
    pais: '',
    password: '',
    confirmPassword: '',
  }); // hook de inicializacion del formulario
  const [formErrors, setFormErrors] = useState({}); // error del formulario
  const [paises, setPaises] = useState([]);
  const [loadingPaises, setLoadingPaises] = useState(false);
  const [errorPaises, setErrorPaises] = useState(null);

  // buscador de partidas - estado para el input y la lista filtrada
  const [search, setSearch] = useState('');
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
  const total = listaFiltrada?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);
  const visible = (listaFiltrada ?? []).slice(startIndex, endIndex);

  // ====== paginado solicitudes ======
  const totalRequests = friendRequestsDetails.length;
  const totalRequestsPages = Math.max(1, Math.ceil(totalRequests / REQUESTS_PAGE_SIZE));
  const requestsStartIndex = (requestsPage - 1) * REQUESTS_PAGE_SIZE;
  const requestsEndIndex = requestsStartIndex + REQUESTS_PAGE_SIZE;
  const visibleFriendRequests = friendRequestsDetails.slice(requestsStartIndex, requestsEndIndex);

  // ====== paginado amigos ======
  const totalFriends = filteredFriendsDetails.length;
  const totalFriendsPages = Math.max(1, Math.ceil(totalFriends / FRIENDS_PAGE_SIZE));
  const friendsStartIndex = (friendsPage - 1) * FRIENDS_PAGE_SIZE;
  const friendsEndIndex = friendsStartIndex + FRIENDS_PAGE_SIZE;
  const visibleFriends = filteredFriendsDetails.slice(friendsStartIndex, friendsEndIndex);

  // si cambia la lista o el filtro, volvemos a página 1
  useEffect(() => {
    setFriendsPage(1);
  }, [friendsDetails, friendsSearch]);

  const candidateUsersBase = (allUsers ?? []).filter((u) => {
    const jid = Number(u.jugador_id);

    // descartamos ids no válidos o 0
    if (!Number.isFinite(jid) || jid <= 0) return false;

    // excluirme a mí misma
    if (jid === Number(jugador_id)) return false;
    if (Number(u.id) === Number(userId)) return false;

    // excluir admins
    const role = (u.role ?? '').toString().toLowerCase();
    if (role === 'admin' || role === 'administrador' || role === 'superadmin') return false;

    return true;
  });

  const normalizedNewFriendQuery = normalize(newFriendSearch);

  // filtro SOLO por nombre
  const filteredNewFriends = !normalizedNewFriendQuery
    ? [] // input vacío: no mostramos nada
    : candidateUsersBase.filter((u) => {
      const nameNorm = normalize(u.name ?? '');
      return nameNorm.includes(normalizedNewFriendQuery);
    });

  // paginado “buscar nuevo amigo”
  const totalNewFriends = filteredNewFriends.length;
  const totalNewFriendsPages = Math.max(1, Math.ceil(totalNewFriends / NEW_FRIENDS_PAGE_SIZE));
  const newFriendsStartIndex = (newFriendsPage - 1) * NEW_FRIENDS_PAGE_SIZE;
  const newFriendsEndIndex = newFriendsStartIndex + NEW_FRIENDS_PAGE_SIZE;
  const visibleNewFriends = filteredNewFriends.slice(newFriendsStartIndex, newFriendsEndIndex);

  // si cambia la búsqueda o la lista, volvemos a la página 1
  useEffect(() => {
    setNewFriendsPage(1);
  }, [newFriendSearch, amigos, friendRequests, allUsers]);

  // handlers
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
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
        const { data } = await axios.get(`${API_URL}/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!alive) return;
        setPerfil(data);
        setForm({
          name: data.name || '',
          email: data.email || '',
          pais: data.pais || '',
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

  const resolveFotoPerfil = () => {
    // 1) Si estás viendo un preview local (File recortado)
    if (preview) return preview;

    // si no hay nada en BD, no devolvemos nada → se muestra el 👤
    const fp = perfil?.foto_perfil;
    if (!fp) return null;

    // 2) si viene de /assets/... (public del frontend)
    if (fp.startsWith('/assets/')) {
      return fp; // ej: /assets/avatares/avatar1.png
    }

    // 3) si ya es una URL absoluta (http/https)
    if (/^https?:\/\//.test(fp)) {
      return fp;
    }

    // 4) caso normal: ruta relativa que sirve el backend (/uploads/...)
    return `${API_URL}${fp}`;
  };

  const resolveFotoAjena = (fp) => {
    if (!fp) return null;

    // 1) si viene de /assets/... (public del frontend)
    if (fp.startsWith('/assets/')) {
      return fp;
    }

    // 2) si ya es una URL absoluta
    if (/^https?:\/\//.test(fp)) {
      return fp;
    }

    // 3) caso normal: ruta relativa que sirve tu backend
    return `${API_URL}${fp}`;
  };

  const fotoUrl =
    avatarConfirm.open && avatarConfirm.avatar
      ? avatarConfirm.avatar.preview_url
      : resolveFotoPerfil();

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
  // que aparezca "eliminar foto" cuando hay un avatar como foto de perfil
  //const hasFotoActual = !!(preview || perfil?.foto_perfil);

  const cancelarCrop = () => {
    setCropModalOpen(false);

    // liberar la URL del preview si existe
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    // liberar URL temporal de la imagen original
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
    }

    // limpiar estados locales SIEMPRE
    setPreview(null);
    setFoto(null);
    setTempImageUrl(null);

    // limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const subirFoto = async () => {
    if (!foto || !perfil?.id) return;
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append('foto', foto); // <-- la recortada (File)

      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API_URL}/users/${user.id}/foto`, fd, {
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
    // si hay preview (URL.createObjectURL), la liberamos
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null); // sacar la previsualización
    setFoto(null); // olvidarse del File que habías elegido
    setTempImageUrl(null); // por las dudas, limpiar la imagen original del crop
    setCropModalOpen(false);

    // limpiar el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // liberar la URL del preview cuando cambie (higiene)
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleApplyAvatar = async () => {
    if (!avatarConfirm.avatar || !user?.id) return;

    try {
      setApplyingAvatar(true);
      const token = localStorage.getItem('token');

      const { data } = await axios.put(
        `${API_URL}/users/${user.id}/avatar`,
        { avatarUrl: avatarConfirm.avatar.preview_url },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      // usuario actualizado sin password
      setPerfil(data);
      setFoto(data.foto_perfil);

      updateUser({
        ...user,
        foto_perfil: data.foto_perfil,
      });

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...storedUser,
          foto_perfil: data.foto_perfil,
        })
      );

      // cierro modales
      setAvatarConfirm({ open: false, avatar: null });
      setSelectedAvatar(false);
      setSelectedPefilEditar(false);
    } catch (err) {
      console.error('Error aplicando avatar:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setApplyingAvatar(false);
    }
  };

  const eliminarFoto = async () => {
    // si no hay foto en BD, no hacemos nada
    if (!user?.id || !perfil?.foto_perfil) {
      setShowDeleteBar(false);
      return;
    }

    try {
      setEliminando(true);
      const token = localStorage.getItem('token');

      await axios.delete(`${API_URL}/users/${user.id}/foto`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // limpiar estados
      setPreview(null);
      setFoto(null);

      setPerfil((prev) => ({
        ...prev,
        foto_perfil: null,
      }));

      updateUser({
        ...user,
        foto_perfil: null,
      });

      setShowDeleteBar(false); // 👈 cierro la barrita
    } catch (err) {
      console.error('Error eliminando foto:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setEliminando(false);
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingPaises(true);
        const { data } = await axios.get(`${API_URL}/api/paises`);
        if (!alive) return;
        // data = [{ codigo, nombre }, ...]
        setPaises(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!alive) return;
        setErrorPaises(err.response?.data?.error || err.message);
        setPaises([]);
      } finally {
        if (alive) setLoadingPaises(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

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

    // País obligatorio
    if (!form.pais.trim()) {
      errs.pais = 'El país es obligatorio';
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
        pais: form.pais.trim(),
      };
      if (form.password.trim()) payload.password = form.password.trim();

      const { data } = await axios.put(`${API_URL}/users/${perfil.id}`, payload, {
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
      const apiError = err.response?.data;

      // Si viene el esquema de VALIDATION desde el backend
      if (apiError?.error === 'VALIDATION' && apiError.fields) {
        setFormErrors((prev) => ({
          ...prev,
          ...apiError.fields, // { name: '...', email: '...' }
        }));
      } else if (typeof apiError?.error === 'string') {
        // error genérico de backend
        setError(apiError.error);
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  // obtiene todos los objetos avatares
  const infoAvatares = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/avatar`);
      setAvatares(data);
    } catch (error) {
      console.log('@@@@ Error GET /avatar\n', error);
    }
  };

  // obtiene los avatares que tiene el jugador comprado user_avatares
  // pero no hay url de las fotos
  const infoJugadorIdAvatares = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/userAvatar`,
        { params: { jugador_id } } // <-- params
      );
      setJugadorAvatares(data);
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

    return out;
  };

  const getAmigos = async () => {
    try {
      if (!jugador_id) return;

      // 1) Amigos donde YO soy jugador_id
      const [comoJugadorRes, comoAmigoRes] = await Promise.all([
        axios.get(`${API_URL}/amigos`, {
          params: { jugador_id }, // yo en la columna jugador_id
        }),
        axios.get(`${API_URL}/amigos`, {
          params: { amigo_id: jugador_id }, // yo en la columna amigo_id
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

      // 3) Todos (aceptados + pendientes) sin duplicados
      const todos = [...mapa.values()];

      setAmigos(todos);
    } catch (error) {
      console.log('@@@@ Error GET: amigos\n', error);
    }
  };

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users`);

      const normalizados = (Array.isArray(data) ? data : []).map((u) => {
        const jugador = u.jugador || null;

        const jid = Number(jugador?.jugador_id);

        return {
          ...u,
          jugador_id: Number.isFinite(jid) && jid > 0 ? jid : null,
          puntaje: jugador?.puntaje ?? null,
        };
      });

      setAllUsers(normalizados);
    } catch (error) {
      console.log('@@@@ Error GET: users\n', error);
      setAllUsers([]);
    }
  };

  useEffect(() => {
    let cancel = false;

    (async () => {
      const ids = [
        ...new Set(
          (allUsers ?? [])
            .map((u) => Number(u.jugador_id))
            .filter((n) => Number.isFinite(n) && n > 0) // solo ids válidos
        ),
      ];

      if (!ids.length) {
        if (!cancel) setJugadoresPorId({});
        return;
      }

      const arr = await Promise.all(
        ids.map(async (id) => {
          const j = await getJugador(id);
          if (!j) return null;

          const jid = Number(j.jugador_id ?? j.id);
          if (!Number.isFinite(jid) || jid <= 0) return null;

          return { id: jid, jugador: j };
        })
      );

      const mapa = {};
      arr.filter(Boolean).forEach(({ id, jugador }) => {
        mapa[id] = jugador;
      });

      if (!cancel) setJugadoresPorId(mapa);
    })();

    return () => {
      cancel = true;
    };
  }, [allUsers]);

  const eliminarAmigo = async (id) => {
    try {
      const { data } = await axios.delete(`${API_URL}/amigos/eliminar/${id}`);

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

  const getRelacionConUsuario = (usuario) => {
    const otroJid = Number(usuario?.jugador_id);
    const miJid = Number(jugador_id);

    if (!Number.isFinite(otroJid) || !Number.isFinite(miJid)) return 'ninguna';

    // 1) Relaciones en "amigos" (aceptadas o pendientes que yo envié)
    const relacion = (amigos ?? []).find((a) => {
      const jidA = Number(a.jugador_id);
      const jidB = Number(a.amigo_id);

      return (jidA === miJid && jidB === otroJid) || (jidA === otroJid && jidB === miJid);
    });

    if (relacion) {
      if (relacion.aceptado_en) return 'amigo'; // ya somos amigos
      return 'pendiente'; // solicitud enviada (pendiente)
    }

    // 2) Solicitudes PENDIENTES que ellos me enviaron (friendRequests)
    const recibida = (friendRequests ?? []).find((r) => {
      const jReq = Number(r.jugador_id); // el que envía
      const aReq = Number(r.amigo_id); // el que recibe (yo)
      return jReq === otroJid && aReq === miJid && !r.aceptado_en;
    });

    if (recibida) return 'pendiente';

    return 'ninguna';
  };

  const handleAgregarAmigo = async (registroSala) => {
    try {
      setFriendMessage(null);

      if (!jugador_id) {
        setFriendMessage('No se encontró tu jugador_id');
        return;
      }

      // el contrincante es un jugador, no un user
      const amigoJugadorId = registroSala?.jugador?.id;
      if (!amigoJugadorId) {
        setFriendMessage('No se encontró el jugador del contrincante');
        return;
      }

      setAddingFriendId(amigoJugadorId);

      const payload = {
        jugador_id: Number(jugador_id), // yo
        amigo_id: Number(amigoJugadorId), // el otro jugador
        aceptado_en: null, // pendiente
      };

      const { data } = await axios.post(`${API_URL}/amigos/create`, payload);

      // lo guardo en mi lista local de amigos (pendiente)
      setAmigos((prev) => [...prev, data]);
      setFriendMessage('Solicitud enviada ✅');
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setFriendMessage(msg);
    } finally {
      setAddingFriendId(null);
    }
  };

  const handleAgregarAmigoDesdeUsuario = async (usuario) => {
    try {
      setFriendMessage(null);

      if (!jugador_id) {
        setFriendMessage('No se encontró tu jugador_id');
        return;
      }

      const amigoJugadorId = Number(usuario?.jugador_id);

      // 👇 acá el cambio importante
      if (!Number.isFinite(amigoJugadorId) || amigoJugadorId <= 0) {
        setFriendMessage('Este usuario no tiene jugador asociado');
        return;
      }

      setAddingFriendId(amigoJugadorId);

      const payload = {
        jugador_id: Number(jugador_id), // yo
        amigo_id: amigoJugadorId, // el otro jugador
        aceptado_en: null, // pendiente
      };

      const { data } = await axios.post(`${API_URL}/amigos/create`, payload);

      const nuevo = {
        ...data,
        jugador_id: Number(data?.jugador_id ?? payload.jugador_id),
        amigo_id: Number(data?.amigo_id ?? payload.amigo_id),
        aceptado_en: data?.aceptado_en ?? null,
      };

      setAmigos((prev) => [...prev, nuevo]);
      setFriendMessage('Solicitud enviada ✅');
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
      const { data } = await axios.get(`${API_URL}/categorias`);
      setCategorias(data);
    } catch (error) {
      console.log('@@@@ Error GET: categorias\n', error);
    }
  };

  // obtiene un objeto pregunta
  const getPreguntas = async (id) => {
    try {
      // /${id}
      const { data } = await axios.get(`${API_URL}/preguntas`);
      setPreguntas(data);
    } catch (error) {
      console.log('@@@@ Error GET: preguntas\n', error);
    }
  };

  // obtiene un objeto opcion
  const getOpciones = async (id) => {
    try {
      const { data } = await axios.get(`${API_URL}/opciones`);
      setOpciones(data);
    } catch (error) {
      console.log('@@@@ Error GET: opciones\n', error);
    }
  };

  // obtiene un array de sala_jugadores
  const getArraySalaJugadores = async (id) => {
    try {
      const { data } = await axios.get(`${API_URL}/sala_jugadores`, {
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
      const { data } = await axios.get(`${API_URL}/partidas`);
      setPartidas(data);
    } catch (error) {
      console.log('@@@@ Error GET: partidas\n', error);
    }
  };

  // obtiene un objeto partida_pregunta
  const getPartidaPreguntas = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/partida_preguntas`);
      setPartida_preguntas(data);
    } catch (error) {
      console.log('@@@@ Error GET: partida_preguntas\n', error);
    }
  };

  // obtiene un objeto respuesta
  const getRespuestas = async (id) => {
    try {
      const { data } = await axios.get(`${API_URL}/respuestas`);
      setRespuestas(data);
    } catch (error) {
      console.log('@@@@ Error GET: respuestas\n', error);
    }
  };

  const getEstadisticas = async () => {
    try {
      // 🔹 SIN params → traemos TODAS las estadísticas
      const { data } = await axios.get(`${API_URL}/estadisticas/`);

      const todas = Array.isArray(data) ? data : [];
      setEstadisticasTodas(todas); // 👈 guardamos el universo completo

      // 🔹 De ahí sacamos SOLO las del jugador logueado
      const soloMias = todas.filter((e) => Number(e.jugador_id) === Number(jugador_id));
      setEstadisticas(soloMias); // 👈 esto lo usa tu UI como antes
    } catch (error) {
      console.log('@@@@ Error GET: estadisticas\n', error);
    }
  };

  // obtiene un array de PartidaJugadores (saber que jugadores jugaron en una partida)
  const getPartidaJugadores = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/partida_jugadores`);
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
      const partidasById = new Map(partidas.map((p) => [p.id, p]));
      const categoriasById = new Map(categorias.map((c) => [c.id, c]));
      const preguntasById = new Map(preguntas.map((q) => [q.id, q]));

      const ppByPartida = partida_preguntas.reduce((m, pp) => {
        if (!m.has(pp.partida_id)) m.set(pp.partida_id, []);
        m.get(pp.partida_id).push(pp);
        return m;
      }, new Map());

      // 🔹 NUEVO: mapa de cantidad de ganadores por partida
      const winnersByPartida = (estadisticasTodas ?? []).reduce((acc, est) => {
        if (Number(est.posicion) > 0) {
          const key = est.partida_id;
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      }, {});

      const contar = (arr) => arr.reduce((acc, k) => ((acc[k] = (acc[k] || 0) + 1), acc), {});

      const joined = estadisticas.map((e) => {
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
          .map((pp) => {
            const q = preguntasById.get(pp.pregunta_id);
            return q?.dificultad || null;
          })
          .filter(Boolean);

        const resumenDificultad = contar(dificultadesPorPregunta);

        // 🔹 NUEVO: flag de empate para ESTA estadística
        const ganadoresEnPartida = winnersByPartida[e.partida_id] || 0;
        const empate = ganadoresEnPartida > 1 && partida?.modo === 'multijugador';

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
            ({
              pregunta_id,
              orden,
              question_text_copy,
              question_text_copy_en,
              correct_option_id_copy,
              correct_option_text_copy,
              correct_option_text_copy_en,
            }) => ({
              pregunta_id,
              orden,
              question_text_copy,
              question_text_copy_en,
              correct_option_id_copy,
              correct_option_text_copy,
              correct_option_text_copy_en,
            })
          ),
          dificultad: dificultadesPorPregunta[0],
          resumenDificultad,
          total_preguntas_partida: pps.length,
          empate,
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

      if (!Number.isFinite(idPartida)) {
      } else {
        // 1) obtiene un objeto de partidas con todos sus atributos segun el id de la partida seleccionada en la lista.
        const partidaDelJugador = partidas.filter((e) => Number(e.id) === idPartida);

        // verifica si la partida existe
        if (partidaDelJugador.length !== 0) {
          // 2.1) obtiene el obj de partida_pregunta.
          const objPartida_Pregunta = partida_preguntas.find(
            (partida_pregunta) => partida_pregunta.partida_id == partidaDelJugador[0].id
          );

          // 2.2) obtiene el id de categoria.
          const categoriaIds = partidaDelJugador[0].categoria_id;

          // 3) obtiene el string categoria
          const objCategoria = categorias.find((category) => category.id == categoriaIds);

          // 4) filtra el array preguntas segun el id de categoria y obtiene un array de 10 objetos de preguntas
          const resultDificultad = preguntas.find(
            (pregunta) => pregunta.id == objPartida_Pregunta.pregunta_id
          );

          // 5) obtiene el valor string de la dificultad del objeto pregunta (categoria_id)
          const dificultadPregunta = resultDificultad.dificultad;

          // 6) obtiene el objeto partida_jugadores asi se puede ver los id/s de los jugador/es de la partida
          const jugadoresDeUnaPartdia = partida_jugadores.find(
            (e) => Number(e.partida_id) === idPartida
          );

          // 🔹 NUEVO: calcular empate usando estadisticas
          const winnersEstaPartida = (estadisticasTodas ?? []).filter(
            (est) => Number(est.partida_id) === idPartida && Number(est.posicion) > 0
          );
          const empate = winnersEstaPartida.length > 1;
          // 7) obtiene un array donde se verifica las preguntas que se eligieron al azar el orden de la partida (partida_preguntas)
          const preguntasDeLaPartida = partida_preguntas.filter(
            (e) => Number(e.partida_id) === idPartida
          );
          // 8) obtiene un array de las respuestas que el jugador selecciono en la partida (respuestas)
          const respuestasDeLaPartida = respuestas.filter(
            (e) => Number(e.partida_id) === idPartida
          );
          // 9) se crea un array indexado donde los elementos son  id de opciones de respuesta del array respuestasDeLaPartida
          const arrayPreguntasIdsDeLaPartida = respuestasDeLaPartida.map((opcion) => ({
            opcionId: opcion.opcion_elegida_id,
            pregunta_id: opcion.pregunta_id,
            es_correcta: opcion.es_correcta,
          })); // es_correcta se puede eliminar

          // 10) obtiene un array de opciones de respuestas segun la preguntas. como hay 10 preguntas, va haber 40 opciones de respuestas
          // 10.1) Normalizá y armá un Set con los preguntaId de la partida
          const preguntaIdsSet = new Set(
            (arrayPreguntasIdsDeLaPartida ?? []).map((x) => Number(x.pregunta_id))
          );

          // 10.2) Filtrá opciones por partida y por pertenencia de pregunta_id al Set
          const opcionesDeLaPartida = (opciones ?? []).filter(
            (o) => Number(o.pregunta_id) && preguntaIdsSet.has(Number(o.pregunta_id))
          );
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
            empate,
          };
        } else {
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
      e?.modo === 'individual' ? 'practica' : e?.modo === 'multijugador' ? 'multijugador' : '';

    const fecha = formatDateDMYLocal(e?.ended_at) ?? '-'; // ej: 11/11/2025
    const hora = formatTimeHMLocal(e?.ended_at) ?? '-'; // ej: 23:35
    const modo = modeTranslations[e?.modo] ?? e?.modo ?? '';
    const cat = categoryTranslations[e?.categoria] ?? e?.categoria ?? '';

    // dificultad de PREGUNTA (texto traducido o crudo)
    const diffPregunta =
      difficultyTranslations[e?.dificultad_pregunta ?? e?.dificultad] ??
      e?.dificultad_pregunta ??
      e?.dificultad ??
      '';

    // dificultad de TIEMPO (texto traducido o crudo)
    const diffTiempo =
      timeDifficultyTranslations?.[e?.dificultad_tiempo] ?? e?.dificultad_tiempo ?? '';

    // 🔹 NUEVO: etiqueta de resultado para el buscador
    let etiquetaResultado = '';
    if (e?.modo === 'multijugador') {
      if (e.empate) {
        // importantes las palabras en castellano para que el user pueda buscar
        etiquetaResultado = 'empate draw';
      } else if (Number(e.posicion) > 0) {
        etiquetaResultado = 'ganaste victoria win';
      } else {
        etiquetaResultado = 'perdiste derrota loss';
      }
    } else if (e?.modo === 'individual') {
      etiquetaResultado = 'practica entrenamiento';
    }

    return normalize(
      [
        etiquetaPractica,
        etiquetaResultado, // 👈 ahora “empate”, “ganaste”, etc. forman parte del texto buscable
        fecha,
        hora,
        modo,
        cat,
        diffPregunta,
        diffTiempo,
      ]
        .filter(Boolean)
        .join(' ')
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
      return tokens.every((tok) => haystack.includes(tok));
    });
    setListaFiltrada(filtrados);
  };

  // ENTER dispara búsqueda
  const onKeyDownSearch = (ev) => {
    if (ev.key === 'Enter') handleSearch();
  };

  // si borrás todo, resetea automáticamente
  const onChangeSearch = (ev) => {
    const val = ev.target.value;
    setSearch(val);
    if (val.trim() === '') {
      setListaFiltrada(listaObjetosPartidaInformacion); // volver al estado original
    }
  };

  // botón para limpiar
  const handleClear = () => {
    setSearch('');
    setListaFiltrada(listaObjetosPartidaInformacion);
  };

  // helper para saber si hay consulta activa
  const hasQuery = normalize(search) !== '';

  const getJugador = async (id) => {
    const num = Number(id);

    // 👇 filtro: nada de 0, negativos o NaN
    if (!Number.isFinite(num) || num <= 0) {
      console.warn('getJugador: id inválido', id);
      return null;
    }

    try {
      const { data } = await axios.get(`${API_URL}/jugadores/${num}`);
      return data ?? null;
    } catch (e) {
      console.error('GET /jugadores/:id', e.response?.data?.error || e.message);
      return null;
    }
  };

  const getUsuario = async (id) => {
    try {
      const { data } = await axios.get(`${API_URL}/users/${id}`);
      if (!data) return null;
      const { password, ...safe } = data;
      return safe;
    } catch (e) {
      console.error('GET /users/:id', e.response?.data?.error || e.message);
      return null;
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

      const { data } = await axios.get(`${API_URL}/amigos`, {
        params: { amigo_id: jugador_id }, // 👈 ahora jugador_id
      });

      // solo solicitudes pendientes
      const pendientes = (data ?? []).filter((a) => !a.aceptado_en);
      setFriendRequests(pendientes);
    } catch (error) {
      console.log('@@@@ Error GET: friend requests\n', error);
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
          getAllUsers(),
          ,
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
    estadisticasTodas,
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

      // 2) Traer jugadores en paralelo
      const jugadoresArr = await Promise.all(jugadorIds.map((id) => getJugador(id)));
      const jugadores = jugadoresArr.filter(Boolean).map((j) => {
        const id = Number(j.id ?? j.jugador_id);
        const user_id = Number(j.user_id ?? j.usuario_id ?? j.userId);
        return { ...j, id, user_id: Number.isFinite(user_id) ? user_id : null };
      });

      // Diccionario por id de jugador
      const jugadoresById = Object.fromEntries(jugadores.map((j) => [String(j.id), j]));

      // 3) IDs únicos de usuarios (desde jugadores)
      const userIds = [
        ...new Set(jugadores.map((j) => Number(j.user_id)).filter((n) => Number.isFinite(n))),
      ];

      // 4) Traer usuarios en paralelo
      const usuariosArr = await Promise.all(userIds.map((id) => getUsuario(id)));
      const usuarios = usuariosArr.filter(Boolean).map((u) => {
        const id = Number(u.id ?? u.user_id ?? u.usuario_id ?? u.userId);
        const { password, pass, ...safe } = u; // por si llegara a venir
        return { ...safe, id };
      });

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
      }
    })();

    return () => {
      cancel = true;
    };
  }, [arraySalaJugadores]);

  useEffect(() => {
    const objDos = inventarioInforCompletaDeTodasLasPartidas(); // debe ser una funcion pura (sin setState adentro)
    setListaObjetosPartidaInformacion((prev) =>
      JSON.stringify(prev) === JSON.stringify(objDos) ? prev : objDos
    );
  }, [partidas, preguntas, categorias, estadisticas]);

  // verifica los modales abiertos asi despues no desaparece el cursor vertical
  const algunModalAbierto =
    !!selectedPerfil ||
    !!selectedEstadisticas ||
    !!modalEstadisticaAbierto ||
    !!selectedAvatar || // ahora sí: trata null / false como false
    !!showAvatarsList ||
    !!avatarConfirm.open;
  // verifica los estados de los modales asi despues no desaparece el cursor vertical
  useEffect(() => {
    if (!algunModalAbierto) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prev;
    };
  }, [
    algunModalAbierto,
    selectedPerfil,
    selectedEstadisticas,
    modalEstadisticaAbierto,
    selectedAvatar,
    showAvatarsList,
    avatarConfirm.open,
  ]);

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
      (sj) => salaIdActual != null && Number(sj.sala_id) === Number(salaIdActual)
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
        (jidA === miJid && jidB === otroJid) || (jidA === otroJid && jidB === miJid);

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
      await axios.put(`${API_URL}/amigos/${solicitudId}`, {
        aceptado_en,
      });

      // 2) La saco de las solicitudes pendientes (UI de arriba)
      setFriendRequests((prev) => prev.filter((r) => Number(r.id) !== idNum));

      // 3) Actualizo "amigos" localmente para que el effect de friendsDetails la vea
      setAmigos((prev) => {
        // ¿ya existe un registro con ese id en amigos?
        const existe = prev.some((a) => Number(a.id) === idNum);

        if (existe) {
          // lo actualizo agregando aceptado_en
          return prev.map((a) => (Number(a.id) === idNum ? { ...a, aceptado_en } : a));
        }

        // si no existe, la busco en friendRequests (estado actual del componente)
        const original = friendRequests.find((r) => Number(r.id) === idNum);

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
      await axios.delete(`${API_URL}/amigos/eliminar/${solicitudId}`);
      setFriendRequests((prev) => prev.filter((r) => r.id !== solicitudId));
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        const aceptados = (amigos ?? []).filter(Boolean).filter((a) => !!a.aceptado_en);

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
                ? jidB // yo soy jugador_id → amigo es el otro
                : miJid === jidB
                  ? jidA // yo soy amigo_id → jugador_id es el otro
                  : jidB; // fallback por las dudas

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
    <div className='w-full max-w-5xl mx-auto px-2 sm:px-4 mb-6 mt-8 sm:mt-12 lg:mt-16'>
      {/* ====================== PERFIL ====================== */}
      <div className='flex flex-col items-center h-fit w-full'>
        <motion.div
          className='h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 
                 bg-gray-200/90 hover:bg-gray-300/90 rounded-full cursor-pointer  
                 text-black text-4xl sm:text-5xl md:text-6xl text-center 
                 flex items-center justify-center'
          whileTap={{ scale: 1.2 }}
          onClick={() => setSelectedPerfil(true)}
          role='button'
          aria-pressed={selectedPerfil}
        >
          {!fotoUrl ? (
            <p>👤</p>
          ) : (
            <img
              src={resolveFotoAjena(fotoUrl)}
              alt='Foto de perfil'
              className='w-full h-full rounded-full object-cover bg-white/20'
            />
          )}
        </motion.div>

        {/* ============ MODAL FOTO PERFIL ============ */}
        {selectedPerfil && (
          <motion.div
            onClick={(e) => {
              e.stopPropagation();
            }}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className='fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm 
               flex items-start justify-center pt-[88px] sm:pt-[96px]'
          >
            <div className='relative w-[90vw] max-w-sm sm:max-w-md md:max-w-lg 
                    rounded-2xl p-4 sm:p-6 flex flex-col items-center'>
              {/* cerrar */}
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

              {/* avatar grande */}
              <div className='relative flex flex-col items-center'>
                {!fotoUrl ? (
                  <div className='w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] 
                              bg-gray-200/90 rounded-full flex items-center justify-center'>
                    <span className='text-[80px] sm:text-[120px]'>👤</span>
                  </div>
                ) : (
                  <img
                    src={fotoUrl}
                    alt='Foto de perfil'
                    className='w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] 
                           rounded-full object-cover bg-white/20'
                  />
                )}

                {/* botón editar sobre la foto */}
                {!selectedPefilEditar && !avatarConfirm.open && (
                  <motion.button
                    type='button'
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    className='absolute bottom-2 right-2
                           rounded-full px-3 py-1.5 bg-black/80 text-white text-xs sm:text-sm
                           cursor-pointer'
                    aria-pressed={selectedPefilEditar}
                    onClick={() => setSelectedPefilEditar(true)}
                  >
                    Editar
                  </motion.button>
                )}
              </div>

              {/* MENÚ EDITAR */}
              {selectedPefilEditar && !avatarConfirm.open && (
                <>
                  {!showDeleteBar && (
                    <div className='mt-4 w-full max-w-xs sm:max-w-sm bg-white text-black rounded-2xl px-3 py-3'>
                      <ul className='space-y-2 text-sm sm:text-base'>
                        {/* Elegir de la biblioteca */}
                        <li className='flex flex-row gap-2 items-center justify-between'>
                          <div>
                            <input
                              id='file-picker'
                              ref={fileInputRef}
                              type='file'
                              accept='image/*'
                              className='sr-only'
                              onChange={onPickFile}
                            />

                            <label
                              htmlFor='file-picker'
                              className='rounded-md text-black hover:text-gray-600 cursor-pointer'
                            >
                              Elegir de la biblioteca
                            </label>

                            {/* Modal de recorte */}
                            {cropModalOpen && (
                              <div className='fixed inset-0 z-[70] bg-black/60 flex items-start justify-center pt-16 sm:pt-20'>
                                <div className='bg-white rounded-2xl p-4 w-[90vw] max-w-xl'>
                                  <div className='relative w-full h-[60vh] max-h-[70vh] bg-black/5 rounded'>
                                    {tempImageUrl && (
                                      <Cropper
                                        image={tempImageUrl}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        cropShape='round'
                                        showGrid={false}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={onCropComplete}
                                      />
                                    )}
                                  </div>

                                  <div className='mt-4 flex items-center justify-between gap-3'>
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
                                        onClick={async () => {
                                          await aplicarRecorte();
                                          setSelectedPefilEditar(false);
                                        }}
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
                            className='text-end rounded-full w-6 h-6 flex items-center justify-center
                                   hover:text-red-500 cursor-pointer text-md text-red-600'
                            onClick={() => setSelectedPefilEditar(false)}
                          >
                            ✕
                          </button>
                        </li>

                        {/* Elegir avatar */}
                        <li
                          className='cursor-pointer hover:text-gray-600'
                          onClick={() => {
                            setSelectedAvatar(true);
                          }}
                        >
                          Elegir un avatar
                        </li>

                        {/* Eliminar foto */}
                        {fotoUrl && (
                          <li className='cursor-pointer text-red-500 hover:text-red-700'>
                            <button
                              type='button'
                              onClick={() => setShowDeleteBar(true)}
                              disabled={eliminando}
                              className='cursor-pointer hover:text-red-500 text-red-600 disabled:opacity-50'
                            >
                              {eliminando ? 'Eliminando...' : 'Eliminar foto'}
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Confirmar borrado */}
                  <AnimatePresence>
                    {showDeleteBar && (
                      <motion.div
                        key='eliminar-foto-bar'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className='mt-3 w-full max-w-xs sm:max-w-sm
                               bg-black/80 text-white rounded-2xl px-4 py-4 shadow-2xl text-sm sm:text-base'
                      >
                        <div className='flex justify-center'>
                          <span className='mr-2 text-center w-full'>
                            ¿Seguro que querés eliminar tu foto de perfil?
                          </span>
                        </div>

                        <div className='flex flex-row gap-4 mt-4 justify-center'>
                          <button
                            type='button'
                            onClick={() => setShowDeleteBar(false)}
                            className='px-3 py-1.5 rounded-md bg-gray-600 hover:bg-gray-800 text-white text-sm cursor-pointer'
                          >
                            Cancelar
                          </button>

                          <button
                            type='button'
                            onClick={eliminarFoto}
                            disabled={eliminando}
                            className='px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50 cursor-pointer'
                          >
                            {eliminando ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Confirmar avatar */}
              <AnimatePresence>
                {avatarConfirm.open && avatarConfirm.avatar && (
                  <motion.div
                    key='confirm-avatar-bar'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className='mt-3 w-full max-w-xs sm:max-w-sm
                           bg-black/80 text-white rounded-2xl px-4 py-4 shadow-2xl text-sm sm:text-base'
                  >
                    <div className='flex justify-center'>
                      <span className='text-md text-center text-slate-200 mt-1'>
                        ¿Quieres usar este avatar?
                      </span>
                    </div>

                    <div className='flex justify-center gap-3 mt-4'>
                      <button
                        type='button'
                        className='px-3 py-1.5 rounded-md bg-slate-600 text-white hover:bg-slate-500 cursor-pointer text-sm'
                        onClick={() => setAvatarConfirm({ open: false, avatar: null })}
                      >
                        {t('cancel') ?? 'Cancelar'}
                      </button>

                      <button
                        type='button'
                        className='px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-800 text-white disabled:opacity-60 cursor-pointer text-sm'
                        disabled={applyingAvatar}
                        onClick={handleApplyAvatar}
                      >
                        {applyingAvatar ? 'Aplicando...' : 'Usar avatar'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Guardar foto recortada */}
              <AnimatePresence>
                {preview && !cropModalOpen && (
                  <motion.div
                    key='guardar-foto-bar'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className='mt-3 w-full max-w-xs sm:max-w-sm
                           bg-black/80 text-white rounded-2xl px-4 py-4 shadow-2xl text-sm sm:text-base'
                  >
                    <div className='flex justify-center'>
                      <span className='mr-2 text-center w-full'>
                        ¿Quieres guardar esta foto?
                      </span>
                    </div>

                    <div className='flex flex-row gap-4 mt-4 justify-center'>
                      <button
                        type='button'
                        onClick={cancelarFotoLocal}
                        className='px-3 py-1.5 rounded-md bg-gray-600 hover:bg-gray-800 text-white text-sm cursor-pointer'
                      >
                        Cancelar
                      </button>

                      <button
                        type='button'
                        onClick={subirFoto}
                        disabled={subiendo}
                        className='px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-800 text-white text-sm disabled:opacity-50 cursor-pointer'
                      >
                        {subiendo ? 'Subiendo...' : 'Guardar foto'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* MODAL lista de avatares (desde menú editar) */}
              <AnimatePresence>
                {selectedAvatar && (
                  <motion.div
                    key='modal-avatares'
                    className='fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm
                 flex items-start justify-center
                 pt-[88px] sm:pt-[96px] lg:pt-[104px]'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      onClick={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className='relative w-[95vw] max-w-4xl max-h-[80vh] bg-indigo-900 text-white
                   rounded-2xl shadow-2xl p-6 flex flex-col'
                    >
                      {/* ...todo lo de adentro igual... */}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}

        {/* nombre + puntos */}
        <p className='mt-2 text-2xl sm:text-3xl md:text-4xl text-white text-center break-words'>
          {perfil.name}
        </p>
        <p className='text-gray-400 text-base sm:text-lg md:text-xl mt-2 sm:mt-4'>
          {t('points')}: {user.puntaje}
        </p>
      </div>

      {/* ============================= botón de avatares ========================================================= */}
      {/* botón "mis avatares" */}
      <div className='flex flex-col items-center mt-6 h-fit w-full'>
        <motion.button
          className='bg-fuchsia-500 hover:bg-pink-500/90 text-white rounded-xl px-4 py-2 mb-4 cursor-pointer text-sm sm:text-base'
          whileTap={{ scale: 1.2 }}
          onClick={() => {
            setShowAvatarsList(true);
          }}
          type='button'
        >
          {t('myavatars')}
        </motion.button>

        {/* lista de avatares del jugador: SIN AVATARES */}
        {inventarioAvataresDos().length === 0 && showAvatarsList ? (
          <div className='fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24 sm:pt-28'>
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              className='relative w-[90vw] max-w-md rounded-2xl bg-indigo-900 text-white p-6 shadow-2xl flex flex-col'
            >
              <button
                type='button'
                aria-label='Cerrar'
                className='absolute top-2 right-2 rounded-full w-9 h-9 
                       grid place-items-center hover:bg-black/5 active:scale-95 
                       cursor-pointer text-2xl'
                onClick={() => setShowAvatarsList(false)}
              >
                ✕
              </button>
              <h2 className='text-lg sm:text-xl font-semibold mb-2'>{t('avatarsList')}</h2>
              <hr />
              <p className='mt-3 text-center text-sm sm:text-base'>{t('noHaveAvatars')}</p>
            </motion.div>
          </div>
        ) : (
          <>
            {/* lista de avatares del jugador: CON AVATARES */}
            {showAvatarsList && (
              <div
                className='fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm
               flex items-start justify-center
               pt-[88px] sm:pt-[96px] lg:pt-[104px]'
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 0 }}
                  className='relative w-[95vw] max-w-3xl max-h-[80vh] rounded-2xl
                 bg-indigo-900 text-white p-6 shadow-2xl flex flex-col'
                >
                  {/* ...todo lo de adentro igual... */}
                </motion.div>
              </div>
            )}

          </>
        )}
      </div>

      {/* =============================== Mi Perfil ======================================================= */}
      {/* Mi Perfil */}
      <div className='mt-4 space-y-4 w-full max-w-2xl mx-auto'>
        <h2 className='text-xl text-white font-semibold'>{t('personalData')}</h2>
        {!editMode ? (
          <div className='space-y-2 bg-white/10 text-white p-4 text-base sm:text-lg rounded-xl'>
            <p>
              <b>{t('formName')}:</b> {perfil.name}
            </p>
            <p>
              <b>{t('email')}:</b> {perfil.email}
            </p>
            <p>
              <b>{t('country') || 'País'}:</b> {perfil.pais}
            </p>
            <p>
              <b>{t('pass')}:</b> ••••••
            </p>
            <button
              className='px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 cursor-pointer text-sm sm:text-base'
              onClick={() => {
                setEditMode(true);
                setForm({
                  name: perfil.name || '',
                  email: perfil.email || '',
                  pais: perfil.pais || '',
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
          <form
            onSubmit={handleSave}
            className='space-y-3 bg-white/10 text-white p-4 rounded-xl text-sm sm:text-base'
          >
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
              <label className='block text-sm mb-1'>{t('country') || 'País'}</label>

              <select
                name='pais'
                value={form.pais}
                onChange={handleChange}
                className='w-full px-3 py-2 rounded text-black bg-white/90 hover:bg-white'
              >
                <option value=''>{'Seleccioná un país' || t('selectCountry')}</option>
                {paises.map((p) => (
                  <option key={p.codigo} value={p.nombre}>
                    {p.nombre}
                  </option>
                ))}
              </select>

              {loadingPaises && (
                <p className='text-xs text-gray-300 mt-1'>
                  {t('loadingCountries') || 'Cargando países...'}
                </p>
              )}
              {errorPaises && (
                <p className='text-xs text-red-400 mt-1'>
                  {t('errorCountries') || 'No se pudieron cargar los países'}
                </p>
              )}

              {formErrors.pais && <p className='text-red-500 text-sm'>{formErrors.pais}</p>}
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
              <label className='block text-sm mb-1'>{t('confimPass')}</label>
              <input
                type='password'
                name='confirmPassword'
                value={form.confirmPassword}
                onChange={handleChange}
                className='w-full px-3 py-2 rounded text-black bg-white/90 hover:bg-white'
                placeholder={t('repeatPass')}
              />
              {formErrors.confirmPassword && (
                <p className='text-red-500 text-sm'>{formErrors.confirmPassword}</p>
              )}
            </div>

            <div className='flex gap-2 flex-wrap'>
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
                    pais: perfil.pais || '',
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
        <div className='w-full mt-6'>
          {/* Tabs Estadísticas */}
          <div className='flex flex-wrap items-center gap-2 justify-center sm:justify-start'>
            <button type='button'>
              <h2 className='text-lg sm:text-xl font-semibold mb-1 sm:mb-3 text-fuchsia-500/95 p-1'>
                {t('machtResults')}
              </h2>
            </button>
            <h2 className='text-lg sm:text-xl text-white flex items-center justify-center p-1'>|</h2>
            <button
              type='button'
              onClick={() => {
                setSelectedEstadisticasResultadosDePartidas(false);
              }}
            >
              <h2 className='text-lg sm:text-xl text-white font-semibold mb-1 sm:mb-3 cursor-pointer hover:text-fuchsia-500/95 p-1'>
                {t('stadisticGrafict')}
              </h2>
            </button>
          </div>

          {estadisticas.length === 0 ? (
            <p className='mt-2 indent-2 text-white text-sm sm:text-base'>
              {t('noResultsMatches')}
            </p>
          ) : (
            <div className='mt-3'>
              {/* buscador de estadísticas */}
              <div className='relative w-full max-w-md mb-4'>
                <input
                  className='bg-white/95 w-full indent-2 border rounded-xl px-2 py-2 text-black text-sm sm:text-base placeholder-black/70 hover:bg-white'
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
                       bg-slate-800 hover:bg-slate-700 px-2 border border-transparent text-xs sm:text-sm transition-all 
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
                <div className='p-3 rounded-xl bg-white/10 text-white text-sm sm:text-base'>
                  {'No encontramos resultados' ?? t('noResults')}: <b>"{search}"</b>
                </div>
              ) : (
                <ul className='space-y-2'>
                  {(visible ?? []).map((e, index) => {
                    const globalIndex = startIndex + index;

                    // etiqueta / color
                    let etiqueta;
                    let claseColor;

                    if (e?.modo === 'individual') {
                      etiqueta = t('practice');
                      claseColor = 'text-yellow-400';
                    } else if (e.empate) {
                      etiqueta = t('draw');
                      claseColor = 'text-blue-400';
                    } else if (e.posicion > 0) {
                      etiqueta = t('youWon');
                      claseColor = 'text-green-500';
                    } else {
                      etiqueta = t('youLoss');
                      claseColor = 'text-red-500';
                    }

                    return (
                      <motion.li
                        key={e.id}
                        className='border rounded-xl p-3 sm:p-4 bg-white/10 hover:bg-white/20 
                               flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 cursor-pointer'
                        whileTap={{ scale: 1.03 }}
                        onClick={() => {
                          setSelectedEstadisticas(globalIndex);
                          setPartidaIdSeleccionada(e.partida_id);
                          setModalEstadisticaAbierto(true);
                        }}
                      >
                        <p className={`${claseColor} text-sm sm:text-base`}>{etiqueta}</p>

                        <div className='flex flex-col sm:flex-row flex-wrap gap-1 sm:gap-4 text-xs sm:text-sm text-white'>
                          <p>
                            {t('date')}: {formatDateDMYLocal(e?.ended_at) ?? '-'}
                          </p>
                          <p>
                            {t('dateHs')}: {formatTimeHMLocal(e?.ended_at) ?? '-'}
                          </p>
                          <p>
                            {t('mode')}: {modeTranslations[e?.modo] ?? '-'}
                          </p>
                          <p>
                            {t('category')}: {categoryTranslations[e?.categoria] ?? '-'}
                          </p>
                          <p>
                            {t('dificultyquestion')}:{' '}
                            {difficultyTranslations[e?.dificultad] ?? '-'}
                          </p>
                          <p>
                            {t('dificultytime')}:{' '}
                            {timeDifficultyTranslations[e?.dificultad_tiempo] ?? '-'}
                          </p>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              )}

              {/* Paginado */}
              {total > PAGE_SIZE && (
                <div className='mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm'>
                  <span className='text-white/80'>
                    {t('showing')} {startIndex + 1}–{endIndex} {t('of')} {total}
                  </span>

                  <div className='flex items-center gap-1'>
                    <button
                      type='button'
                      onClick={goPrev}
                      disabled={currentPage === 1}
                      className={`px-2 py-1 rounded-lg bg-white/10 text-white disabled:opacity-50 hover:bg-white/20 ${currentPage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    >
                      ‹
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type='button'
                        onClick={() => goTo(p)}
                        className={`px-2 py-1 rounded-lg ${p === currentPage
                          ? 'bg-slate-800 cursor-not-allowed text-white'
                          : 'bg-white/10 text-white cursor-pointer hover:bg-white/20'
                          }`}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      type='button'
                      onClick={goNext}
                      disabled={currentPage === totalPages}
                      className={`px-2 py-1 rounded-lg bg-white/10 text-white disabled:opacity-50 hover:bg-white/20 ${currentPage === totalPages ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal detalle de partida */}
          {selectedEstadisticas !== null && partidaSeleccionada && (
            <div
              className='fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm 
  overflow-y-auto flex justify-center pt-12 sm:pt-16 pb-12'
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                className='w-[92vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw]
  max-w-[1200px]
  rounded-2xl bg-gradient-to-b from-violet-900 via-purple-700 to-purple-900
  text-white shadow-2xl p-3 sm:p-4
  flex flex-col mx-fit'
              >
                {/* seccion de resumen */}
                {selectedEstResumen && (
                  <>
                    {/* header */}
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='flex flex-wrap gap-2 mb-2 w-fit text-lg sm:text-2xl'>
                        <button
                          type='button'
                          className='rounded text-fuchsia-500 [text-shadow:_0_4px_8px_#000000] px-2 py-1 sm:w-48 text-left'
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
                          className='px-2 py-1 sm:w-48 text-left cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
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
                          className='px-2 py-1 text-left cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
                        >
                          {t('answerGrafics')}
                        </button>
                      </div>

                      {/* cerrar */}
                      <button
                        type='button'
                        aria-label='Cerrar'
                        className='ml-auto rounded-full w-8 h-8 sm:w-9 sm:h-9 grid place-items-center text-xl sm:text-2xl cursor-pointer
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

                    {/* info detallada */}
                    <div
                      className='bg-gradient-to-b from-purple-800 via-purple-700 to-purple-800
                             rounded-xl p-3 sm:p-4 mt-1 text-base sm:text-xl flex-1 min-h-0 overflow-y-auto'
                    >
                      <p className='p-1'>
                        <strong>{t('position')}:</strong>{' '}
                        {partidaSeleccionada.modo === 'individual'
                          ? t('practice')
                          : partidaSeleccionada.empate
                            ? t('draw')
                            : partidaSeleccionada.posicion > 0
                              ? t('won')
                              : t('youLoss')}
                      </p>
                      <p className='p-1'>
                        <strong>{t('scoreGeneral')}:</strong> {partidaSeleccionada.puntaje_total}
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
                        {timeDifficultyTranslations[partidaSeleccionada?.dificultad_tiempo] ?? '—'}
                      </p>
                      <p className='p-1'>
                        <strong>{t('matchTime')}:</strong>{' '}
                        {fmtMsDetallado(partidaSeleccionada.tiempo_total_ms)}
                      </p>

                      {/* contrincante */}
                      {objetoPartidaCompleto?.partida?.[0]?.modo === 'multijugador' &&
                        contrincante && (
                          <div className='mt-4 pt-3 border-t border-purple-600/60 text-base sm:text-lg'>
                            <h3 className='font-semibold mb-3'>Contrincante</h3>

                            <div className='flex flex-col sm:flex-row items-center gap-4'>
                              <div className='w-16 h-16 rounded-full overflow-hidden bg-black/30 flex items-center justify-center'>
                                {(() => {
                                  const fotoContrincante = contrincante.usuario?.foto_perfil
                                    ? resolveFotoAjena(contrincante.usuario.foto_perfil)
                                    : null;

                                  return fotoContrincante ? (
                                    <img
                                      src={resolveFotoAjena(fotoContrincante)}
                                      alt={contrincante.usuario?.name ?? 'Contrincante'}
                                      className='w-16 h-16 object-cover'
                                    />
                                  ) : (
                                    <span className='text-2xl'>👤</span>
                                  );
                                })()}
                              </div>

                              <div className='flex flex-col text-sm sm:text-base'>
                                <span className='font-semibold'>
                                  {contrincante.usuario?.name ?? '—'}
                                </span>
                                <span className='text-purple-200'>
                                  {contrincante.usuario?.email ?? '—'}
                                </span>

                                {friendMessage && (
                                  <span className='mt-1 text-xs text-purple-200'>
                                    {friendMessage}
                                  </span>
                                )}
                              </div>

                              <button
                                type='button'
                                disabled={
                                  esAmigo ||
                                  pendienteConContrincante ||
                                  addingFriendId === contrincante.jugador?.id
                                }
                                onClick={() => handleAgregarAmigo(contrincante)}
                                className={`mt-2 sm:mt-0 sm:ml-auto px-4 py-2 rounded-xl text-xs sm:text-sm cursor-pointer
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
                    </div>
                  </>
                )}

                {/* seccion de respuestas */}
                {selectedEstRespuestas && (
                  <>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='flex flex-wrap gap-2 mb-2 w-fit text-lg sm:text-2xl'>
                        <button
                          type='button'
                          onClick={() => {
                            setSelectedEstResumen(true);
                            setSelectedEstRespuestas(false);
                          }}
                          className='px-2 py-1 sm:w-48 text-left cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
                        >
                          {t('resume')}
                        </button>

                        <div className='flex items-center justify-center'>|</div>

                        <button
                          type='button'
                          className='rounded px-2 py-1 sm:w-48 text-left text-fuchsia-500 [text-shadow:_0_4px_8px_#000000]'
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
                          className='px-2 py-1 text-left cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
                        >
                          {t('answerGrafics')}
                        </button>
                      </div>

                      <button
                        type='button'
                        aria-label='Cerrar'
                        className='ml-auto rounded-full w-8 h-8 sm:w-9 sm:h-9 grid place-items-center text-xl sm:text-2xl cursor-pointer
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

                    <div className='flex-1 min-h-0'>
                      <div
                        ref={listRef}
                        className='h-full overflow-y-auto overscroll-contain touch-pan-y pr-2
                               bg-gradient-to-b from-purple-800 via-purple-700 to-purple-800
                               rounded-xl'
                      >
                        <div className='flex flex-row flex-wrap gap-2 mb-2 sticky top-0 p-2 bg-purple-800 text-sm sm:text-base'>
                          <button
                            onClick={() =>
                              setOpenPreguntaIds(
                                new Set(
                                  (objetoPartidaCompleto?.preguntasDeLaPartida ?? []).map((e) =>
                                    Number(e.pregunta_id ?? e.id)
                                  )
                                )
                              )
                            }
                            className='hover:text-rose-400 rounded p-1 cursor-pointer'
                          >
                            {t('openAnswer')}
                          </button>

                          <button
                            onClick={() => setOpenPreguntaIds(new Set())}
                            className='hover:text-rose-400 rounded p-1 cursor-pointer'
                          >
                            {t('closeAnswer')}
                          </button>
                        </div>

                        {objetoPartidaCompleto?.preguntasDeLaPartida?.length ? (
                          <ul className='p-2 space-y-2'>
                            {(objetoPartidaCompleto?.preguntasDeLaPartida ?? []).map((e, index) => (
                              <motion.li
                                key={Number(e.pregunta_id ?? e.id)}
                                className='border rounded-xl p-3 odd:bg-black/5 even:bg-black/30 flex flex-col'
                                whileTap={{ scale: 1.01 }}
                              >
                                <button
                                  type='button'
                                  className='text-left w-full cursor-pointer hover:bg-black/30 rounded p-0.5 text-base sm:text-lg'
                                  onClick={() => togglePregunta(Number(e.pregunta_id ?? e.id))}
                                >
                                  <span className='shrink-0 inline-flex items-center justify-center w-7 h-7 font-semibold'>
                                    {`${index + 1})`}
                                  </span>

                                  <span className='leading-snug'>
                                    {idioma === 'en'
                                      ? e.question_text_copy_en
                                      : e.question_text_copy}
                                  </span>
                                </button>

                                {openPreguntaIds.has(Number(e.pregunta_id ?? e.id)) && (
                                  <>
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
                                              'block mb-1 indent-2 rounded text-base sm:text-lg border',
                                              (() => {
                                                const qId = Number(e.pregunta_id ?? e.id);
                                                const chosenId = elegidaPorPregunta.get(qId);
                                                const userCorrect = !!correctaPorPregunta.get(qId);
                                                const isChosen = chosenId === Number(o.id);
                                                const isOptionCorrect = !!o.es_correcta;

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
                                              const qId = Number(e.pregunta_id ?? e.id);
                                              const chosenId = elegidaPorPregunta.get(qId);
                                              const userCorrect = !!correctaPorPregunta.get(qId);
                                              const isChosen = chosenId === Number(o.id);
                                              const isOptionCorrect = !!o.es_correcta;

                                              if (isChosen) return userCorrect ? '✅ ' : '❌ ';
                                              if (isOptionCorrect) return '🥲 ';
                                              return '';
                                            })()}
                                            {idioma === 'en' ? o.texto_en : o.texto}
                                          </span>
                                        ))}
                                    </div>

                                    <div className='mt-1 text-xs sm:text-sm opacity-80'>
                                      {t('answerTime')}:{' '}
                                      <b>
                                        {fmtMs(
                                          tiempoPorPregunta.get(
                                            Number(e.pregunta_id ?? e.id)
                                          )
                                        )}
                                      </b>
                                    </div>
                                  </>
                                )}
                              </motion.li>
                            ))}
                          </ul>
                        ) : (
                          <span className='p-2 text-sm sm:text-base'>{t('answerList')}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* seccion de grafica de respuestas */}
                {selectedEstGraficaDeRespuestas && (
                  <>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='flex flex-wrap gap-2 mb-2 w-fit text-lg sm:text-2xl'>
                        <button
                          type='button'
                          onClick={() => {
                            setSelectedEstResumen(true);
                            setSelectedEstGraficaDeRespuestas(false);
                          }}
                          className='px-2 py-1 sm:w-48 text-left cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
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
                          className='px-2 py-1 sm:w-48 text-left cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
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
                          className='text-fuchsia-500 rounded px-2 py-1 [text-shadow:_0_4px_8px_#000000]'
                        >
                          {t('answerGrafics')}
                        </button>
                      </div>

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
                        className='ml-auto rounded-full w-8 h-8 sm:w-9 sm:h-9 grid place-items-center text-xl sm:text-2xl cursor-pointer hover:text-fuchsia-500 hover:drop-shadow-[0_4px_8px_#000000]'
                      >
                        ✕
                      </button>
                    </div>

                    <div className='text-sm sm:text-xl rounded p-1.5 mt-1 flex-1 min-h-0 overflow-y-auto'>
                      {objetoPartidaCompleto.partida[0].modo === 'individual' ? (
                        <div className='bg-gradient-to-b from-purple-800 via-purple-700 to-purple-800 rounded-xl'>
                          <ChartVerticalLabels
                            arregloCompleto={objetoPartidaCompleto}
                            className='mt-1 p-1'
                          />
                        </div>
                      ) : (
                        <div className='bg-gradient-to-b from-purple-800 via-purple-700 to-purple-800 rounded-xl mt-2 sm:mt-4'>
                          <ChartMultilineLabels
                            arregloCompleto={objetoPartidaCompleto}
                            className='mt-1 p-1'
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )
          }
        </div >
      ) : (
        <div className='w-full mt-6'>
          {/* Tabs Estadísticas generales */}
          <div className='flex flex-wrap items-center gap-2 justify-center sm:justify-start'>
            <button
              type='button'
              onClick={() => {
                setSelectedEstadisticasResultadosDePartidas(true);
              }}
            >
              <h2 className='text-lg sm:text-xl text-white font-semibold mb-1 sm:mb-3 cursor-pointer hover:text-fuchsia-500/95 p-1'>
                {t('matchResults')}
              </h2>
            </button>
            <h2 className='text-lg sm:text-xl text-white flex items-center justify-center p-1'>|</h2>
            <button type='button'>
              <h2 className='text-lg sm:text-xl font-semibold text-fuchsia-500/95 mb-1 sm:mb-3 p-1'>
                {t('graficStadistic')}
              </h2>
            </button>
          </div>

          {estadisticas.length !== 0 ? (
            <div className='mt-4'>
              <QCChartStable
                arregloCompleto={{ listaObjetosPartidaInformacion, categorias }}
                className='bg-gradient-to-b from-purple-800 via-purple-700 to-purple-800 rounded p-3 sm:p-4 pl-1'
              />
            </div>
          ) : (
            <p className='mt-2 indent-2 text-white text-sm sm:text-base'>
              {t('noGraficStadistic')}
            </p>
          )}
        </div>
      )}

      {/* ============================= Solicitudes de amistad ================================================= */}
      <div className='mb-6 mt-8 bg-white/10 rounded-xl p-3 sm:p-4 w-full'>
        <h2 className='text-lg sm:text-xl text-white font-semibold mb-3 mt-1 sm:mt-2 indent-1 sm:indent-2'>
          {t('friendADD')}
        </h2>

        {friendRequestsDetails.length === 0 ? (
          <p className='indent-1 sm:indent-2 text-white mb-2 sm:mb-4 text-sm sm:text-base'>
            {t('noRequest')}
          </p>
        ) : (
          <>
            <div className='mb-2 space-y-2'>
              {visibleFriendRequests.map(({ solicitud, usuario }) => {
                const fotoOtro = usuario?.foto_perfil
                  ? resolveFotoAjena(usuario.foto_perfil)
                  : null;

                return (
                  <div
                    key={solicitud.id}
                    className='border rounded-xl p-3 sm:p-4 bg-white/10 hover:bg-white/20 
                           mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 rounded-full overflow-hidden bg-black/30 flex items-center justify-center flex-shrink-0'>
                        {fotoOtro ? (
                          <img
                            src={resolveFotoAjena(fotoOtro)}
                            alt={usuario?.name ?? 'Jugador'}
                            className='w-12 h-12 object-cover'
                          />
                        ) : (
                          <span className='text-2xl'>👤</span>
                        )}
                      </div>
                      <div className='flex flex-col text-sm sm:text-base'>
                        <span className='font-semibold text-white'>{usuario?.name ?? '—'}</span>
                        <span className='text-xs sm:text-sm text-purple-200'>
                          {usuario?.email ?? '—'}
                        </span>
                        <span className='text-xs text-purple-200'>
                          Puntaje: {usuario?.puntaje ?? '—'} · País: {usuario?.pais ?? '—'}
                        </span>
                      </div>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end'>
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
                );
              })}
            </div>

            {totalRequestsPages > 1 && (
              <div className='flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-2 px-1 sm:px-2 pb-2 text-xs sm:text-sm text-white'>
                <button
                  type='button'
                  onClick={() => setRequestsPage((p) => Math.max(1, p - 1))}
                  disabled={requestsPage === 1}
                  className='px-2 py-1 rounded bg-white/10 disabled:opacity-40 cursor-pointer'
                >
                  « {t('preview')}
                </button>
                <span>
                  {t('page')} {requestsPage} {t('of')} {totalRequestsPages}
                </span>
                <button
                  type='button'
                  onClick={() => setRequestsPage((p) => Math.min(totalRequestsPages, p + 1))}
                  disabled={requestsPage === totalRequestsPages}
                  className='px-2 py-1 rounded bg-white/10 disabled:opacity-40 cursor-pointer'
                >
                  {t('next')} »
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ============================= Mis Amigos ================================================= */}
      <div className='mb-6 mt-4 bg-white/10 rounded-xl p-3 sm:p-4 w-full'>
        {/* Tabs encabezado */}
        <div className='flex flex-wrap items-center gap-3 sm:gap-4 px-1 sm:px-2 pt-1 sm:pt-2 border-b border-white/10'>
          <button
            type='button'
            onClick={() => setActiveFriendsTab('friends')}
            className={`text-base sm:text-lg font-semibold pb-2 border-b-2 transition-colors cursor-pointer ${activeFriendsTab === 'friends'
              ? 'text-white border-purple-400'
              : 'text-white/60 border-transparent hover:text-white'
              }`}
          >
            {t('friends')}
          </button>

          <button
            type='button'
            onClick={() => setActiveFriendsTab('search')}
            className={`text-base sm:text-lg font-semibold pb-2 border-b-2 transition-colors cursor-pointer ${activeFriendsTab === 'search'
              ? 'text-white border-purple-400'
              : 'text-white/60 border-transparent hover:text-white'
              }`}
          >
            {t('searchNewFriend')}
          </button>
        </div>

        <div className='mt-2'>
          <AnimatePresence>
            {eliminado && (
              <motion.p
                key='toast'
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
                exit={{ opacity: 0, y: 8, transition: { duration: 0.8 } }}
                className='bg-green-600 text-white mb-4 px-4 py-2 rounded shadow-lg z-[100] text-sm sm:text-base'
              >
                {t('friendDeleted')}
              </motion.p>
            )}
          </AnimatePresence>

          {/* === TAB 1: MIS AMIGOS === */}
          {activeFriendsTab === 'friends' && (
            <>
              {filteredFriendsDetails ? (
                <>
                  <div className='px-1 sm:px-2 mb-2'>
                    <input
                      type='text'
                      value={friendsSearch}
                      onChange={(e) => setFriendsSearch(e.target.value)}
                      placeholder={t('findFriend')}
                      className='w-full px-3 py-1.5 rounded-lg bg-black/30 text-white text-sm 
                             border border-white/20 focus:outline-none focus:ring-1 focus:ring-purple-400'
                    />
                  </div>

                  {visibleFriends.length === 0 ? (
                    <p className='indent-2 text-white mb-3 sm:mb-4 text-sm sm:text-base'>
                      {t('noHaveFriendList')}
                    </p>
                  ) : (
                    <div className='mb-2 space-y-2 p-0.5'>
                      {visibleFriends.map(({ amigo, jugador, usuario }) => (
                        <div
                          key={amigo.id}
                          className='border rounded-xl p-3 sm:p-4 bg-white/10 hover:bg-white/20 
                                 mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer'
                          onClick={() =>
                            setSelectedPerson({
                              name: usuario?.name ?? '—',
                              email: usuario?.email ?? '—',
                              pais: usuario?.pais ?? '—',
                              puntaje: jugador?.puntaje ?? usuario?.puntaje ?? '—',
                              foto: usuario?.foto_perfil ? resolveFotoAjena(usuario.foto_perfil) : null,
                            })
                          }
                        >
                          <div className='flex items-center gap-3'>
                            <div className='w-12 h-12 rounded-full overflow-hidden bg-black/30 flex items-center justify-center flex-shrink-0'>
                              {(() => {
                                const fotoAmigo = usuario?.foto_perfil
                                  ? resolveFotoAjena(usuario.foto_perfil)
                                  : null;

                                return fotoAmigo ? (
                                  <img
                                    src={resolveFotoAjena(fotoAmigo)}
                                    alt={usuario?.name ?? 'Amigo'}
                                    className='w-12 h-12 object-cover'
                                  />
                                ) : (
                                  <span className='text-2xl'>👤</span>
                                );
                              })()}
                            </div>
                            <div className='flex flex-col text-sm sm:text-base'>
                              <span className='font-semibold text-white'>
                                {usuario?.name ?? '—'}
                              </span>
                              <span className='text-xs sm:text-sm text-purple-200'>
                                {usuario?.email ?? '—'}
                              </span>
                              <span className='text-xs text-purple-200'>
                                {t('countryAvatar')}: {usuario?.pais ?? '—'}
                              </span>
                              <span className='text-xs text-yellow-300'>
                                {t('points')}: {jugador?.puntaje ?? '—'}
                              </span>
                            </div>
                          </div>

                          <motion.button
                            type='button'
                            className='bg-red-500 hover:bg-red-600 rounded w-full sm:w-32 cursor-pointer 
                                   justify-self-end text-white py-1.5 text-sm mt-1 sm:mt-0'
                            whileTap={{ scale: 1.05 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete({
                                open: true,
                                amigoId: amigo.id,
                                nombre: usuario?.name ?? 'este amigo',
                              });
                            }}
                          >
                            {t('deleteFriend')}
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  )}

                  {totalFriendsPages > 1 && (
                    <div className='flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-2 px-1 sm:px-2 pb-2 text-xs sm:text-sm text-white'>
                      <button
                        type='button'
                        onClick={() => setFriendsPage((p) => Math.max(1, p - 1))}
                        disabled={friendsPage === 1}
                        className='px-2 py-1 rounded bg-white/10 disabled:opacity-40 cursor-pointer'
                      >
                        « {t('preview')}
                      </button>
                      <span>
                        {t('page')} {friendsPage} de {totalFriendsPages}
                      </span>
                      <button
                        type='button'
                        onClick={() => setFriendsPage((p) => Math.min(totalFriendsPages, p + 1))}
                        disabled={friendsPage === totalFriendsPages}
                        className='px-2 py-1 rounded bg-white/10 disabled:opacity-40 cursor-pointer'
                      >
                        {t('next')} »
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className='indent-2 text-white mb-4 text-sm sm:text-base'>
                  {filteredFriendsDetails.length === 0 && t('noHaveFriendList')}
                </p>
              )}
            </>
          )}

          {/* === TAB 2: BUSCAR NUEVO AMIGO === */}
          {activeFriendsTab === 'search' && (
            <>
              {/* Input de búsqueda de nuevos amigos */}
              <div className='px-1 sm:px-2 mb-2'>
                <input
                  type='text'
                  value={newFriendSearch}
                  onChange={(e) => setNewFriendSearch(e.target.value)}
                  placeholder={t('findFriend')}
                  className='w-full px-3 py-1.5 rounded-lg bg-black/30 text-white text-sm 
                         border border-white/20 focus:outline-none focus:ring-1 focus:ring-purple-400'
                />
              </div>

              <div className='mb-2 p-0.5 space-y-2'>
                {visibleNewFriends.length === 0 ? (
                  <p className='indent-2 text-white mb-3 sm:mb-4 text-sm sm:text-base'>
                    {newFriendSearch.trim() ? t('noUsersFound') : t('writeName')}
                  </p>
                ) : (
                  visibleNewFriends.map((usuario) => {
                    const relacion = getRelacionConUsuario(usuario);
                    const jugadorAsociado = jugadoresPorId[Number(usuario.jugador_id)] ?? null;
                    const puntajeUsuario = jugadorAsociado?.puntaje ?? usuario?.puntaje ?? '—';

                    return (
                      <div
                        key={usuario.id}
                        className='border rounded-xl p-3 sm:p-4 bg-white/10 hover:bg-white/20 
                               mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer'
                        onClick={() =>
                          setSelectedPerson({
                            name: usuario?.name ?? '—',
                            email: usuario?.email ?? '—',
                            pais: usuario?.pais ?? '—',
                            puntaje: puntajeUsuario,
                            foto: usuario?.foto_perfil ? resolveFotoAjena(usuario.foto_perfil) : null,
                          })
                        }
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-12 h-12 rounded-full overflow-hidden bg-black/30 flex items-center justify-center flex-shrink-0'>
                            {(() => {
                              const fotoUser = usuario?.foto_perfil
                                ? resolveFotoAjena(usuario.foto_perfil)
                                : null;

                              return fotoUser ? (
                                <img
                                  src={resolveFotoAjena(fotoUser)}
                                  alt={usuario?.name ?? 'Usuario'}
                                  className='w-12 h-12 object-cover'
                                />
                              ) : (
                                <span className='text-2xl'>👤</span>
                              );
                            })()}
                          </div>
                          <div className='flex flex-col text-sm sm:text-base'>
                            <span className='font-semibold text-white'>{usuario?.name ?? '—'}</span>
                            <span className='text-xs sm:text-sm text-purple-200'>
                              {usuario?.email ?? '—'}
                            </span>
                            <span className='text-xs text-purple-200'>
                              {t('countryAvatar')} {usuario?.pais ?? '—'}
                            </span>
                            <span className='text-xs text-yellow-300'>
                              {t('points')} {puntajeUsuario}
                            </span>
                          </div>
                        </div>

                        {/* Estado de relación / botón */}
                        <div className='flex items-center self-stretch sm:self-auto justify-end'>
                          {relacion === 'amigo' && (
                            <span
                              className='text-xs sm:text-sm font-semibold px-3 py-1 rounded-full 
                                   bg-fuchsia-900/70 text-fuchsia-200'
                            >
                              {t('friend')}
                            </span>
                          )}

                          {relacion === 'pendiente' && (
                            <span
                              className='text-xs font-semibold px-3 py-1 rounded-full 
                                   bg-yellow-500/20 text-yellow-300'
                            >
                              {t('pending')}
                            </span>
                          )}

                          {relacion === 'ninguna' && (
                            <button
                              type='button'
                              className='bg-green-600 hover:bg-green-700 rounded w-full sm:w-36 cursor-pointer 
                                     justify-self-end text-white py-1.5 text-sm disabled:opacity-60 mt-1 sm:mt-0'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAgregarAmigoDesdeUsuario(usuario);
                              }}
                              disabled={addingFriendId === Number(usuario.jugador_id)}
                            >
                              {addingFriendId === Number(usuario.jugador_id)
                                ? t('sending')
                                : t('addFriend')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {totalNewFriendsPages > 1 && (
                <div className='flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-2 px-1 sm:px-2 pb-2 text-xs sm:text-sm text-white'>
                  <button
                    type='button'
                    onClick={() => setNewFriendsPage((p) => Math.max(1, p - 1))}
                    disabled={newFriendsPage === 1}
                    className='px-2 py-1 rounded bg-white/10 disabled:opacity-40 cursor-pointer'
                  >
                    « {t('preview')}
                  </button>
                  <span>
                    {t('page')} {newFriendsPage} {t('of')} {totalNewFriendsPages}
                  </span>
                  <button
                    type='button'
                    onClick={() => setNewFriendsPage((p) => Math.min(totalNewFriendsPages, p + 1))}
                    disabled={newFriendsPage === totalNewFriendsPages}
                    className='px-2 py-1 rounded bg-white/10 disabled:opacity-40 cursor-pointer'
                  >
                    {t('next')} »
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ===================== Modales (detalles & borrar amigo) ===================== */}
        <AnimatePresence>
          {selectedPerson && (
            <motion.div
              key='modal-persona'
              className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-24'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                className='bg-slate-900/95 border border-white/10 rounded-2xl p-5 sm:p-6 w-[95vw] max-w-md shadow-2xl'
              >
                <h3 className='text-lg sm:text-xl font-semibold text-white mb-4'>
                  {t('playerDetail') ?? 'Detalle del jugador'}
                </h3>

                <div className='flex flex-col sm:flex-row items-center gap-4 mb-4'>
                  <div className='w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-black/40 flex items-center justify-center'>
                    {selectedPerson.foto ? (
                      <img
                        src={resolveFotoAjena(selectedPerson.foto)}
                        alt={selectedPerson.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <span className='text-5xl sm:text-6xl'>👤</span>
                    )}
                  </div>

                  <div className='flex flex-col text-sm sm:text-lg text-slate-100'>
                    <p>
                      <span className='font-semibold'>{t('name')}:</span> {selectedPerson.name}
                    </p>
                    <p>
                      <span className='font-semibold'>{t('countryAvatar')}:</span>{' '}
                      {selectedPerson.pais}
                    </p>
                    <p>
                      <span className='font-semibold'>{t('points')}:</span>{' '}
                      {selectedPerson.puntaje ?? '—'}
                    </p>
                    <p className='break-all'>
                      <span className='font-semibold'>{t('email')}:</span> {selectedPerson.email}
                    </p>
                  </div>
                </div>
                <div className='mt-4 sm:mt-6 flex justify-end'>
                  <button
                    type='button'
                    className='px-4 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-500 cursor-pointer text-sm sm:text-base'
                    onClick={() => setSelectedPerson(null)}
                  >
                    {t('close')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {confirmDelete.open && (
            <motion.div
              key='confirm-delete-friend'
              className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-24'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                className='bg-slate-900/95 border border-white/10 rounded-2xl p-5 sm:p-6 w-[95vw] max-w-md shadow-2xl'
              >
                <h3 className='text-lg sm:text-xl font-semibold text-white mb-2'>
                  {t('deleteFriend')}
                </h3>
                <p className='text-xs sm:text-sm text-slate-100 mb-4'>
                  <Trans
                    i18nKey='deleteFriendConfirm'
                    values={{ name: confirmDelete.nombre }}
                    components={{ 1: <span className='font-semibold text-red-300' /> }}
                  />
                </p>

                <div className='flex justify-end gap-3'>
                  <button
                    type='button'
                    className='px-4 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-500 cursor-pointer text-sm sm:text-base'
                    onClick={() =>
                      setConfirmDelete({
                        open: false,
                        amigoId: null,
                        nombre: '',
                      })
                    }
                  >
                    {t('cancel')}
                  </button>

                  <button
                    type='button'
                    className='px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer text-sm sm:text-base'
                    disabled={confirmDeleting}
                    onClick={async () => {
                      try {
                        setConfirmDeleting(true);
                        await eliminarAmigo(confirmDelete.amigoId);
                      } finally {
                        setConfirmDeleting(false);
                        setConfirmDelete({
                          open: false,
                          amigoId: null,
                          nombre: '',
                        });
                      }
                    }}
                  >
                    {confirmDeleting ? t('deleting') : t('deleteFriend')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div >

  );
};

export default Perfil;
