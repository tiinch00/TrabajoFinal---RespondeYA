import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
      <h1 className='text-center text-2xl'>Categoria: {nombre}</h1>
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
