import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';

const JugarIndividual = () => {
  const getStoredUser = () => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return { name: raw };
    }
  };

  const { categoria, tiempo, dificultad } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [opciones, setOpciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState('');

  const user = getStoredUser();

  const pasarTiempo = (tiempo) => {
    if (tiempo === 'facil') return '15';
    if (tiempo === 'normal') return '10';
    if (tiempo === 'dificil') return '5';
    return '';
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    const categoriaDB = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:3006/preguntas/categoria/${categoria.toLowerCase()}/${dificultad.toLowerCase()}`
        );
        setPreguntas(res.data);
        if (res.data && res.data.length > 0) {
          setPreguntaActual(res.data[0]);
          setOpciones(res.data[0].Opciones || []);
        } else {
          setAlerta('No se encontraron preguntas para esta categoría o dificultad.');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching preguntas:', error.response?.data || error.message);
        setAlerta(
          error.response?.data?.error || 'Error al cargar las preguntas. Intenta de nuevo.'
        );
        setLoading(false);
      }
    };
    categoriaDB();
  }, [categoria, dificultad]);
  console.log(preguntas);
  return (
    <div className='flex w-full h-screen bg-indigo-950 text-white p-4'>
      <div className='flex flex-col items-center justify-center w-1/5'>
        <div className='w-20 h-20 rounded-full bg-blue-500 mb-2'></div>
        <span className='bg-blue-700 px-3 py-1 rounded-md text-sm'>{user?.name || 'Usuario'}</span>
      </div>

      <div className='flex flex-col items-center justify-start w-3/5'>
        <div className='bg-purple-500 rounded-lg px-6 py-2 mb-4 text-xl font-bold'>
          Categoría: {categoria || 'Nombre de la categoría'}
        </div>

        {loading ? (
          <p>Cargando preguntas...</p>
        ) : alerta ? (
          <p className='text-red-500'>{alerta}</p>
        ) : preguntaActual ? (
          <div className='flex flex-col gap-3 w-full max-w-md'>
            <p className='text-lg font-semibold'>{preguntaActual.enunciado}</p>
            {opciones.length > 0 ? (
              opciones.map((opcion, index) => (
                <button
                  key={index}
                  className='bg-gray-300 rounded-lg py-2 text-black cursor-pointer'
                >
                  {opcion.texto}
                </button>
              ))
            ) : (
              <p>No hay opciones disponibles para esta pregunta.</p>
            )}
          </div>
        ) : (
          <p>No hay preguntas disponibles.</p>
        )}
      </div>

      <div className='flex flex-col items-center justify-center w-1/5'>
        <div className='bg-yellow-200 text-red-600 font-bold text-3xl px-4 py-2 rounded-lg mb-4'>
          Tiempo: <CountUp start={pasarTiempo(tiempo)} end={0} duration={pasarTiempo(tiempo)} />
        </div>
        <div className='w-20 h-20 bg-gray-700 rounded-lg mb-2'></div>
        <span className='bg-red-500 px-3 py-1 rounded-md text-sm'>Skynet</span>
      </div>
    </div>
  );
};

export default JugarIndividual;
