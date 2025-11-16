// src/pages/SalaPartidas.jsx

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import axios from 'axios';
import { resolveFotoAjena } from '../utils/resolveFotoAjena.js';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:3006';

const SalaPartidas = () => {
  const [salas, setSalas] = useState([]);
  const [selectedSala, setSelectedSala] = useState(null);   // sala seleccionada para el modal
  const [showConfirm, setShowConfirm] = useState(false);    // reconfirmación "¿Estás seguro?"
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterTiempo, setFilterTiempo] = useState('');
  const [filterPregunta, setFilterPregunta] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // por ej: 6 tarjetas por página (3 columnas x 2 filas)

  const navigate = useNavigate();

  // suponiendo que guardás tu id de jugador en localStorage
  const currentJugadorId = (() => {
    const raw = localStorage.getItem('jugador_id');
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  })();

  const getSalas = async () => {
    try {
      const estado = 'esperando';
      const { data } = await axios.get(`${API}/salas`, {
        params: { estado },
      });
      setSalas(data || []);
    } catch (e) {
      console.error('GET /salas', e.response?.data?.error || e.message);
    }
  };

  const updateEstadoSala = async (id) => {
    try {
      const { data } = await axios.put(`${API}/salas/${id}`, {
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

  useEffect(() => {
    getSalas();
  }, []);

  // si cambian filtros o cantidad de salas, volvemos a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategoria, filterTiempo, filterPregunta, salas.length]);

  // obtener el oponente (el otro jugador de la sala)
  const getOpponent = (sala) => {
    if (!sala?.jugadores || sala.jugadores.length === 0) return null;

    // si todavía no sabemos quién soy yo, devolvemos el primero
    if (!currentJugadorId) {
      return sala.jugadores[0];
    }

    // buscamos alguien cuyo jugador_id sea distinto al mío
    const otro = sala.jugadores.find(
      (j) => j?.jugador_id !== currentJugadorId
    );

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
      // luego de cambiar estado, navegamos a la sala de espera
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
        return 'text-blue-300'; // default
    }
  };

  // listas de opciones para filtros (sin useMemo)
  const categoriasDisponibles = Array.from(
    new Set(
      (salas || [])
        .map((s) => s.categoria?.nombre)
        .filter(Boolean)
    )
  );

  const tiemposDisponibles = Array.from(
    new Set(
      (salas || [])
        .map((s) => s.partida?.dificultad_tiempo)
        .filter(Boolean)
    )
  );

  const preguntasDisponibles = Array.from(
    new Set(
      (salas || [])
        .map((s) => s.partida?.dificultad_pregunta)
        .filter(Boolean)
    )
  );

  // aplicar filtros (sin useMemo)
  const salasFiltradas = (salas || []).filter((s) => {
    const catOk = filterCategoria
      ? s.categoria?.nombre === filterCategoria
      : true;

    const tiempoOk = filterTiempo
      ? s.partida?.dificultad_tiempo === filterTiempo
      : true;

    const preguntaOk = filterPregunta
      ? s.partida?.dificultad_pregunta === filterPregunta
      : true;

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
    <div className='h-full w-full p-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8 flex items-center justify-center'>
          <button
            type='button'
            onClick={() => navigate('/crearMultijugador')}
            className='w-50 h-14 cursor-pointer bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-xl hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center gap-3 border-4 border-green-300'
          >
            Crear Partida
          </button>
        </div>

        <h2 className='text-3xl font-bold text-purple-200 my-6 w-110 rounded-2xl'>
          Listado de partidas para unirte
        </h2>

        {salas.length > 0 ? (
          <>
            {/* FILTROS */}
            <div className='mb-6 flex flex-col gap-4 md:flex-row md:flex-wrap'>
              {/* Filtro categoría */}
              <div className='flex flex-col gap-1'>
                <span className='text-sm text-purple-100 font-semibold'>
                  Categoría
                </span>
                <div className='flex gap-2 flex-wrap'>
                  <button
                    type='button'
                    onClick={() => setFilterCategoria('')}
                    className={`px-3 py-1 rounded-full border text-sm cursor-pointer transition 
                      ${filterCategoria === '' ? 'bg-pink-500 text-white border-pink-400' : 'bg-transparent text-pink-200 border-pink-400/60 hover:bg-pink-500/20'}`}
                  >
                    Todas
                  </button>
                  {categoriasDisponibles.map((cat) => (
                    <button
                      key={cat}
                      type='button'
                      onClick={() => setFilterCategoria(cat)}
                      className={`px-3 py-1 rounded-full border text-sm cursor-pointer transition 
                        ${filterCategoria === cat ? 'bg-pink-500 text-white border-pink-400' : 'bg-transparent text-pink-200 border-pink-400/60 hover:bg-pink-500/20'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro dificultad de tiempo */}
              <div className='flex flex-col gap-1'>
                <span className='text-sm text-purple-100 font-semibold'>
                  Dificultad de tiempo
                </span>
                <div className='flex gap-2 flex-wrap'>
                  <button
                    type='button'
                    onClick={() => setFilterTiempo('')}
                    className={`px-3 py-1 rounded-full border text-sm cursor-pointer transition 
                      ${filterTiempo === '' ? 'bg-blue-500 text-white border-blue-400' : 'bg-transparent text-blue-200 border-blue-400/60 hover:bg-blue-500/20'}`}
                  >
                    Todas
                  </button>
                  {tiemposDisponibles.map((dif) => (
                    <button
                      key={dif}
                      type='button'
                      onClick={() => setFilterTiempo(dif)}
                      className={`px-3 py-1 rounded-full border text-sm cursor-pointer transition 
                        ${filterTiempo === dif ? 'bg-blue-500 text-white border-blue-400' : 'bg-transparent text-blue-200 border-blue-400/60 hover:bg-blue-500/20'}`}
                    >
                      {dif}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro dificultad de preguntas */}
              <div className='flex flex-col gap-1'>
                <span className='text-sm text-purple-100 font-semibold'>
                  Dificultad de preguntas
                </span>
                <div className='flex gap-2 flex-wrap'>
                  <button
                    type='button'
                    onClick={() => setFilterPregunta('')}
                    className={`px-3 py-1 rounded-full border text-sm cursor-pointer transition 
                      ${filterPregunta === '' ? 'bg-amber-500 text-white border-amber-400' : 'bg-transparent text-amber-200 border-amber-400/60 hover:bg-amber-500/20'}`}
                  >
                    Todas
                  </button>
                  {preguntasDisponibles.map((dif) => (
                    <button
                      key={dif}
                      type='button'
                      onClick={() => setFilterPregunta(dif)}
                      className={`px-3 py-1 rounded-full border text-sm cursor-pointer transition 
                        ${filterPregunta === dif ? 'bg-amber-500 text-white border-amber-400' : 'bg-transparent text-amber-200 border-amber-400/60 hover:bg-amber-500/20'}`}
                    >
                      {dif}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* GRID DE SALAS */}
            {salasFiltradas.length > 0 ? (
              <>
                <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {salasPagina.map((sala) => {
                    const categoria = sala.categoria;
                    const partida = sala.partida;

                    return (
                      <li
                        key={sala.id}
                        className='cursor-pointer h-full'
                        onClick={() => handleOpenModal(sala)}
                      >
                        <div className='h-full bg-gradient-to-br from-pink-300/10 via-violet-500/90 to-pink-800/10 rounded-3xl shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 border-2 sm:border-3 md:border-4 border-violet-400 text-white p-4 flex flex-col justify-between'>
                          <div>
                            <p className='font-semibold text-lg mb-1'>
                              Categoría:{' '}
                              <span className='text-pink-400/95'>
                                {categoria?.nombre || 'Sin categoría'}
                              </span>
                            </p>
                            <p className='font-semibold text-sm mb-1'>
                              Dificultad de tiempo:{' '}
                              <span className={getDifficultyClass(
                                partida?.dificultad_tiempo
                              )}>
                                {partida?.dificultad_tiempo || '-'}
                              </span>
                            </p>
                            <p className='font-semibold text-sm mb-1'>
                              Dificultad de preguntas:{' '}
                              <span className={getDifficultyClass(
                                partida?.dificultad_pregunta
                              )}>
                                {partida?.dificultad_pregunta || '-'}
                              </span>
                            </p>
                            <p className='font-semibold text-sm mb-1'>
                              Total de preguntas:{' '}
                              <span className='text-blue-300'>
                                {partida?.total_preguntas || '-'}
                              </span>
                            </p>
                          </div>
                          <p className='font-semibold text-sm mt-3'>
                            Estado:{' '}
                            <span className='text-purple-100'>{sala.estado}...</span>
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {totalPages > 1 && (
                  <div className='mt-6 flex items-center justify-center gap-2'>
                    {/* Prev */}
                    <button
                      type='button'
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className={`px-3 py-1 rounded-full border text-sm cursor-pointer transition 
              ${safePage === 1
                          ? 'border-gray-500 text-gray-500 cursor-not-allowed'
                          : 'border-purple-400 text-purple-100 hover:bg-purple-500/20'}`}
                    >
                      Anterior
                    </button>

                    {/* Números de página */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type='button'
                        onClick={() => setCurrentPage(num)}
                        className={`w-8 h-8 rounded-full text-sm font-semibold cursor-pointer transition 
                ${safePage === num
                            ? 'bg-purple-500 text-white'
                            : 'bg-transparent text-purple-100 border border-purple-400/60 hover:bg-purple-500/20'}`}
                      >
                        {num}
                      </button>
                    ))}

                    {/* Next */}
                    <button
                      type='button'
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={safePage === totalPages}
                      className={`px-3 py-1 rounded-full border text-sm cursor-pointer transition 
              ${safePage === totalPages
                          ? 'border-gray-500 text-gray-500 cursor-not-allowed'
                          : 'border-purple-400 text-purple-100 hover:bg-purple-500/20'}`}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className='mt-6'>
                <span className='text-white'>
                  No hay salas que coincidan con los filtros seleccionados.
                </span>
              </div>
            )}
          </>
        ) : (
          <div>
            <span className='text-white'>
              No hay salas en &quot;espera&quot; disponibles...
            </span>
          </div>
        )}

        {/* MODAL */}
        <AnimatePresence>
          {selectedSala && (
            <motion.div
              key='modal-sala'
              className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                className='relative w-[95vw] max-w-xl max-h-[85vh] bg-indigo-900 text-white rounded-2xl shadow-2xl p-6 flex flex-col'
              >
                {/* Botón cerrar arriba a la derecha */}
                <button
                  type='button'
                  onClick={handleCloseModal}
                  aria-label='Cerrar'
                  className='absolute top-3 right-3 rounded-full w-9 h-9 border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer'
                >
                  ✕
                </button>

                {/* Contenido principal del modal */}
                <div className='space-y-4 pr-4 overflow-y-auto'>
                  <h3 className='text-2xl font-bold mb-2'>
                    Detalles de la sala
                  </h3>
                  <div className='flex flex-row justify-between gap-4'>
                    {/* Info sala/partida */}
                    <div className='bg-black/20 rounded-xl p-4 space-y-2'>
                      <p>
                        <span className='font-semibold'>Categoría:</span>{' '}
                        <span className='text-pink-400/95'>
                          {selectedSala.categoria?.nombre || 'Sin categoría'}
                        </span>
                      </p>
                      <p>
                        <span className='font-semibold'>
                          Dificultad de tiempo:
                        </span>{' '}
                        <span className={getDifficultyClass(
                          selectedSala.partida?.dificultad_tiempo
                        )}>
                          {selectedSala.partida?.dificultad_tiempo || '-'}
                        </span>
                      </p>
                      <p>
                        <span className='font-semibold'>
                          Dificultad de preguntas:
                        </span>{' '}
                        <span className={getDifficultyClass(
                          selectedSala.partida?.dificultad_pregunta
                        )}>
                          {selectedSala.partida?.dificultad_pregunta || '-'}
                        </span>
                      </p>
                      <p>
                        <span className='font-semibold'>
                          Total de preguntas:
                        </span>{' '}
                        <span className='text-blue-300'>
                          {selectedSala.partida?.total_preguntas || '-'}
                        </span>
                      </p>
                    </div>

                    {/* Info del oponente */}
                    <div className='bg-black/20 rounded-xl p-4 space-y-2'>
                      <h4 className='text-xl font-semibold mb-2'>
                        Vas a jugar con:
                      </h4>
                      {(() => {
                        const opponent = getOpponent(selectedSala);
                        const user = opponent?.User;

                        if (!opponent || !user) {
                          return (
                            <p className='text-sm text-gray-300'>
                              Todavía no hay información del oponente.
                            </p>
                          );
                        }

                        return (
                          <div className='flex items-center gap-4'>
                            {user.foto_perfil && (
                              <img
                                src={resolveFotoAjena(user.foto_perfil)}
                                alt={user.name}
                                className='w-16 h-16 rounded-full object-cover border-2 border-yellow-400'
                              />
                            )}
                            <div className='space-y-1'>
                              <p>
                                <span className='font-semibold'>Nombre:</span>{' '}
                                <span className='text-yellow-300'>{user.name}</span>
                              </p>
                              <p>
                                <span className='font-semibold'>País:</span>{' '}
                                <span className='text-green-300'>{user.pais}</span>
                              </p>
                              <p>
                                <span className='font-semibold'>Puntaje:</span>{' '}
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
                    className='px-10 py-2 rounded-full bg-green-500 hover:bg-green-600 font-semibold shadow-lg cursor-pointer'
                  >
                    Jugar
                  </button>
                </div>

                {/* Reconfirmación como overlay absoluto */}
                <AnimatePresence>
                  {showConfirm && (
                    <motion.div
                      key='confirm-overlay'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='absolute inset-0 z-20 bg-white/5 flex items-center justify-center'
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className='bg-indigo-950 rounded-2xl p-6 max-w-md w-[90%] shadow-2xl space-y-4 border border-white/30'
                      >
                        <p className='font-semibold text-white text-lg'>
                          ¿Estás seguro que querés jugar esta partida?
                        </p>
                        <div className='flex gap-3 flex-wrap justify-end'>
                          <button
                            type='button'
                            onClick={() => setShowConfirm(false)}
                            className='px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow cursor-pointer'
                          >
                            Cancelar
                          </button>
                          <button
                            type='button'
                            onClick={handleJoinGameConfirmed}
                            className='px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold shadow cursor-pointer'
                          >
                            Sí, jugar
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
