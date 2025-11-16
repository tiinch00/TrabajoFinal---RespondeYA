// server/sockets/chat.controller.js
export default function registrarEventosChat(io, socket) {
    socket.on('chat:message', (msg, ack) => {
        const payload = {
            id: msg?.clientId || Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
            clientId: msg?.clientId || null,
            username: String(msg?.username || 'anonymous'),
            text: String(msg?.text || ''),
            createdAt: new Date().toISOString(),

            // 👇 NUEVO: propagamos la foto que viene del cliente
            foto_perfil: msg?.foto_perfil ?? null,
        };

        io.emit('chat:message', payload);   // ahora incluye foto_perfil

        if (typeof ack === 'function') ack({ ok: true });
    });
}
