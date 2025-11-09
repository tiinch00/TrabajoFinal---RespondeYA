// src/components/graficosQuickchart.io/QCChartStable.jsx

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildQuickChartURL } from '../../utils/quickchart';
import { scale } from 'motion/react';

export default function QCChartStable({
  arregloCompleto,
  width = 'full',
  height = '200px',
  format = 'png',
  backgroundColor = 'transparent',
  alt = 'chart',
  className = '',
}) {
  // comienzo de const:
  const { t } = useTranslation();
  const categoryTranslations = {
    Cine: t('cinema'),
    Historia: t('history'),
    'Conocimiento General': t('generalKnowLedge'),
    Geografía: t('geography'),
    Informatica: t('informatic'),
  };
  const arrCats = (() => {
    const seenUno = new Set();
    const outUno = [];
    for (const i of arregloCompleto.categorias ?? []) {
      const nombreOriginal = i?.nombre?.trim();
      if (!nombreOriginal || seenUno.has(nombreOriginal.toLowerCase())) continue;
      seenUno.add(nombreOriginal.toLowerCase());
      outUno.push(nombreOriginal); // guardo en español, sin traducir todavía
    }
    return outUno;
  })();
  //console.log("arrCats: ", arrCats);

  const arrayCategorias = (() => {
    const seen = new Set();
    const out = [];
    for (const e of arregloCompleto.listaObjetosPartidaInformacion ?? []) {
      const raw = e?.categoria;
      if (typeof raw !== 'string') continue;
      const norm = raw.trim().toLowerCase(); // normalizo para comparar
      if (!norm || seen.has(norm)) continue;
      seen.add(norm);
      out.push(raw.trim()); // guardo como vino (con mayúsculas originales)
    }
    return out;
  })();
  //console.log("arrayCategorias: ", arrayCategorias);

  const counts = (arregloCompleto.listaObjetosPartidaInformacion ?? []).reduce((acc, e) => {
    const k = (e?.categoria ?? '').trim().toLowerCase();
    if (!k) return acc;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  //console.log("counts: ", counts); // { ciencia: 3, historia: 1, ... }

  const categoriasConConteo = arrCats.map((cat) => {
    const norm = cat.trim().toLowerCase();
    return {
      categoria: cat,
      count: counts[norm] ?? 0,
    };
  });
  //console.log("categoriasConConteo: ", categoriasConConteo);

  const nuevoLabels = categoriasConConteo.map(
    (e) => categoryTranslations[e.categoria] ?? e.categoria
  );

  //const nuevoData = categoriasConConteo.map(e => e.count);
  const nuevoData = (() => {
    const base = categoriasConConteo.map((e) => e.count);
    const total = base.reduce((acc, n) => acc + n, 0);
    return [...base, total];
  })();

  // antes era barConfig
  const config = {
    type: 'bar',
    data: {
      labels: nuevoLabels,
      datasets: [
        {
          label: t('categories'),
          data: nuevoData,
          //backgroundColor: 'rgba(54,162,235,0.6)', //color-mix(in oklab, var(--color-fuchsia-500) 95%, transparent)
          backgroundColor: '#e12afbf2',
          borderColor: '#e32afb',
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        legend: { labels: { color: 'white' } },
        datalabels: {
          anchor: 'center',
          align: 'center',
          color: '#fff',
          font: {
            weight: 'bold',
          },
        },
        // title: {
        //     display: true,
        //     text: "Chart.js Line Chart" //hace el titulo
        // }
      },
      scales: {
        x: {
          ticks: { color: 'white', autoSkip: false }, // preguntas (el color)
          grid: {
            display: true, // ON
            color: 'white', // contraste de las lineas de fondo
            lineWidth: 1,
            drawOnChartArea: true,
            drawTicks: true,
            borderColor: 'rgba(0,0,0,0.2)', // bordes del eje
            //borderWidth: 1,
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
            text: t('realizedMatches'),
            color: 'white',
            padding: { top: 2, bottom: 4 },
            font: { size: 14, family: 'sans-serif', weight: 'light' },
          },
        },
      },
      backgroundColor: 'transparent',
    },
  };

  // se crea la URL y se forza en version=4 para evitar ambigüedades
  const baseUrl = buildQuickChartURL({ config, width, height, format, backgroundColor });
  const withVersion = `${baseUrl}`; // importante declarar version 4 (&version=4)
  const [src, setSrc] = useState(withVersion);

  useEffect(() => {
    const url =
      buildQuickChartURL({ config, width, height, format, backgroundColor }) + '&version=4';
    setSrc(url);
  }, [JSON.stringify(config), width, height, format, backgroundColor]);

  return <img src={src} alt={alt} className={className} loading='lazy' />;
}
