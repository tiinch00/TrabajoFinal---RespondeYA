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

  const [playCorrect] = useSound(correcta, { volume: 0.6 });
  const [playWrong] = useSound(incorrecta, { volume: 0.6 });
  const [playTimeout] = useSound(finalDeJuego, { volume: 0.7 });

  const { categoria, tiempo, dificultad } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(null);
  //const [opciones, setOpciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState('');
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState('');
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);
  const [contador, setContador] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(pasarTiempo(tiempo));

  // estados para el contador inicial
  const [contadorInicial, setContadorInicial] = useState(5);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [mostrarContador, setMostrarContador] = useState(false);

  const user = getStoredUser();

  const [foto] = useState(user.foto_perfil);

  function pasarTiempo(tiempo) {
    if (tiempo === 'facil') return '15';
    if (tiempo === 'normal') return '10';
    if (tiempo === 'dificil') return '5';
    return '';
  }

  // Efecto para cargar preguntas
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const categoriaDB = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:3006/preguntas/categoria/${categoria.toLowerCase()}/${dificultad.toLowerCase()}`
        );

        if (res.data && res.data.length > 0) {
          const preguntasAleatorias = res.data.sort(() => Math.random() - 0.5).slice(0, 10);
          setPreguntas(preguntasAleatorias);
          setPreguntaActual(preguntasAleatorias[0]);
          // Una vez cargadas las preguntas, mostrar el contador
          setMostrarContador(true);
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

  useEffect(() => {
    if (mostrarContador && contadorInicial > 0) {
      const timer = setTimeout(() => {
        setContadorInicial(contadorInicial - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (mostrarContador && contadorInicial === 0 && !juegoIniciado) {
      setJuegoIniciado(true);
    }
  }, [contadorInicial, mostrarContador, juegoIniciado]);

  // cada vez que cambia la pregunta actual, reinicia el tiempo
  useEffect(() => {
    if (!preguntaActual || !juegoIniciado) return;

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
  }, [preguntaActual, juegoIniciado]);

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

  // Pantalla de contador inicial
  if (mostrarContador && contadorInicial > 0) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <div className='text-center space-y-8'>
          <h1 className='text-4xl font-bold text-white mb-8'>¡Prepárate!</h1>

          <div className='bg-purple-600 px-8 py-4 rounded-2xl text-white text-2xl font-bold mb-8'>
            Categoría: {categoria?.toUpperCase()}
          </div>

          <div className='flex flex-col items-center space-y-4'>
            <p className='text-white text-xl'>
              Tiempo por pregunta: <span className='font-bold'>{pasarTiempo(tiempo)} segundos</span>
            </p>
            <p className='text-white text-xl'>
              Dificultad: <span className='font-bold capitalize'>{dificultad}</span>
            </p>
            <p className='text-white text-xl'>
              Total de preguntas: <span className='font-bold'>10</span>
            </p>
          </div>

          <div className='mt-12'>
            <div className='text-[180px] font-bold text-yellow-400 animate-pulse drop-shadow-[0_0_40px_rgba(250,204,21,0.9)]'>
              {contadorInicial}
            </div>
          </div>

          <div className='mt-8 text-white text-xl font-semibold'>El juego comenzará en...</div>
        </div>
      </div>
    );
  }

  // Pantalla de carga inicial
  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-gradient-to-b from-indigo-950 to-purple-900'>
        <div className='text-center space-y-8'>
          <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400'></div>
          <p className='text-white text-2xl'>Cargando preguntas...</p>
        </div>
      </div>
    );
  }

  // Pantalla de juego
  return (
    <div className='flex w-full h-screen text-white p-4'>
      <div className='flex flex-col items-center justify-center w-1/5'>
        <div className='flex flex-col items-center mb-4'>
          {user?.foto_perfil ? (
            <img
              src={`http://localhost:3006${user.foto_perfil}`}
              alt='Foto de perfil'
              className='w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-lg mb-2'
            />
          ) : (
            <div className='w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-3xl mb-2'>
              👤
            </div>
          )}
          <span className='bg-blue-700 px-3 py-1 rounded-md text-sm'>
            {user?.name || 'Usuario'}
          </span>
        </div>
      </div>

      <div className='flex flex-col items-center justify-start w-3/5'>
        <div className='bg-purple-500 rounded-lg px-6 py-2 mb-4 text-xl font-bold'>
          {categoria.toLocaleUpperCase() || 'Nombre de la categoría'}
        </div>

        {alerta ? (
          <p className='text-red-500'>{alerta}</p>
        ) : preguntaActual && juegoIniciado ? (
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
                  disabled={!!respuestaSeleccionada}
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
                <div key={index}>
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
          Tiempo: {tiempoRestante} s
        </div>
      </div>
    </div>
  );
};

export default JugarIndividual;
