import React from 'react';
import QCChartStable from '../../components/graficosQuickchart.io/QCChartStable';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AbmEstadisticas = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promedio, setPromedio] = useState(0);
  const [preguntasCalculadas, setPreguntasCalculadas] = useState(0);

  const navigate = useNavigate();

  const getCategorias = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3006/admin/categorias`);
      return data;
    } catch (error) {
      console.error('Error fetching categorias:', error);
      throw error;
    }
  };

  const getPartidas = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3006/admin/partidas`);
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching partidas:', error);
      throw error;
    }
  };
  const getEstadisticas = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3006/admin/estadisticas`);
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching categorias:', error);
      throw error;
    }
  };

  const calcularPromedio = (estadisticas) => {
    if (!estadisticas.length) return 0;
    const acumulador = estadisticas.reduce((acc, e) => acc + e.tiempo_total_ms, 0);
    return acumulador / estadisticas.length / 10;
  };

  const cantidadAciertosPromedio = (estadisticas) => {
    if (!estadisticas.length) return 0;
    const acumulador = estadisticas.reduce((acc, e) => acc + e.total_correctas, 0);
    console.log(acumulador);
    return (acumulador / estadisticas.length / 10) * 100;
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAndProcessData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Obtener datos
        const [categorias, partidas, estadisticas] = await Promise.all([
          getCategorias(),
          getPartidas(),
          getEstadisticas(),
        ]);

        const promedioCalculado = calcularPromedio(estadisticas);
        const preguntasCalculadas = cantidadAciertosPromedio(estadisticas);
        setPromedio(promedioCalculado.toFixed(2));
        setPreguntasCalculadas(preguntasCalculadas.toFixed(2));

        const categoriaMap = {};
        categorias.forEach((cat) => {
          categoriaMap[cat.id] = cat.nombre;
        });

        const listaObjetosPartidaInformacion = partidas.map((partida) => ({
          categoria: categoriaMap[partida.categoria_id] || 'Desconocida',
          resultado: partida.resultado,
          tiempoRespuesta: partida.tiempo_respuesta,
        }));

        const arregloCompleto = {
          categorias: categorias,
          listaObjetosPartidaInformacion: listaObjetosPartidaInformacion,
        };

        setChartData(arregloCompleto);
      } catch (err) {
        console.error('Error procesando datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, [navigate]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>Sin datos disponibles</div>;

  return (
    <div className='statistics-section min-h-screen'>
      <h2 className='text-white text-center mb-8'>Estadísticas Generales</h2>

      {/* Resumen general */}
      <div className='grid grid-cols-2 gap-4 mb-8'>
        <p className='text-white text-center bg-slate-700 p-4 rounded'>
          ⏱️ Promedio de tiempo de respuesta por pregunta: <strong>{promedio}ms</strong>
        </p>
        <p className='text-white text-center bg-slate-700 p-4 rounded'>
          ✅ Porcentaje de preguntas acertadas de todas las partidas jugadas:{' '}
          <strong>{preguntasCalculadas}%</strong>
        </p>
      </div>

      {/* Gráfico 1: Categorías más jugadas */}
      <div className='mb-12'>
        <h3 className='text-white text-center mb-4'>Categorías Más Jugadas</h3>
        <div className='flex justify-center'>
          <QCChartStable
            arregloCompleto={chartData}
            width='600px'
            height='300px'
            alt='Categorías más jugadas'
          />
        </div>
      </div>
    </div>
  );
};

export default AbmEstadisticas;
