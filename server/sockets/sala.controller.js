// server/sockets/sala.controller.js

import { Categoria, Jugador, Partida, Sala, SalaJugador } from '../models/associations.js'

import { User } from '../models/associations.js';

// Estado en memoria de salas
const salas = new Map();
// idSala -> { jugadores: [{socketId, userId, nombre, foto_perfil, esCreador}], createdAt }

// timers por sala para el comienzo sincronizado
const salaTimers = new Map(); // salaId -> timeoutId

function programarComienzo(io, salaId, ms = 10000) {
    // limpiar uno previo si existiera
    const prev = salaTimers.get(salaId);
    if (prev) clearTimeout(prev);

    const t = setTimeout(() => {
        io.to(salaId).emit('sala:comenzar'); // ← orden final a todos
        salaTimers.delete(salaId);
    }, ms);

    salaTimers.set(salaId, t);
}

function cancelarComienzoSiCorresponde(salaId) {
    const t = salaTimers.get(salaId);
    if (t) {
        clearTimeout(t);
        salaTimers.delete(salaId);
    }
}

function crearIdSala() {
    return Math.random().toString(36).slice(2, 10);
}

function formatearTimestampParaMySQL(timestampEnMilisegundos) {
    const fecha = new Date(timestampEnMilisegundos);

    // Usamos métodos para construir el string en formato 'YYYY-MM-DD HH:MM:SS'
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son de 0-11
    const dia = String(fecha.getDate()).padStart(2, '0');
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');

    return `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}

const PUBLIC_BASE = process.env.PUBLIC_URL_BASE || 'http://localhost:3006';
const toAbs = (p) => (p && String(p).startsWith('http') ? p : `${PUBLIC_BASE}${p || '/uploads/default.png'}`);


export default function registrarEventosSala(io, socket) {
    // ======= SALAS (máx 2 jugadores) =======

    socket.on('crear_partida', (datos, ack) => {
        try {
            const idPartida = crearIdSala();
            const sala = {
                jugadores: [], createdAt: Date.now(), config: {
                    categoria: datos.categoria,
                    dificultad: datos.dificultad,
                    tiempo: datos.tiempo
                }
            };
            salas.set(idPartida, sala);

            //console.log("socket crear_partida, datos: ", datos);

            (async () => {
                // 1) se crea el obj Categoria
                try {
                    const nombre = datos.categoria;
                    const objCategoria = await Categoria.findOne({
                        where: { nombre },
                    });
                    //console.log("Sala creada en la BD para objCategoria: ", objCategoria);
                    if (objCategoria) {
                        // 2) se crea el obj Sala
                        try {
                            const nuevaSala = await Sala.create({
                                codigo: idPartida,
                                categoria_id: objCategoria.id,
                                max_jugadores: 2,
                                estado: "esperando",
                                created_at: formatearTimestampParaMySQL(datos)
                            });
                            //console.log("Sala creada en la DB para nuevaSala: ", nuevaSala);
                            if (nuevaSala) {
                                // 3) se crea el obj Partida
                                try {
                                    const nuevaPartida = await Partida.create({
                                        sala_id: nuevaSala.id,
                                        categoria_id: objCategoria.id,
                                        modo: "multijugador",
                                        total_preguntas: 10,
                                        estado: "pendiente",
                                        created_at: formatearTimestampParaMySQL(datos)
                                    });
                                    //console.log("@@@ Sala creada en la DB para nuevaPartida: ", nuevaPartida);
                                    // envia el socket con success del primer try
                                    ack?.({ success: true, idPartida });
                                } catch (err) {
                                    console.error("Error al crear obj nuevaPartida en sala en la DB: ", err);
                                }
                            }  // fin segundo if
                        } catch (dbError) {
                            console.error("Error al crear sala en la DB: ", dbError);
                            // Opcional: puedes decidir cómo manejar este error específico de DB
                        }
                    } // fin primer if
                } catch (dbError) {
                    console.error("Error al crear sala en la DB: ", dbError);
                }
            })(); // fin funcion anonima            
        } catch {
            ack?.({ success: false, error: 'No se pudo crear la sala' });
        }
    });

    socket.on('obtener_sala', ({ salaId }, ack) => {
        const sala = salas.get(salaId);
        if (!sala) return ack?.({ ok: false, error: 'Sala inexistente' });
        //ack?.({ ok: true, jugadores: sala.jugadores.map(({ socketId, ...r }) => r) });
        ack?.({ ok: true, jugadores: sala.jugadores.map(({ socketId, ...r }) => r), config: sala.config });
    });

    socket.on('unirse_sala', async ({ salaId, userId, nombre, foto_perfil }, ack) => {
        const sala = salas.get(salaId);
        if (!sala) return ack?.({ ok: false, error: 'Sala inexistente' });
        if (sala.jugadores.length >= 2) {
            socket.emit('sala_llena');
            return ack?.({ ok: false, error: 'Sala completa' });
        }

        const yaEsta = sala.jugadores.some(j => j.socketId === socket.id);

        // NUEVO: si ya hay alguien con ese userId en la sala, lo actualizamos (reconexión)
        // NOTA: si no manejás userId (ej. invitados), podés usar nombre como fallback.
        const idxMismoUser = userId ? sala.jugadores.findIndex(j => j.userId === userId) : -1;

        if (!yaEsta) {
            // ===== D) ENRIQUECER DESDE BD (opcional) ===== (tu código igual)
            try {
                if (userId) {
                    const u = await User.findByPk(userId);
                    if (u) {
                        nombre = (nombre && String(nombre).trim()) || u.name || u.username || u.email?.split('@')[0] || 'Jugador';
                        foto_perfil = (foto_perfil && String(foto_perfil).trim()) || u.foto_perfil || u.avatar_url || '/uploads/default.png';
                    }
                }
            } catch (e) {
                console.warn('No se pudo enriquecer usuario desde BD:', e?.message);
            }
            // ===== FIN D) =====

            if (idxMismoUser >= 0) {
                // Actualizamos el socketId y datos (reconexión del mismo usuario)
                sala.jugadores[idxMismoUser] = {
                    ...sala.jugadores[idxMismoUser],
                    socketId: socket.id,
                    userId: userId ?? null,
                    nombre: String((nombre && String(nombre).trim()) || sala.jugadores[idxMismoUser].nombre || 'Jugador'),
                    foto_perfil: toAbs(foto_perfil),
                    // esCreador se conserva
                };
            } else {
                const esCreador = sala.jugadores.length === 0;
                sala.jugadores.push({
                    socketId: socket.id,
                    userId: userId ?? null,
                    nombre: String((nombre && String(nombre).trim()) || 'Jugador'),
                    foto_perfil: toAbs(foto_perfil),
                    esCreador,
                });
            }

            socket.join(salaId);
        }

        const payload = { jugadores: sala.jugadores.map(({ socketId, ...r }) => r) };
        io.to(salaId).emit('sala_actualizada', payload);
        //if (sala.jugadores.length === 2) io.to(salaId).emit('listo_para_jugar');
        if (sala.jugadores.length === 2) {
            const kickoffAt = Date.now() + 10_000;
            io.to(salaId).emit('listo_para_jugar', { kickoffAt, config: sala.config });
            programarComienzo(io, salaId, 10_000);
        }

        ack?.({ ok: true });
    });

    socket.on('salir_sala', ({ salaId }) => {
        const sala = salas.get(salaId);
        if (!sala) return;
        sala.jugadores = sala.jugadores.filter(j => j.socketId !== socket.id);
        socket.leave(salaId);

        if (sala.jugadores.length === 0) {
            salas.delete(salaId);
            cancelarComienzoSiCorresponde(salaId);
        } else {
            if (sala.jugadores.length < 2) cancelarComienzoSiCorresponde(salaId);
            io.to(salaId).emit('jugador_se_fue', {
                jugadores: sala.jugadores.map(({ socketId, ...r }) => r),
            });
        }
    });

    socket.on('disconnect', () => {
        for (const [salaId, sala] of salas.entries()) {
            const antes = sala.jugadores.length;
            sala.jugadores = sala.jugadores.filter(j => j.socketId !== socket.id);
            if (antes !== sala.jugadores.length) {
                if (sala.jugadores.length === 0) {
                    salas.delete(salaId);
                    cancelarComienzoSiCorresponde(salaId);
                } else {
                    if (sala.jugadores.length < 2) cancelarComienzoSiCorresponde(salaId);
                    io.to(salaId).emit('jugador_se_fue', {
                        jugadores: sala.jugadores.map(({ socketId, ...r }) => r),
                    });
                }
            }
        }
    });
}
