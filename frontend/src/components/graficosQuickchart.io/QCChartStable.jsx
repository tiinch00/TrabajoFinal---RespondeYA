// src/components/graficosQuickchart.io/QCChartStable.jsx

import { useEffect, useState } from 'react';

import { buildQuickChartURL } from '../../utils/quickchart';

export default function QCChartStable({
    //config,
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
    data = [19, 10, 15, 10, 12, 18, 17, 16, 15, 8],
    width = 700,

    height = 380,

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
                label: 'Preguntas',
                data,
                backgroundColor: 'rgba(54,162,235,0.6)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1,
            }],
        },
        options: {
            plugins: {
                datalabels: {
                    anchor: 'center',
                    align: 'center',
                    color: '#fff',
                    font: {
                        weight: 'bold',
                    },
                },
            },
        },
    };

    // ✅ Calcula la URL en el primer render (no queda en "")
    const [src, setSrc] = useState(() =>
        // reemplazo config por barConfig
        buildQuickChartURL({ config, width, height, format, backgroundColor })
    );

    useEffect(() => {
        // reemplazo config por barConfig
        setSrc(buildQuickChartURL({ config, width, height, format, backgroundColor }));
        // Detectar cambios reales en config sin useMemo:
        // eslint-disable-next-line react-hooks/exhaustive-deps

        // reemplazo config por barConfig
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
