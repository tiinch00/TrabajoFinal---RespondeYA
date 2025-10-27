import { BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useEffect, useRef, useState } from 'react';

const data = [    
    {
        pregunta: 'p1',
        uv: 4000,
        tiempo: 15,
        amt: 2400,
    },
    {
        pregunta: 'p2',
        uv: 3000,
        tiempo: 40,
        amt: 2210,
    },
    {
        pregunta: 'p3',
        uv: 2000,
        tiempo: 2,
        amt: 2290,
    },
    {
        pregunta: 'p4',
        uv: 2780,
        tiempo: 45,
        amt: 2000,
    },
    {
        pregunta: 'p5',
        uv: 1890,
        tiempo: 8,
        amt: 2181,
    },
    {
        pregunta: 'p6',
        uv: 3490,
        tiempo: 13,
        amt: 2100,
    },
    {
        pregunta: 'p7',
        uv: 3490,
        tiempo: 13,
        amt: 2100,
    },
    {
        pregunta: 'p8',
        uv: 3490,
        tiempo: 13,
        amt: 2100,
    },
    {
        pregunta: 'p9',
        uv: 3490,
        tiempo: 13,
        amt: 2100,
    },
    {
        pregunta: 'p10',
        uv: 3490,
        tiempo: 13,
        amt: 2100,
    },
];

export default function SimpleBarChart({ objPartidaIdInformacion }) {

    const data1 = [
        { pregunta1: "1", tiempo: 10 },
        { pregunta2: "2", tiempo: 20 },
        { pregunta3: "3", tiempo: 50 },
        { pregunta4: "4", tiempo: 30 },
        { pregunta5: "5", tiempo: 20 },
        { pregunta6: "6", tiempo: 10 },
        { pregunta7: "7", tiempo: 20 },
        { pregunta8: "8", tiempo: 30 },
        { pregunta9: "9", tiempo: 40 },
        { pregunta10: "10", tiempo: 59 },
    ];

    return (
        <div className='bg-white'>
            <span>simpleBarChart</span>
            {/* <ResponsiveContainer>
                <BarChart>

                </BarChart>
            </ResponsiveContainer> */}

            <LineChart
                style={{ width: '100%', maxWidth: '800px',height: '100%', maxHeight: '90vh', aspectRatio: 2 }}
                responsive
                data={data}
                margin={{
                    top: 5,
                    right: 0,
                    left: 0,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pregunta" />
                <YAxis width="auto" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tiempo" stroke="#8884d8" activeDot={{ r: 8 }} />
                {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}

            </LineChart>

        </div>
    )
}