import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { buildQuickChartURL } from '../../utils/quickchart';

export default function ChartVerticalLabels({
  arregloCompleto,
  labels,
  width = '500px',
  height = '250px',
  format = 'png',
  backgroundColor = 'transparent',
  alt = 'Gráfico con etiquetas verticales',
  className = '',
}) {
  // ✅ Hook dentro del componente
  const { t } = useTranslation();

  // ✅ Si querés traducir los labels
  const defaultLabels = Array.from({ length: 10 }, (_, i) => `${t('question')} ${i + 1}`);
  const finalLabels = labels ?? defaultLabels;

  const tiemposMs = (arregloCompleto?.respuestasDeLaPartida ?? [])
    .map((e) => Number(e.tiempo_respuesta_ms))
    .filter(Number.isFinite);

  const tiemposSeg = tiemposMs.map((ms) => Math.round(ms / 1000));

  const data = tiemposSeg;

  const config = {
    type: 'line',
    data: {
      labels: finalLabels, // ✅ usar las etiquetas traducidas
      datasets: [
        {
          label: t('answer'), // ✅ traducido
          data,
          borderColor: 'rgb(114, 33, 253)',
          borderWidth: 2,
          backgroundColor: 'rgba(0, 25, 79, 0.6)',
          pointBackgroundColor: 'rgb(3, 57, 172)',
          pointBorderColor: '#08c2ecdb',
          pointRadius: 4,
          pointStyle: 'circle',
          fill: false,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: 'white',
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            boxHeight: 8,
            padding: 12,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: 'white', autoSkip: false },
          grid: {
            display: true,
            color: 'white',
            lineWidth: 1,
            drawOnChartArea: true,
            drawTicks: true,
            borderColor: 'rgba(0,0,0,0.2)',
          },
        },
        y: {
          beginAtZero: true,
          ticks: { color: 'white' },
          grid: {
            display: true,
            color: 'white',
            lineWidth: 1,
            drawOnChartArea: true,
            drawTicks: true,
            borderColor: 'rgba(0,0,0,0.2)',
            borderWidth: 1,
          },
          title: {
            display: true,
            text: t('timeSeconds'), // ✅ traducido
            color: 'white',
            padding: { top: 4, bottom: 4 },
            font: { size: 14, family: 'sans-serif', weight: 'bold' },
          },
        },
      },
      backgroundColor: 'transparent',
    },
  };

  const baseUrl = buildQuickChartURL({ config, width, height, format, backgroundColor });
  const withVersion = `${baseUrl}`;
  const [src, setSrc] = useState(withVersion);

  useEffect(() => {
    const url =
      buildQuickChartURL({ config, width, height, format, backgroundColor }) + '&version=4';
    setSrc(url);
  }, [JSON.stringify(config), width, height, format, backgroundColor]);

  return <img src={src} alt={alt} className={className} loading='lazy' />;
}
