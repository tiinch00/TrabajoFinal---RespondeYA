import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react'; // icono de lupa

const Ranking = () => {
  const [ranking, setRanking] = useState([]);
  const [buscador, setBuscador] = useState('');
  const [mostrarInput, setMostrarInput] = useState(false);

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

  return (
    <div className='max-w-lg mx-auto mt-6'>
      <h2 className='text-2xl font-bold text-center text-yellow-400 mb-6'>
        🏆 Ranking de Jugadores
      </h2>

      <div className='flex flex-col justify-center items-center mb-4'>
        <button
          onClick={() => setMostrarInput((prev) => !prev)}
          className='bg-yellow-400 text-gray-900 p-2 rounded-full hover:bg-yellow-500 transition-colors cursor-pointer mb-1'
        >
          <Search size={20} />
        </button>

        <input
          type='text'
          name='buscador'
          value={buscador}
          onChange={handleBuscador}
          placeholder='Buscar jugador...'
          className={`ml-2 px-3 py-2 rounded-lg bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${
            mostrarInput ? 'w-48 opacity-100' : 'w-0 opacity-0'
          }`}
        />
      </div>

      {jugadoresFiltrados.length > 0 ? (
        <table className='w-full bg-gray-800 text-amber-300 border border-yellow-500 rounded-lg shadow '>
          <thead>
            <tr className='bg-gray-900 text-yellow-400'>
              <th className='p-4 text-center'>Posición</th>
              <th className='p-4 text-center'>Nombre</th>
              <th className='p-4 text-center'>País</th>
              <th className='p-4 text-center'>Puntos</th>
            </tr>
          </thead>
          <tbody className='text-center'>
            {jugadoresFiltrados.map((jugador) => (
              <tr key={jugador.id} className='border-t border-yellow-500/50'>
                <td className='p-4 text-center'>{jugador.posicion}</td>
                <td className='p-4 text-center'>{jugador.name}</td>
                <td className='p-4 text-center'>{jugador.pais}</td>
                <td className='p-4 text-center'>
                  <span className='text-xl font-semibold text-yellow-400'>{jugador.puntaje}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className='text-center text-gray-400'>No se encontraron jugadores</p>
      )}
    </div>
  );
};

export default Ranking;
