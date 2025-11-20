// server/sockets/index.js

import { Server } from 'socket.io';
import registrarEventosChat from './chat.controller.js';
import registrarEventosSala from './sala.controller.js';

let ioRef = null;

export function crearSocketServer(httpServer) {
    const allowedOrigins = [
        'https://proyecto-respondeya.vercel.app',
        'https://respondeya.website',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];

    const io = new Server(httpServer, {
        path: '/socket.io',
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'], // opcional, pero prolijo
    });

    io.on('connection', (socket) => {
        console.log('🔌 socket conectado:', socket.id);

        registrarEventosSala(io, socket);
        registrarEventosChat(io, socket);
    });

    ioRef = io;
    return io;
}

export function getIO() {
    if (!ioRef) throw new Error('Socket.IO no inicializado');
    return ioRef;
}