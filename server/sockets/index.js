// server/sockets/index.js

import { Server } from 'socket.io';
import registrarEventosChat from './chat.controller.js';
import registrarEventosSala from './sala.controller.js';

let ioRef = null;

export function crearSocketServer(httpServer) {
    const io = new Server(httpServer, {
        path: '/socket.io',
        cors: {
            origin: [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://52.15.53.177:3000",
                "http://52.15.53.177",
                //"https://respondeya.vercel.app",
                //"https://api.respondeya.com",
            ],
            methods: ["GET", "POST"],
            credentials: true
        },
    });

    io.on('connection', (socket) => {
        console.log('🔌 socket conectado:', socket.id);

        // registrar todos los “controllers” de sockets
        registrarEventosSala(io, socket);
        registrarEventosChat(io, socket);
        // acá podrías registrar otros: registrarEventosChat(io, socket); etc.
    });

    ioRef = io;
    return io;
}

// Para emitir desde controllers HTTP (e.g., después de guardar en DB)
export function getIO() {
    if (!ioRef) throw new Error('Socket.IO no inicializado');
    return ioRef;
}
