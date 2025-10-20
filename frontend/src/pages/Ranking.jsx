import { useEffect, useState } from 'react';
import axios from 'axios';

const Ranking = () => {
  const [ranking, setRanking] = useState([]);

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
            puntaje: jugador.puntaje || 0,
          };
        })
        .filter(Boolean) // quita los nulls
        .sort((a, b) => b.puntaje - a.puntaje);

      setRanking(combinados);
    } catch (err) {
      console.error('Error al obtener ranking:', err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className='max-w-lg mx-auto mt-6'>
      <h2 className='text-2xl font-bold text-center text-yellow-400 mb-6'>
        🏆 Ranking de Jugadores
      </h2>

      {ranking.length > 0 ? (
        ranking.map((jugador, index) => (
          <div
            key={jugador.id}
            className='p-4 bg-gray-800 text-amber-300 border border-yellow-500 rounded-lg shadow mb-3 flex justify-between items-center'
          >
            <div>
              <p className='font-bold text-lg'>
                {index + 1}. {jugador.name}
              </p>
            </div>
            <p className='text-xl font-semibold text-yellow-400'>{jugador.puntaje} pts</p>
          </div>
        ))
      ) : (
        <p className='text-center text-gray-400'>Cargando ranking...</p>
      )}
    </div>
  );
};

export default Ranking;
