import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useSound from 'use-sound';
import incorrecta from '/sounds/incorrecta.wav';
import correcta from '/sounds/correcta.wav';
import finalDeJuego from '/sounds/finalDeJuego.wav';
import axios from 'axios';

const JugarIndividual = () => {
  const navigate = useNavigate();
  const getStoredUser = () => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return { name: raw };
    }
  };
  //const [playStart] = useSound(startSfx, { volume: 0.6 });
  const [playCorrect] = useSound(correcta, { volume: 0.6 });
  const [playWrong] = useSound(incorrecta, { volume: 0.6 });
  const [playTimeout] = useSound(finalDeJuego, { volume: 0.7 });

  const { categoria, tiempo, dificultad } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [opciones, setOpciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState('');
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState('');
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);
  const [contador, setContador] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(pasarTiempo(tiempo));

  const user = getStoredUser();

  function pasarTiempo(tiempo) {
    if (tiempo === 'facil') return '15';
    if (tiempo === 'normal') return '10';
    if (tiempo === 'dificil') return '5';
    return '';
  }

  // cada vez que cambia la pregunta actual, reinicia el tiempo
  useEffect(() => {
    if (!preguntaActual) return;

    setTiempoRestante(pasarTiempo(tiempo));

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGuardarRespuesta(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [preguntaActual]);

  const handleGuardarRespuesta = (opcion) => {
    if (!opcion) {
      setRespuestas((prev) => [...prev, { texto: 'Sin respuesta', es_correcta: false }]);
    } else {
      setRespuestas((prev) => [...prev, opcion]);
      setRespuestaSeleccionada(opcion);

      if (opcion.es_correcta === true) {
        setRespuestaCorrecta(opcion);
        playCorrect();
      } else {
        playWrong();
      }
    }

    setTimeout(() => {
      const siguiente = contador + 1;

      if (siguiente < preguntas.length) {
        setContador(siguiente);
        setPreguntaActual(preguntas[siguiente]);
        setRespuestaSeleccionada(null);
        setRespuestaCorrecta(null);
      } else {
        setAlerta('Juego terminado ✅');
        setJuegoTerminado(true);
        playTimeout();
      }
    }, 2000);
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
          const preguntasAleatorias = res.data
            .sort(() => Math.random() - 0.5) // baraja el array
            .slice(0, 10); // toma solo 10

          setPreguntas(preguntasAleatorias);
          setPreguntaActual(preguntasAleatorias[0]);
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

  return (
    <div className='flex w-full h-screen bg-indigo-950 text-white p-4'>
      <div className='flex flex-col items-center justify-center w-1/5'>
        <div className='w-20 h-20 rounded-full bg-blue-500 mb-2'></div>
        <span className='bg-blue-700 px-3 py-1 rounded-md text-sm'>{user?.name || 'Usuario'}</span>
      </div>

      <div className='flex flex-col items-center justify-start w-3/5'>
        <div className='bg-purple-500 rounded-lg px-6 py-2 mb-4 text-xl font-bold'>
          {categoria.toLocaleUpperCase() || 'Nombre de la categoría'}
        </div>

        {loading ? (
          <p>Cargando preguntas...</p>
        ) : alerta ? (
          <p className='text-red-500'>{alerta}</p>
        ) : preguntaActual ? (
          <div className='flex flex-col gap-3 w-full max-w-md'>
            <p className='text-lg font-semibold'>{preguntaActual.enunciado}</p>
            {preguntaActual.Opciones.map((opcion, index) => {
              let colorClase = 'bg-gray-300 text-black';

              if (respuestaSeleccionada === opcion) {
                colorClase = respuestaCorrecta
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white';
              }

              return (
                <button
                  key={index}
                  className={`rounded-lg py-2 cursor-pointer transition-all ${colorClase}`}
                  onClick={() => handleGuardarRespuesta(opcion)}
                  disabled={!!respuestaSeleccionada} // deshabilitar después de hacer clic
                >
                  {opcion.texto}
                </button>
              );
            })}
          </div>
        ) : (
          <p>No hay preguntas disponibles.</p>
        )}
        {juegoTerminado && (
          <div>
            {respuestas.map((respuesta, index) => {
              return (
                <div>
                  {index}
                  {respuesta.texto}
                  {respuesta.es_correcta}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className='flex flex-col items-center justify-center w-1/5'>
        <div className='bg-yellow-200 text-red-600 font-bold text-3xl px-4 py-2 rounded-lg mb-4'>
          Tiempo: {tiempoRestante}s
        </div>

        <div className='w-20 h-20 bg-gray-700 rounded-lg mb-2'></div>
        <span className='bg-red-500 px-3 py-1 rounded-md text-sm'>Skynet</span>
      </div>
    </div>
  );
};

export default JugarIndividual;
