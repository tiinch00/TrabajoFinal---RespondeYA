// src/components/graficosQuickchart.io/ChartMultilineLabelsImg.jsx

import { useEffect, useState } from 'react';

import { buildQuickChartURL } from '../../utils/quickchart';

export default function ChartMultilineLabels({
    arregloCompleto,
    labels = ['pregunta 1', 'pregunta 2', 'pregunta 3', 'pregunta 4', 'pregunta 5', 'pregunta 6', 'pregunta 7', 'pregunta 8', 'pregunta 9', 'pregunta 10'],
    width = "500px",
    height = '250px',
    format = 'png',
    backgroundColor = 'transparent',
    alt = 'Gráfico con etiquetas multilínea',
    className = '',
}) {

    //console.log("componente grafica: ", arregloCompleto?.respuestasDeLaPartida);

    const tiemposMs = (arregloCompleto?.respuestasDeLaPartida ?? [])
        .map(e => Number(e.tiempo_respuesta_ms))
        .filter(Number.isFinite);

    const tiemposSeg = tiemposMs.map(ms => Math.round(ms / 1000));

    //console.log("tiemposSeg:", tiemposSeg);

    // 10 primeros - jugador 1
    const dataA = tiemposSeg.slice(0, 10);

    // 10 últimos - jugador 2
    const dataB = tiemposSeg.slice(10);

    //console.log("dataA:", dataA);
    //console.log("dataB:", dataB);

    const config = {
        type: 'line',
        data: {
            labels, // si querés multilínea: [['pregunta','1'], ['pregunta','2'], ...]
            datasets: [
                {
                    label: 'Primer Jugador',
                    data: dataA,
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 2,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    pointBackgroundColor: 'rgb(239, 20, 68)',
                    pointBorderColor: 'rgb(255, 99, 132)',
                    pointRadius: 3,            //  radio del punto
                    pointStyle: 'circle',
                    fill: false,
                },
                {
                    label: 'Segundo Jugador',
                    data: dataB,
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 2,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    pointBackgroundColor: 'rgb(3, 57, 172)',
                    pointBorderColor: '#08c2ecdb',
                    pointRadius: 3,
                    pointStyle: 'circle',
                    fill: false,
                },
            ],
        },
        options: {
            plugins: {
                title: {
                    display: false,
                    // text: 'Chart.js Line Chart',
                    // color: '#222',
                },
                legend: {
                    labels: {
                        color: 'white',
                        usePointStyle: true,   // muestra círculo en la leyenda
                        pointStyle: 'circle',
                        boxWidth: 8, boxHeight: 8, padding: 12
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
                        text: 'Tiempo en segundos',
                        color: 'white',
                        padding: { top: 4, bottom: 4 },
                        font: { size: 14, family: 'sans-serif', weight: 'bold' },
                    },
                },
            },
            backgroundColor: 'transparent',
        },
    };

    // Forzar v4 en QuickChart
    const [src, setSrc] = useState(() =>
        buildQuickChartURL({ config, width, height, format, backgroundColor }) + '&version=4'
    );

    useEffect(() => {
        const url = buildQuickChartURL({ config, width, height, format, backgroundColor }) + '&version=4';
        setSrc(url);
    }, [JSON.stringify(config), width, height, format, backgroundColor]);

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            loading="lazy"
        />
    );
}
