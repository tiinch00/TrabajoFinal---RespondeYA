// server/sockets/sala.controller.js

import { Categoria, Jugador, Partida, Sala, SalaJugador } from '../models/associations.js'

import { DATE } from 'sequelize';
import { User } from '../models/associations.js';

// Estado en memoria de salas
const salas = new Map();
// idSala -> { jugadores: [{socketId, userId, nombre, foto_perfil, jugador_id, esCreador}], createdAt }

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
    const MS_3HS = 3 * 60 * 60 * 1000;
    const fecha = new Date(Number(timestampEnMilisegundos) - MS_3HS);

    // Usamos métodos para construir el string en formato 'YYYY-MM-DD HH:MM:SS'
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
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
            const jugador_id = Number(datos.jugador_id);
            const id = Number(datos.user_id);

            /*
            console.log({ idJugador: typeof datos.jugador_id });
            console.log({ idUser: typeof datos.user_id })
            console.log({ jugador_id: typeof jugador_id });
            console.log({ user_id: typeof id })
            console.log("socket crear_partida, datos: ", datos);            
            console.log("socket crear_partida, datos.timestamp: ", formatearTimestampParaMySQL(datos.timestamp));
            */

            const idPartida = crearIdSala();

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
                                created_at: formatearTimestampParaMySQL(datos.timestamp)
                            });
                            //console.log("Sala creada en la DB para nuevaSala: ", nuevaSala);
                            if (nuevaSala) {
                                // 3) se crea el obj sala_jugadores para jugador - creador
                                try {
                                    const nuevaSala_jugadores = await SalaJugador.create({
                                        sala_id: nuevaSala.id,
                                        jugador_id: jugador_id,
                                        joined_at: formatearTimestampParaMySQL(datos.timestamp)
                                    });
                                    // 4) se crea el obj Partida
                                    if (nuevaSala_jugadores) {
                                        try {
                                            const nuevaPartida = await Partida.create({
                                                sala_id: nuevaSala.id,
                                                categoria_id: objCategoria.id,
                                                modo: "multijugador",
                                                total_preguntas: 10,
                                                estado: "pendiente",
                                                created_at: formatearTimestampParaMySQL(datos.timestamp),
                                                started_at: null,
                                                ended_at: null
                                            });
                                            //console.log("@@@ Sala creada en la DB para nuevaPartida: ", nuevaPartida);

                                            // config de la sala creador - IMPORTANTE: NO BORRAR LAS SIGUIENTES 8 ORACIONES DE CODIGO                                            
                                            const sala = {
                                                jugadores: [], createdAt: Date.now(), config: {
                                                    categoria: datos.categoria,
                                                    dificultad: datos.dificultad,
                                                    tiempo: formatearTimestampParaMySQL(datos.timestamp),
                                                    partida_id: nuevaPartida.id,
                                                    sala_id: nuevaSala.id,
                                                }
                                            };
                                            salas.set(idPartida, sala);

                                            // envia el socket con success del primer try
                                            ack?.({ success: true, idPartida }); // idPartida es el codigo de sala
                                        } catch (err) {
                                            console.error("Error al crear obj nuevaPartida en sala en la DB: ", err);
                                        }
                                    }  // fin tercer if
                                } catch (err) {
                                    console.error("Error al crear obj nuevaPartida en sala en la DB: ", err);
                                }
                            } // fin segundo if
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

    socket.on('unirse_sala', async ({ salaId, userId, nombre, foto_perfil, jugador_id }, ack) => {
        const sala = salas.get(salaId);
        if (!sala) return ack?.({ ok: false, error: 'Sala inexistente' });
        if (sala.jugadores.length > 2) { // >=
            socket.emit('sala_llena');
            return ack?.({ ok: false, error: 'Sala completa' });
        }

        //console.log("jugador_id: ", jugador_id);
        //console.log({ jugador_id: typeof jugador_id });

        const yaEsta = sala.jugadores.some(j => j.socketId === socket.id);

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

            //console.log("sala: ", sala);            
            //console.log("sala.jugadores: ", sala.jugadores);
            if (sala.jugadores.length > 1 && sala.jugadores.length < 3) {
                // Actualizamos el socketId y datos (reconexión del mismo usuario)
                sala.jugadores[1] = {
                    ...sala.jugadores[1],
                    socketId: socket.id,
                    userId: userId || null,
                    nombre: String((nombre && String(nombre).trim()) || 'Jugador 2'),
                    foto_perfil: toAbs(foto_perfil),
                    jugador_id: jugador_id || null,
                    // esCreador se conserva
                };
            } else {
                const esCreador = sala.jugadores.length === 0;
                sala.jugadores.push({
                    socketId: socket.id,
                    userId: userId || null,
                    nombre: String((nombre && String(nombre).trim()) || 'Jugador 1'),
                    foto_perfil: toAbs(foto_perfil),
                    jugador_id: jugador_id || null,
                    esCreador,
                });
            }

            socket.join(salaId);
        }

        //console.log("jugadores: sala.jugadores: ", sala.jugadores);


        if (sala.jugadores.length === 2) {
            (async () => {
                try {
                    const nuevaSala_jugadores = await SalaJugador.create({
                        sala_id: sala.config.sala_id,
                        jugador_id: jugador_id,
                        joined_at: formatearTimestampParaMySQL(Date.now())
                    });

                    console.log("@@@ se pudo, nuevaSala_jugadores: ", nuevaSala_jugadores);
                } catch (error) {
                    console.error("Error al crear sala_jugadores en la DB: ", error);
                }
            })(); // fin funcion anonima
        }

        const payload = { jugadores: sala.jugadores.map(({ socketId, ...r }) => r) };
        io.to(salaId).emit('sala_actualizada', payload);
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
