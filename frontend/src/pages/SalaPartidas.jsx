// src/pages/SalaPartidas.jsx

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

import axios from 'axios';
import { resolveFotoAjena } from '../utils/resolveFotoAjena.js';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';

const SalaPartidas = () => {
  const { t } = useTranslation();
  const [salas, setSalas] = useState([]);
  const [selectedSala, setSelectedSala] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterTiempo, setFilterTiempo] = useState('');
  const [filterPregunta, setFilterPregunta] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const navigate = useNavigate();

  const categoryTranslations = {
    Cine: t('cinema'),
    Historia: t('history'),
    'Conocimiento General': t('generalKnowLedge'),
    'Conocimiento general': t('generalKnowLedge'),
    Geografía: t('geography'),
    Informatica: t('informatic'),
  };

  const dificultadTranslations = {
    normal: t('medium'),
    dificil: t('hard'),
    facil: t('easy'),
  };

  const currentJugadorId = (() => {
    const raw = localStorage.getItem('jugador_id');
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  })();

  // ⬇️ getSalas envuelto en useCallback para poder usarlo en el intervalo
  const getSalas = useCallback(async () => {
    try {
      const estado = 'esperando';
      const { data } = await axios.get(`${API_URL}/salas`, {
        params: { estado },
      });
      setSalas(data || []);
    } catch (e) {
      console.error('GET /salas', e.response?.data?.error || e.message);
    }
  }, []);

  const updateEstadoSala = async (id) => {
    try {
      const { data } = await axios.put(`${API_URL}/salas/${id}`, {
        estado: 'en_curso',
      });
      if (!data) return null;
      console.log('Cambio de estado listo');
      return data;
    } catch (e) {
      console.error('PUT /salas/:id', e.response?.data?.error || e.message);
      throw e;
    }
  };

  // ⬇️ Primer fetch + polling cada 5 segundos
  useEffect(() => {
    getSalas(); // primer carga inmediata

    const intervalId = setInterval(() => {
      getSalas();
    }, 5000); // 5000 ms = 5 segundos

    // limpieza al desmontar
    return () => clearInterval(intervalId);
  }, [getSalas]);

  // si cambian filtros o cantidad de salas, volvemos a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategoria, filterTiempo, filterPregunta, salas.length]);

  // ... 👇 el resto de tu componente queda igual
  const getOpponent = (sala) => {
    if (!sala?.jugadores || sala.jugadores.length === 0) return null;
    if (!currentJugadorId) {
      return sala.jugadores[0];
    }
    const otro = sala.jugadores.find((j) => j?.jugador_id !== currentJugadorId);
    return otro || sala.jugadores[0];
  };

  const handleOpenModal = (sala) => {
    setSelectedSala(sala);
    setShowConfirm(false);
  };

  const handleCloseModal = () => {
    setSelectedSala(null);
    setShowConfirm(false);
  };

  const handleJoinGameConfirmed = async () => {
    if (!selectedSala) return;
    try {
      await updateEstadoSala(selectedSala.id);
      navigate(`/salaEspera/${selectedSala.codigo}`);
    } catch (e) {
      console.error('Error al unirse a la partida', e);
    } finally {
      handleCloseModal();
    }
  };

  const getDifficultyClass = (value) => {
    switch ((value || '').toLowerCase()) {
      case 'facil':
        return 'text-green-400';
      case 'normal':
      case 'media':
        return 'text-yellow-300';
      case 'dificil':
        return 'text-red-400';
      default:
        return 'text-blue-300';
    }
  };

  // listas de opciones para filtros (sin useMemo)
  const categoriasDisponibles = Array.from(
    new Set((salas || []).map((s) => s.categoria?.nombre).filter(Boolean))
  );

  const tiemposDisponibles = Array.from(
    new Set((salas || []).map((s) => s.partida?.dificultad_tiempo).filter(Boolean))
  );

  const preguntasDisponibles = Array.from(
    new Set((salas || []).map((s) => s.partida?.dificultad_pregunta).filter(Boolean))
  );

  // aplicar filtros (sin useMemo)
  const salasFiltradas = (salas || []).filter((s) => {
    const catOk = filterCategoria ? s.categoria?.nombre === filterCategoria : true;

    const tiempoOk = filterTiempo ? s.partida?.dificultad_tiempo === filterTiempo : true;

    const preguntaOk = filterPregunta ? s.partida?.dificultad_pregunta === filterPregunta : true;

    return catOk && tiempoOk && preguntaOk;
  });

  // datos para paginado
  const totalItems = salasFiltradas.length;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;

  // aseguramos que currentPage nunca se pase
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // salas que se van a mostrar en esta página
  const salasPagina = salasFiltradas.slice(startIndex, endIndex);

  return (
    <div className='min-h-screen w-full px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto mt-10'>
        {/* BOTÓN CREAR PARTIDA */}
        <div className='mb-6 flex items-center justify-center'>
          <button
            type='button'
            onClick={() => navigate('/crearMultijugador')}
            className='w-full max-w-lvh sm:w-96 h-12 sm:h-16 cursor-pointer 
                     bg-gradient-to-br from-green-400 to-green-500 
                     rounded-full shadow-xl hover:shadow-green-500/50 
                     transition-all duration-300 flex items-center justify-center gap-3 
                     border-4 border-green-300 text-sm sm:text-base text-white text-center'
          >
            {t('createMatch')}
          </button>
        </div>

        {/* TÍTULO */}
        <h2
          className='text-2xl sm:text-3xl font-bold text-purple-200 my-4 sm:my-6 
                     text-center sm:text-left'
        >
          {t('gamesList')}
        </h2>

        {salas.length > 0 ? (
          <>
            {/* FILTROS */}
            <div className='mb-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end'>
              {/* Filtro categoría */}
              <div className='flex flex-col gap-1 w-full md:w-auto'>
                <span className='text-xs sm:text-sm text-purple-100 font-semibold'>
                  {t('category')}
                </span>
                <div className='flex gap-2 flex-wrap'>
                  <button
                    type='button'
                    onClick={() => setFilterCategoria('')}
                    className={`px-3 py-1 rounded-full border text-xs sm:text-sm cursor-pointer transition 
                    ${
                      filterCategoria === ''
                        ? 'bg-pink-500 text-white border-pink-400'
                        : 'bg-transparent text-pink-200 border-pink-400/60 hover:bg-pink-500/20'
                    }`}
                  >
                    {t('all')}
                  </button>
                  {categoriasDisponibles.map((cat) => (
                    <button
                      key={cat}
                      type='button'
                      onClick={() => setFilterCategoria(cat)}
                      className={`px-3 py-1 rounded-full border text-xs sm:text-sm cursor-pointer transition 
                      ${
                        filterCategoria === cat
                          ? 'bg-pink-500 text-white border-pink-400'
                          : 'bg-transparent text-pink-200 border-pink-400/60 hover:bg-pink-500/20'
                      }`}
                    >
                      {categoryTranslations[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro dificultad de tiempo */}
              <div className='flex flex-col gap-1 w-full md:w-auto'>
                <span className='text-xs sm:text-sm text-purple-100 font-semibold'>
                  {t('dificultytime')}
                </span>
                <div className='flex gap-2 flex-wrap'>
                  <button
                    type='button'
                    onClick={() => setFilterTiempo('')}
                    className={`px-3 py-1 rounded-full border text-xs sm:text-sm cursor-pointer transition 
                    ${
                      filterTiempo === ''
                        ? 'bg-blue-500 text-white border-blue-400'
                        : 'bg-transparent text-blue-200 border-blue-400/60 hover:bg-blue-500/20'
                    }`}
                  >
                    {t('all')}
                  </button>
                  {tiemposDisponibles.map((dif) => (
                    <button
                      key={dif}
                      type='button'
                      onClick={() => setFilterTiempo(dif)}
                      className={`px-3 py-1 rounded-full border text-xs sm:text-sm cursor-pointer transition 
                      ${
                        filterTiempo === dif
                          ? 'bg-blue-500 text-white border-blue-400'
                          : 'bg-transparent text-blue-200 border-blue-400/60 hover:bg-blue-500/20'
                      }`}
                    >
                      {dificultadTranslations[dif]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro dificultad de preguntas */}
              <div className='flex flex-col gap-1 w-full md:w-auto'>
                <span className='text-xs sm:text-sm text-purple-100 font-semibold'>
                  {t('dificultyquestion')}
                </span>
                <div className='flex gap-2 flex-wrap'>
                  <button
                    type='button'
                    onClick={() => setFilterPregunta('')}
                    className={`px-3 py-1 rounded-full border text-xs sm:text-sm cursor-pointer transition 
                    ${
                      filterPregunta === ''
                        ? 'bg-amber-500 text-white border-amber-400'
                        : 'bg-transparent text-amber-200 border-amber-400/60 hover:bg-amber-500/20'
                    }`}
                  >
                    {t('all')}
                  </button>
                  {preguntasDisponibles.map((dif) => (
                    <button
                      key={dif}
                      type='button'
                      onClick={() => setFilterPregunta(dif)}
                      className={`px-3 py-1 rounded-full border text-xs sm:text-sm cursor-pointer transition 
                      ${
                        filterPregunta === dif
                          ? 'bg-amber-500 text-white border-amber-400'
                          : 'bg-transparent text-amber-200 border-amber-400/60 hover:bg-amber-500/20'
                      }`}
                    >
                      {dificultadTranslations[dif]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* GRID DE SALAS */}
            {salasFiltradas.length > 0 ? (
              <>
                <ul className='grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'>
                  {salasPagina.map((sala) => {
                    const categoria = sala.categoria;
                    const partida = sala.partida;

                    return (
                      <li
                        key={sala.id}
                        className='cursor-pointer h-full'
                        onClick={() => handleOpenModal(sala)}
                      >
                        <div
                          className='h-full bg-gradient-to-br from-pink-300/10 via-violet-500/90 to-pink-800/10 
                                      rounded-3xl shadow-2xl hover:shadow-violet-500/50 
                                      transition-all duration-300 border-2 md:border-4 border-violet-400 
                                      text-white p-3 sm:p-4 flex flex-col justify-between'
                        >
                          <div>
                            <p className='font-semibold text-base sm:text-lg mb-1'>
                              {t('category')}:{' '}
                              <span className='text-pink-400/95'>
                                {categoryTranslations[categoria?.nombre] || 'Sin categoría'}
                              </span>
                            </p>
                            <p className='font-semibold text-xs sm:text-sm mb-1'>
                              {t('dificultytime')}:{' '}
                              <span className={getDifficultyClass(partida?.dificultad_tiempo)}>
                                {dificultadTranslations[partida?.dificultad_tiempo] || '-'}
                              </span>
                            </p>
                            <p className='font-semibold text-xs sm:text-sm mb-1'>
                              {t('dificultyquestion')}:{' '}
                              <span className={getDifficultyClass(partida?.dificultad_pregunta)}>
                                {dificultadTranslations[partida?.dificultad_pregunta] || '-'}
                              </span>
                            </p>
                            <p className='font-semibold text-xs sm:text-sm mb-1'>
                              {t('questionTotal')}:{' '}
                              <span className='text-blue-300'>
                                {partida?.total_preguntas || '-'}
                              </span>
                            </p>
                          </div>
                          <p className='font-semibold text-xs sm:text-sm mt-3'>
                            {t('state')}:{' '}
                            <span className='text-purple-100'>
                              {sala.estado === 'esperando' && t('waiting')}
                            </span>
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* PAGINADO */}
                {totalPages > 1 && (
                  <div className='mt-6 flex items-center justify-center gap-2 flex-wrap'>
                    {/* Prev */}
                    <button
                      type='button'
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className={`px-3 py-1 rounded-full border text-xs sm:text-sm cursor-pointer transition 
                      ${
                        safePage === 1
                          ? 'border-gray-500 text-gray-500 cursor-not-allowed'
                          : 'border-purple-400 text-purple-100 hover:bg-purple-500/20'
                      }`}
                    >
                      {t('preview')}
                    </button>

                    {/* Números de página */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type='button'
                        onClick={() => setCurrentPage(num)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold 
                                  cursor-pointer transition 
                        ${
                          safePage === num
                            ? 'bg-purple-500 text-white'
                            : 'bg-transparent text-purple-100 border border-purple-400/60 hover:bg-purple-500/20'
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    {/* Next */}
                    <button
                      type='button'
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className={`px-3 py-1 rounded-full border text-xs sm:text-sm cursor-pointer transition 
                      ${
                        safePage === totalPages
                          ? 'border-gray-500 text-gray-500 cursor-not-allowed'
                          : 'border-purple-400 text-purple-100 hover:bg-purple-500/20'
                      }`}
                    >
                      {t('next')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className='mt-6'>
                <span className='text-white'>{t('noMatchSala')}</span>
              </div>
            )}
          </>
        ) : (
          <div className='mt-4'>
            <span className='text-white'>{t('noSalasHolding')}</span>
          </div>
        )}

        {/* MODAL */}
        <AnimatePresence>
          {selectedSala && (
            <motion.div
              key='modal-sala'
              className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-3'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                className='relative w-full max-w-xl max-h-[85vh] bg-indigo-900 text-white 
                         rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col'
              >
                {/* Botón cerrar */}
                <button
                  type='button'
                  onClick={handleCloseModal}
                  aria-label='Cerrar'
                  className='absolute top-3 right-3 rounded-full w-8 h-8 sm:w-9 sm:h-9 
                           border border-white/30 flex items-center justify-center 
                           hover:bg-white/10 transition-colors cursor-pointer'
                >
                  ✕
                </button>

                {/* Contenido principal del modal */}
                <div className='space-y-4 pr-1 sm:pr-4 overflow-y-auto mt-4 sm:mt-2'>
                  <h3 className='text-xl sm:text-2xl font-bold mb-2'>{t('salaDetails')}</h3>
                  <div className='flex flex-col md:flex-row justify-between gap-4'>
                    {/* Info sala/partida */}
                    <div className='bg-black/20 rounded-xl p-3 sm:p-4 space-y-2 flex-1'>
                      <p className='text-sm sm:text-base'>
                        <span className='font-semibold'>{t('category')}:</span>{' '}
                        <span className='text-pink-400/95'>
                          {categoryTranslations[selectedSala.categoria?.nombre] || 'Sin categoría'}
                        </span>
                      </p>
                      <p className='text-sm sm:text-base'>
                        <span className='font-semibold'>{t('dificultytime')}:</span>{' '}
                        <span
                          className={getDifficultyClass(selectedSala.partida?.dificultad_tiempo)}
                        >
                          {dificultadTranslations[selectedSala.partida?.dificultad_tiempo] || '-'}
                        </span>
                      </p>
                      <p className='text-sm sm:text-base'>
                        <span className='font-semibold'>{t('dificultyquestion')}:</span>{' '}
                        <span
                          className={getDifficultyClass(selectedSala.partida?.dificultad_pregunta)}
                        >
                          {dificultadTranslations[selectedSala.partida?.dificultad_pregunta] || '-'}
                        </span>
                      </p>
                      <p className='text-sm sm:text-base'>
                        <span className='font-semibold'>{t('questionTotal')}:</span>{' '}
                        <span className='text-blue-300'>
                          {selectedSala.partida?.total_preguntas || '-'}
                        </span>
                      </p>
                    </div>

                    {/* Info del oponente */}
                    <div className='bg-black/20 rounded-xl p-3 sm:p-4 space-y-2 flex-1'>
                      <h4 className='text-lg sm:text-xl font-semibold mb-2'>{t('goingToPlay')}:</h4>
                      {(() => {
                        const opponent = getOpponent(selectedSala);
                        const user = opponent?.user;

                        if (!opponent || !user) {
                          return (
                            <p className='text-xs sm:text-sm text-gray-300'>{t('noInfoYet')}</p>
                          );
                        }

                        return (
                          <div className='flex items-center gap-3 sm:gap-4'>
                            {user.foto_perfil ? (
                              <img
                                src={resolveFotoAjena(user.foto_perfil)}
                                alt={user.name}
                                className='w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover 
                                         border-2 border-yellow-400 flex-shrink-0'
                              />
                            ) : (
                              <p
                                className='text-[52px] sm:text-[70px] w-24 h-24 sm:w-28 sm:h-28 
                               bg-gray-200/90 rounded-full flex items-center justify-center'
                              >
                                👤
                              </p>
                            )}
                            <div className='space-y-1 text-xs sm:text-sm'>
                              <p>
                                <span className='font-semibold'>{t('name')}:</span>{' '}
                                <span className='text-yellow-300'>{user.name}</span>
                              </p>
                              <p>
                                <span className='font-semibold'>{t('countryUser')}:</span>{' '}
                                <span className='text-green-300'>{user.pais}</span>
                              </p>
                              <p>
                                <span className='font-semibold'>{t('points')}:</span>{' '}
                                <span className='text-blue-300'>{opponent.puntaje}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Botón Jugar */}
                <div className='mt-4 flex justify-end'>
                  <button
                    type='button'
                    onClick={() => setShowConfirm(true)}
                    className='w-full sm:w-auto px-8 sm:px-10 py-2 rounded-full 
                             bg-green-500 hover:bg-green-600 font-semibold shadow-lg 
                             cursor-pointer text-sm sm:text-base text-center'
                  >
                    {t('play')}
                  </button>
                </div>

                {/* Reconfirmación */}
                <AnimatePresence>
                  {showConfirm && (
                    <motion.div
                      key='confirm-overlay'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='absolute inset-0 z-20 bg-white/5 flex items-center justify-center px-3'
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className='bg-indigo-950 rounded-2xl p-4 sm:p-6 max-w-md w-full 
                                 shadow-2xl space-y-4 border border-white/30'
                      >
                        <p className='font-semibold text-white text-base sm:text-lg'>{t('sure')}</p>
                        <div className='flex gap-3 flex-wrap justify-end'>
                          <button
                            type='button'
                            onClick={() => setShowConfirm(false)}
                            className='px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 
                                     text-white font-semibold shadow cursor-pointer text-sm'
                          >
                            {t('cancel')}
                          </button>
                          <button
                            type='button'
                            onClick={handleJoinGameConfirmed}
                            className='px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 
                                     text-white font-semibold shadow cursor-pointer text-sm'
                          >
                            {t('yesPlay')}
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SalaPartidas;
