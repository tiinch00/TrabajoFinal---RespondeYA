// src/components/graficosQuickchart.io/QCChartStable.jsx

import { useEffect, useState } from 'react';

import { buildQuickChartURL } from '../../utils/quickchart';
import { scale } from 'motion/react';

export default function QCChartStable({
    //config,
    labels = [
        'Categoria 1',
        'Categoria 2',
        'Categoria 3',
        'Categoria 4',
        'Categoria 5',
        'Categoria 6',
        'Categoria 7',
        'Categoria 8',
        'Categoria 9',
        'Categoria 10'
    ],
    data = [19, 10, 15, 10, 12, 18, 17, 16, 15, 8],
    width = '700px',
    height = 'fit',
    format = 'png',
    backgroundColor = 'transparent',
    alt = 'chart',
    className = '',
}) {
    // antes era barConfig
    const config = {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Categorias',                
                data,
                //backgroundColor: 'rgba(54,162,235,0.6)', //color-mix(in oklab, var(--color-fuchsia-500) 95%, transparent)
                backgroundColor: '#e12afbf2',
                borderColor: '#e32afb',
                borderWidth: 1,
            }],
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
                        display: true,                      // ON
                        color: 'rgba(0, 0, 0, 0.432)',         // contraste de las lineas de fondo
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
                        color: 'rgba(0, 0, 0, 0.432)',
                        lineWidth: 1,
                        drawOnChartArea: true,
                        drawTicks: true,
                        borderColor: 'rgba(0,0,0,0.2)',
                        borderWidth: 1,
                    },
                    title: {
                        display: true,
                        text: 'Partidas realizadas',
                        color: 'white',
                        padding: { top: 4, bottom: 4 },
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
        const url = buildQuickChartURL({ config, width, height, format, backgroundColor }) + '&version=4';
        setSrc(url);
    }, [JSON.stringify(config), width, height, format, backgroundColor]);

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            // style={{ width: '100%', height: 'auto', display: 'block' }}
            loading="lazy"
        />
    );
}
