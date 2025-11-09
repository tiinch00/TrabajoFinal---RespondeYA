import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Trophy, Medal, Award, Home, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Ranking = () => {
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
  console.log(rankingPaginado);
  const getData = async () => {
    try {
      const [resUsuarios, resJugadores] = await Promise.all([
        axios.get('http://localhost:3006/users'),
        axios.get('http://localhost:3006/jugadores'),
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
    } catch (err) {
      console.error('Error al obtener ranking:', err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleBuscador = (e) => setBuscador(e.target.value);

  const jugadoresFiltrados = !buscador.trim()
    ? ranking
    : ranking.filter((dato) => dato.name.toLowerCase().includes(buscador.toLowerCase()));

  const getMedalIcon = (posicion) => {
    if (posicion === 1) return <Trophy className='w-6 h-6 text-yellow-400' />;
    if (posicion === 2) return <Medal className='w-6 h-6 text-gray-400' />;
    if (posicion === 3) return <Award className='w-6 h-6 text-orange-600' />;
    return <span className='text-lg font-bold'>{posicion}</span>;
  };

  return (
    <div className='w-150 h-full mt-6 px-4 pb-4'>
      <div className='flex justify-center  items-center mb-4'>
        <Link
          to='/'
          className='inline-flex items-center text-yellow-600 hover:text-yellow-800 mb-3 transition-colors'
        >
          <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center mb-6'
      >
        <h2 className='text-4xl font-black text-transparent h-12 bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400 mb-2 drop-shadow-lg'>
          🏆 {t('rankingPlayers')}
        </h2>
      </motion.div>

      <div className='flex justify-center items-center mb-6 gap-3'>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setMostrarInput((prev) => !prev), setBuscador('');
          }}
          className='bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-3 rounded-full hover:shadow-lg transition-all duration-300 border-2 border-yellow-300'
        >
          {mostrarInput ? <X size={24} /> : <Search size={24} />}
        </motion.button>

        <AnimatePresence>
          {mostrarInput && (
            <motion.input
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '300px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              type='text'
              name='buscador'
              value={buscador}
              onChange={handleBuscador}
              placeholder={t('findPlayer')}
              className='px-4 py-3 rounded-full bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 shadow-lg font-medium'
            />
          )}
        </AnimatePresence>
      </div>

      {jugadoresFiltrados.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className=' rounded-2xl shadow-2xl overflow-hidden border-4 border-yellow-400/50'
        >
          <table className='w-full text-white'>
            <thead>
              <tr className='bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 text-white'>
                <th className='p-4 text-center font-black text-lg'>{t('position')}</th>
                <th className='p-4 text-center font-black text-lg'>{t('name')}</th>
                <th className='p-4 text-center font-black text-lg'>{t('countryRanking')}</th>
                <th className='p-4 text-center font-black text-lg'>{t('points')}</th>
              </tr>
            </thead>
            <tbody>
              {rankingPaginado.map((jugador, index) => (
                <motion.tr
                  key={jugador.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-t border-yellow-500/20 hover:bg-yellow-500/10 transition-colors ${
                    jugador.posicion <= 3 ? 'bg-yellow-500/5' : ''
                  }`}
                >
                  <td className='p-4 text-center'>
                    <div className='flex justify-center items-center'>
                      {getMedalIcon(jugador.posicion)}
                    </div>
                  </td>
                  <td className='p-4 text-center font-semibold text-gray-100'>{jugador.name}</td>
                  <td className='p-4 text-center text-gray-300'>{jugador.pais}</td>
                  <td className='p-4 text-center'>
                    <span className='text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400'>
                      {jugador.puntaje}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-center py-12'>
          <p className='text-gray-400 text-xl'>{t('playersNotFound')}</p>
        </motion.div>
      )}

      {rankingPaginado.length >= 1 && (
        <div className='flex place-content-between m-2 p-2'>
          <button
            className={`cursor-pointer border-1 rounded-full p-1  bg-blue-500  ${
              paginaActual === 0 ? 'invisible' : ''
            }`}
            onClick={handlePreview}
          >
            {t('preview')}
          </button>

          <h2 className='text-white'>
            {t('page')}: {1 + paginaActual}
          </h2>

          <button
            className={`cursor-pointer border-1 rounded-full p-1 bg-orange-300/80 text-white transition ${
              paginaActual >= totalPaginas - 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleNext}
            disabled={paginaActual >= totalPaginas - 1}
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Ranking;
