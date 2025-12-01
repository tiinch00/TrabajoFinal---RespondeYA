import { useEffect, useState } from 'react';

import QCChartStable from '../../components/graficosQuickchart.io/QCChartStable';
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AbmEstadisticas = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promedio, setPromedio] = useState(0);
  const [preguntasCalculadas, setPreguntasCalculadas] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';

  const {t} = useTranslation();

  const navigate = useNavigate();

  const getCategorias = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/admin/categorias`);
      return data;
    } catch (error) {
      console.error('Error fetching categorias:', error);
      throw error;
    }
  };

  const getPartidas = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/admin/partidas`);
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching partidas:', error);
      throw error;
    }
  };
  const getEstadisticas = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/admin/estadisticas`);
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
      <h2 className='text-white text-center mb-8'>{t('generalsStadistics')}</h2>

      {/* Resumen general */}
      <div className='grid grid-cols-2 gap-4 mb-8'>
        <p className='text-white text-center bg-slate-700 p-4 rounded'>
          ⏱️ {t('promedio')} <strong>{promedio}ms</strong>
        </p>
        <p className='text-white text-center bg-slate-700 p-4 rounded'>
          ✅ {t('percent')}{' '}
          <strong>{preguntasCalculadas}%</strong>
        </p>
      </div>

   
      <div className='mb-12'>
        <h3 className='text-white text-center mb-4'>{t('mostPlaysCategories')}</h3>
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
