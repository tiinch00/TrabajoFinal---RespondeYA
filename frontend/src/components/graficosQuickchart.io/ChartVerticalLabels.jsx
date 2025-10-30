// src/components/graficosQuickchart.io/ChartVerticalLabelsImg.jsx

import { useEffect, useState } from 'react';

import { buildQuickChartURL } from '../../utils/quickchart';

export default function ChartVerticalLabels({
    // parametros de la funcion
    arregloCompleto,
    labels = [
        'pregunta 1',
        'pregunta 2',
        'pregunta 3',
        'pregunta 4',
        'pregunta 5',
        'pregunta 6',
        'pregunta 7',
        'pregunta 8',
        'pregunta 9',
        'pregunta 10'
    ],
    //data = [19, 10, 15, 10, 12, 18, 17, 16, 15, 8],
    width = "500px",
    height = '250px',
    format = 'png',
    backgroundColor = 'transparent',
    alt = 'Gráfico con etiquetas verticales',
    className = '',
}) {
    // aca comienza agregar const

    //console.log(arregloCompleto.respuestasDeLaPartida);

    const tiemposMs = (arregloCompleto?.respuestasDeLaPartida ?? [])
        .map(e => Number(e.tiempo_respuesta_ms))
        .filter(Number.isFinite); // opcional: limpia null/NaN
    
    const tiemposSeg = tiemposMs.map(ms => Math.round(ms / 1000));

    //console.log(tiemposSeg); // ej: [5000, 5050, 100]

    const data = tiemposSeg;

    const config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Respuesta',
                data,
                borderColor: '#74a0fe',          // linea visible
                borderWidth: 2,
                backgroundColor: 'rgba(71, 117, 217, 0.281)', // área bajo la línea
                pointBackgroundColor: '#0049e8',
                pointBorderColor: '#08c2ecdb',
                fill: false,
                //tension: 0.3,
            }],
        },
        options: {
            plugins: {
                legend: { labels: { color: 'black' } },
                title: {
                    //display: true, // true: habilita un titulo
                    //text: "Chart.js Line Chart" //hace el titulo                
                },
            },
            scales: {
                x: {
                    ticks: { color: 'black', autoSkip: false }, // preguntas (el color)
                    grid: {
                        display: true,                      // ON
                        color: 'rgba(0,0,0,0.2)',         // contraste de las lineas de fondo
                        lineWidth: 1,
                        drawOnChartArea: true,
                        drawTicks: true,
                        borderColor: 'rgba(0,0,0,0.2)',               // bordes del eje
                        //borderWidth: 1,
                    },
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: 'black' },
                    grid: {
                        display: true,
                        color: 'rgba(0,0,0,0.2)',
                        lineWidth: 1,
                        drawOnChartArea: true,
                        drawTicks: true,
                        borderColor: 'rgba(0,0,0,0.2)',
                        borderWidth: 1,
                    },
                    title: {
                        display: true,
                        text: 'Tiempo en segundos',
                        color: 'rgba(0, 0, 0, 0.845)',
                        padding: { top: 4, bottom: 4 },
                        font: { size: 14, family: 'sans-serif', weight: 'bold' },
                    },
                },
            },
            backgroundColor: 'transparent',
        }

    };

    // se crea la URL y se forza en version=4 para evitar ambigüedades
    const baseUrl = buildQuickChartURL({ config, width, height, format, backgroundColor });
    const withVersion = `${baseUrl}`; // importante declarar version 4 (&version=4)
    const [src, setSrc] = useState(withVersion);

    useEffect(() => {
        const url = buildQuickChartURL({ config, width, height, format, backgroundColor }) + '&version=4';
        setSrc(url);
    }, [JSON.stringify(config), width, height, format, backgroundColor]);

    return <img src={src} alt={alt} className={className} loading="lazy" />;
}
