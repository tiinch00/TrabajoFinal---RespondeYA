import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import PreguntasCrear from './PreguntasCrear.jsx';
import PreguntasListar from './PreguntasListar.jsx';

let itemsPorPagina = 5;
const AbmPreguntas = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [alerta, setAlerta] = useState('');
  const [preguntasPaginada, setPreguntasPaginada] = useState([]);
  const [paginaActual, setPaginaActual] = useState(0);

  const { nombre, id } = useParams();
  const preguntasDB = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3006/admin/categoria/${nombre}/${id}/preguntas`
      );
      setPreguntas(res.data);
    } catch (error) {
      console.error('Error fetching preguntas:', error.response?.data || error.message);
      setAlerta(error.response?.data?.error || 'Error al cargar las preguntas. Intenta de nuevo.');
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }

    preguntasDB();
  }, [nombre, id]);
  useEffect(() => {
    const inicio = paginaActual * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    setPreguntasPaginada(preguntas.slice(inicio, fin));
  }, [preguntas, paginaActual]);

  const handleNext = () => {
    const totalPaginas = Math.ceil(preguntas.length / itemsPorPagina);
    if (paginaActual < totalPaginas - 1) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const handlePreview = () => {
    if (paginaActual > 0) {
      setPaginaActual(paginaActual - 1);
    }
  };
  return (
    <div>
      <div className='mb-6 flex flex-col items-center'>
        <Link
          to='/admin/categorias'
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
          Volver a categorías
        </Link>
        <h1 className='text-2xl font-bold'>Categoría: {nombre}</h1>
      </div>
      {alerta && (
        <div className='text-black'>
          <p>{alerta}</p>
        </div>
      )}
      <div className='flex justify-center place-items-start'>
        <PreguntasCrear
          categoriaID={id}
          onCreate={(preguntaCreada) => {
            setPreguntas((prev) => [...prev, preguntaCreada]);
          }}
        />
        <PreguntasListar
          preguntas={preguntas}
          categoria={nombre}
          onEdit={(preguntaEditada) => {
            setPreguntas(
              preguntas.map((pregunta) =>
                pregunta.id === preguntaEditada.id ? preguntaEditada : pregunta
              )
            );
          }}
          onEliminar={(preguntaEliminadaId) => {
            setPreguntas(preguntas.filter((p) => p.id !== preguntaEliminadaId));
          }}
          paginaActual={paginaActual}
          handleNext={handleNext}
          handlePreview={handlePreview}
          preguntasPaginada={preguntasPaginada}
        />
      </div>
    </div>
  );
};

export default AbmPreguntas;
