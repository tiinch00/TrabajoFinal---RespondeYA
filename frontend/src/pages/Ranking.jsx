import { AnimatePresence, motion } from 'framer-motion';
import { Award, Home, Medal, Search, Trophy, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Ranking = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';
  const { t } = useTranslation();
  const [ranking, setRanking] = useState([]);
  const [buscador, setBuscador] = useState('');
  const [mostrarInput, setMostrarInput] = useState(false);
  const [paginaActual, setPaginaActual] = useState(0);
  const [rankingPaginado, setRankingPaginado] = useState(0);
  let itemsPorPagina = 5;
  const totalPaginas = Math.ceil(ranking.length / itemsPorPagina);
  const handleNext = () => {
    if (paginaActual < totalPaginas - 1) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const handlePreview = () => {
    if (paginaActual > 0) {
      setPaginaActual(paginaActual - 1);
    }
  };
  useEffect(() => {
    const inicio = paginaActual * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    setRankingPaginado(ranking.slice(inicio, fin));
  }, [ranking, paginaActual]);

  const getData = async () => {
    try {
      const [resUsuarios, resJugadores] = await Promise.all([
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/jugadores`),
      ]);

      const usuarios = resUsuarios.data.filter((u) => u.role !== 'administrador');
      const jugadores = resJugadores.data;

      const combinados = jugadores
        .map((jugador) => {
          const usuario = usuarios.find((usuario) => usuario.id === jugador.user_id);
          if (!usuario) return null;
          return {
            id: usuario.id,
            name: usuario.name,
            email: usuario.email,
            pais: usuario.pais,
            puntaje: jugador.puntaje || 0,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.puntaje - a.puntaje);
      const rankingConPosicion = combinados.map((jugador, index) => ({
        ...jugador,
        posicion: index + 1,
      }));
      setRanking(rankingConPosicion);
      setPaginaActual(0);
    } catch (err) {
      console.error('Error al obtener ranking:', err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleBuscador = (e) => setBuscador(e.target.value);
  // Filtrar jugadores
  const jugadoresFiltrados = !buscador.trim()
    ? ranking
    : ranking.filter((dato) => dato.name.toLowerCase().includes(buscador.toLowerCase()));

  const totalPaginasFiltradas = Math.ceil(jugadoresFiltrados.length / itemsPorPagina);

  // Paginar los datos filtrados
  const inicio = paginaActual * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const jugadoresPaginados = jugadoresFiltrados.slice(inicio, fin);
  const getMedalIcon = (posicion) => {
    if (posicion === 1) return <Trophy className='w-6 h-6 text-yellow-400' />;
    if (posicion === 2) return <Medal className='w-6 h-6 text-gray-400' />;
    if (posicion === 3) return <Award className='w-6 h-6 text-orange-600' />;
    return <span className='text-lg font-bold'>{posicion}</span>;
  };

  return (
    <div className='min-h-screen px-2 py-3 sm:px-4 lg:px-8'>
      <div className='max-w-5xl mx-auto'>
        {/* BACK */}
        <div className='flex justify-center sm:justify-center items-center mb-3'>
          <Link
            to='/'
            className='inline-flex items-center text-yellow-600 hover:text-yellow-800 mb-1 transition-colors text-xs sm:text-sm'
          >
            <svg className='w-4 h-4 mr-1.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            {t('back')}
          </Link>
        </div>

        {/* TÍTULO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center mb-3 sm:mb-4'
        >
          <h2 className='text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400 mb-1 drop-shadow-lg'>
            🏆 {t('rankingPlayers')}
          </h2>
        </motion.div>

        {/* BUSCADOR */}
        <div className='flex flex-col sm:flex-row justify-center items-center mb-4 gap-2.5'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setMostrarInput((prev) => !prev), setBuscador('');
            }}
            className='bg-gradient-to-br from-yellow-400 cursor-pointer to-orange-500 text-white p-2.5 rounded-full hover:shadow-lg transition-all duration-300 border border-yellow-300'
          >
            {mostrarInput ? <X size={18} /> : <Search size={18} />}
          </motion.button>

          <AnimatePresence>
            {mostrarInput && (
              <div className='w-full max-w-[220px] sm:max-w-xs'>
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  type='text'
                  name='buscador'
                  value={buscador}
                  onChange={handleBuscador}
                  placeholder={t('findPlayer')}
                  className='px-3 py-1.5 sm:py-2 rounded-full bg-white/90 text-gray-900 placeholder-gray-500 
                           focus:outline-none focus:ring-2 focus:ring-yellow-400/60 shadow-md font-medium 
                           text-xs sm:text-sm'
                />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* TABLA / LISTA */}
        {jugadoresFiltrados.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='rounded-2xl shadow-2xl overflow-hidden border-2 border-yellow-400/50'
          >
            <div className='overflow-x-auto'>
              <table className='w-full text-white text-start min-w-3xs'>
                <thead>
                  <tr className='bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 text-white'>
                    <th className='p-2 sm:p-3 text-center font-black text-xs sm:text-sm'>
                      {t('position')}
                    </th>
                    <th className='p-2 sm:p-3 text-center font-black text-xs sm:text-sm'>
                      {t('name')}
                    </th>
                    <th className='p-2 sm:p-3 text-center font-black text-xs sm:text-sm'>
                      {t('countryRanking')}
                    </th>
                    <th className='p-2 sm:p-3 text-center font-black text-xs sm:text-sm'>
                      {t('points')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jugadoresPaginados.map((jugador, index) => (
                    <motion.tr
                      key={jugador.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-t border-yellow-500/20 hover:bg-yellow-500/10 transition-colors ${jugador.posicion <= 3 ? 'bg-yellow-500/5' : ''
                        }`}
                    >
                      <td className='p-2 sm:p-3 text-center'>
                        <div className='flex justify-center items-center scale-90 sm:scale-100'>
                          {getMedalIcon(jugador.posicion)}
                        </div>
                      </td>
                      <td className='p-2 sm:p-3 text-center font-semibold text-gray-100 text-xs'>
                        {jugador.name}
                      </td>
                      <td className='p-2 sm:p-3 text-center text-gray-300 text-xs'>
                        {jugador.pais}
                      </td>
                      <td className='p-2 sm:p-3 text-center'>
                        <span className='text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400'>
                          {jugador.puntaje}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center py-8'
          >
            <p className='text-gray-400 text-sm sm:text-lg'>{t('playersNotFound')}</p>
          </motion.div>
        )}

        {/* PAGINACIÓN */}
        {totalPaginasFiltradas > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='flex flex-wrap justify-between items-center gap-2 sm:gap-3 mt-3 sm:mt-4 p-2'
          >
            <motion.button
              whileHover={paginaActual > 0 ? { scale: 1.03 } : {}}
              whileTap={paginaActual > 0 ? { scale: 0.95 } : {}}
              disabled={paginaActual === 0}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold transition-all duration-300 text-xs sm:text-sm ${paginaActual === 0
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-orange-400 to-orange-600 text-white cursor-pointer hover:shadow-md border border-orange-300'
                }`}
              onClick={handlePreview}
            >
              {t('preview')}
            </motion.button>

            <h2 className='text-white font-semibold text-xs sm:text-sm text-center flex-1 sm:flex-none'>
              {t('page')}: <span className='text-yellow-400 font-black'>{1 + paginaActual}</span> /{' '}
              {totalPaginasFiltradas}
            </h2>

            <motion.button
              whileHover={paginaActual < totalPaginasFiltradas - 1 ? { scale: 1.03 } : {}}
              whileTap={paginaActual < totalPaginasFiltradas - 1 ? { scale: 0.95 } : {}}
              disabled={paginaActual >= totalPaginasFiltradas - 1}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold transition-all duration-300 text-xs sm:text-sm ${paginaActual >= totalPaginasFiltradas - 1
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-orange-400 to-orange-600 text-white cursor-pointer hover:shadow-md border border-orange-300'
                }`}
              onClick={handleNext}
            >
              {t('next')}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );


};

export default Ranking;
