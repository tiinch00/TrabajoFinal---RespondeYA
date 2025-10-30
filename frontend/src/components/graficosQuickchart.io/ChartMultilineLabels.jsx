// src/components/graficosQuickchart.io/ChartMultilineLabelsImg.jsx

import { useEffect, useState } from 'react';

import { buildQuickChartURL } from '../../utils/quickchart';

export default function ChartMultilineLabels({
    labels = ['pregunta 1', 'pregunta 2', 'pregunta 3', 'pregunta 4', 'pregunta 5', 'pregunta 6', 'pregunta 7', 'pregunta 8', 'pregunta 9', 'pregunta 10'],
    data = [10, 14, 9, 18, 7, 12],
    width = 700,
    height = 350,
    format = 'png',
    backgroundColor = 'transparent',
    alt = 'Gráfico con etiquetas multilínea',
    className = '',
}) {
    const config = {
        type: 'line',
        data: {
            labels: [
                'pregunta 1',
                'pregunta 2',
                'pregunta 3',
                'pregunta 4',
                'pregunta 5',
                'pregunta 6',
                'pregunta 7',
                'pregunta 8',
                'pregunta 9',
                'pregunta 10'], // arrays → multilínea
            datasets: [
                {
                    label: "Primer Jugador",
                    fill: false,
                    backgroundColor: "rgb(255, 99, 132)",
                    borderColor: "rgb(255, 99, 132)",
                    data: [
                        15,
                        18,
                        10,
                        7,
                        15,
                        5,
                        5,
                        7,
                        19,
                        8
                    ],
                },
                {
                    label: "Segundo Jugador",
                    fill: false,
                    backgroundColor: "rgb(54, 162, 235)",
                    borderColor: "rgb(54, 162, 235)",
                    data: [
                        10,
                        15,
                        18,
                        19,
                        19.6,
                        5,
                        8,
                        6,
                        15,
                        10
                    ]
                }
            ],
        },
        options: {
            title: {
                "display": false, // true: habilita un titulo
                //"text": "Chart.js Line Chart" //hace el titulo                
            },
            scales: {
                xAxes: [{
                    "display": true,
                    "scaleLabel": {
                        "display": false,
                        //"labelString": "Month",
                        "fontColor": "#911",
                        "fontFamily": "Mono",
                        "fontSize": 20,
                        "fontStyle": "bold",
                        "padding": {
                            "top": 0, //20
                            "left": 0,
                            "right": 0,
                            "bottom": 0
                        }
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        "display": true,
                        "labelString": "Tiempo en segundos",
                        "fontColor": "#000000",
                        "fontFamily": "Times",
                        "fontSize": 20,
                        "fontStyle": "italic",
                        "padding": {
                            "top": 10,
                            "left": 0,
                            "right": 0,
                            "bottom": 0
                        }
                    }
                }]
            }
        },
    };

    // ✅ Calcula la URL en el primer render (no queda en "")
    const [src, setSrc] = useState(() =>
        buildQuickChartURL({ config, width, height, format, backgroundColor })
    );

    useEffect(() => {
        setSrc(buildQuickChartURL({ config, width, height, format, backgroundColor }));
        // Detectar cambios reales en config sin useMemo:
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(config), width, height, format, backgroundColor]);

    return <img src={src} alt={alt} className={className} style={{ width: '100%', height: 'auto', display: 'block' }} loading="lazy" />;
}
