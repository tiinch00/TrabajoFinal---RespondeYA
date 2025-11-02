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
    width = "500px",
    height = '250px',
    format = 'png',
    backgroundColor = 'transparent',
    alt = 'Gráfico con etiquetas verticales',
    className = '',
}) {
    // aca comienza agregar const

    const tiemposMs = (arregloCompleto?.respuestasDeLaPartida ?? [])
        .map(e => Number(e.tiempo_respuesta_ms))
        .filter(Number.isFinite); // limpia null o NaN

    const tiemposSeg = tiemposMs.map(ms => Math.round(ms / 1000));

    const data = tiemposSeg;

    const config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Respuesta',
                data,
                borderColor: 'rgb(114, 33, 253)',          // linea visible
                borderWidth: 2,
                backgroundColor: "rgba(0, 25, 79, 0.6)", // área bajo la línea
                pointBackgroundColor: 'rgb(3, 57, 172)',
                pointBorderColor: '#08c2ecdb',
                pointRadius: 4,            //  radio del punto
                pointStyle: 'circle',      // estilo del punto (impacta en la leyenda si usePointStyle=true)
                fill: false,
                //tension: 0.3,
            }],
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: 'white',
                        usePointStyle: true,
                        // opcional: forzar círculo para todos los datasets:
                        pointStyle: 'circle',
                        boxWidth: 8, boxHeight: 8, padding: 12
                    }
                },
                title: {
                    //display: true, // true: habilita un titulo
                    //text: "Chart.js Line Chart" //hace el titulo                
                },
            },
            scales: {
                x: {
                    ticks: { color: 'white', autoSkip: false }, // preguntas (el color)
                    grid: {
                        display: true,                      // ON
                        color: 'white',         // contraste de las lineas de fondo
                        lineWidth: 1,
                        drawOnChartArea: true,
                        drawTicks: true,
                        borderColor: 'rgba(0,0,0,0.2)',               // bordes del eje
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
                        text: 'Tiempo en segundos',
                        color: 'white',
                        padding: { top: 4, bottom: 4 },
                        font: { size: 14, family: 'sans-serif', weight: 'bold' },
                    },
                },
            },
            backgroundColor: 'transparent',
        }

    };

    // se crea la URL y se forza en version=4 para evitar ambigüedades
    const baseUrl = buildQuickChartURL({ config, width, height, format, backgroundColor }); // backgroundColor
    const withVersion = `${baseUrl}`; // importante declarar version 4 (&version=4)
    const [src, setSrc] = useState(withVersion);

    useEffect(() => { //backgroundColor
        const url = buildQuickChartURL({ config, width, height, format, backgroundColor }) + '&version=4';
        setSrc(url);
    }, [JSON.stringify(config), width, height, format, backgroundColor]); // backgroundColor

    return <img src={src} alt={alt} className={className} loading="lazy" />;
}
