// server/sockets/sala.controller.js

import {
  Categoria,
  Estadistica,
  Jugador,
  Partida,
  PartidaJugador,
  PartidaPregunta,
  Respuesta,
  Sala,
  SalaJugador,
  User,
} from '../models/associations.js';

import { Op } from 'sequelize';

// Estado en memoria de salas
const salas = new Map();
// idSala -> { jugadores: [{socketId, userId, nombre, foto_perfil, jugador_id, esCreador}], createdAt }

const tablasCreadasPorSala = new Set(); // guarda keys de salas ya procesadas

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
const toAbs = (p) =>
  p && String(p).startsWith('http') ? p : `${PUBLIC_BASE}${p || '/uploads/default.png'}`;

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
                estado: 'esperando',
                created_at: formatearTimestampParaMySQL(datos.timestamp),
              });
              //console.log("Sala creada en la DB para nuevaSala: ", nuevaSala);
              if (nuevaSala) {
                try {
                  let tiempoDificultad = '';
                  if (datos.tiempo === 'facíl' || datos.tiempo === 'easy') {
                    tiempoDificultad = 'facil';
                  } else if (datos.tiempo === 'media' || datos.tiempo === 'medium') {
                    tiempoDificultad = 'normal';
                  } else if (datos.tiempo === 'difícil' || datos.tiempo === 'hard') {
                    tiempoDificultad = 'dificil';
                  } else {
                    tiempoDificultad = datos.tiempo;
                  }

                  let preguntaDificultad = '';
                  if (datos.dificultad === 'facíl' || datos.dificultad === 'easy') {
                    preguntaDificultad = 'facil';
                  } else if (datos.dificultad === 'media' || datos.dificultad === 'medium') {
                    preguntaDificultad = 'normal';
                  } else if (datos.dificultad === 'difícil' || datos.dificultad === 'hard') {
                    preguntaDificultad = 'dificil';
                  } else {
                    preguntaDificultad = datos.dificultad;
                  }

                  const nuevaPartida = await Partida.create({
                    sala_id: nuevaSala.id,
                    categoria_id: objCategoria.id,
                    modo: 'multijugador',
                    total_preguntas: 10,
                    dificultad_tiempo: tiempoDificultad,
                    dificultad_pregunta: preguntaDificultad,
                    estado: 'pendiente',
                    created_at: formatearTimestampParaMySQL(datos.timestamp),
                    started_at: null,
                    ended_at: null,
                  });
                  //console.log("@@@ Sala creada en la DB para nuevaPartida: ", nuevaPartida);

                  // config de la sala creador - IMPORTANTE: NO BORRAR LAS SIGUIENTES 8 ORACIONES DE CODIGO
                  const sala = {
                    jugadores: [],
                    createdAt: Date.now(),
                    config: {
                      categoria: datos.categoria,
                      tiempo: datos.tiempo,
                      dificultad: datos.dificultad,
                      timestamp: formatearTimestampParaMySQL(datos.timestamp),
                      partida_id: nuevaPartida.id,
                      sala_id: nuevaSala.id,
                    },
                  };
                  salas.set(idPartida, sala);

                  // envia el socket con success del primer try
                  ack?.({ success: true, idPartida }); // idPartida es el codigo de sala
                } catch (err) {
                  console.error('Error al crear obj nuevaPartida en sala en la DB: ', err);
                }
              } // fin segundo if
            } catch (dbError) {
              console.error('Error al crear sala en la DB: ', dbError);
              // Opcional: puedes decidir cómo manejar este error específico de DB
            }
          } // fin primer if
        } catch (dbError) {
          console.error('Error al crear sala en la DB: ', dbError);
        }
      })(); // fin funcion anonima
    } catch {
      ack?.({ success: false, error: 'No se pudo crear la sala' });
    }
  });

  socket.on('obtener_sala', ({ salaId }, ack) => {
    const sala = salas.get(salaId);
    if (!sala) return ack?.({ ok: false, error: 'Sala inexistente' });
    ack?.({
      ok: true,
      jugadores: sala.jugadores.map(({ socketId, ...r }) => r),
      config: sala.config,
    });
  });

  socket.on('unirse_sala', async ({ salaId, userId, nombre, foto_perfil, jugador_id }, ack) => {
    const sala = salas.get(salaId) || salas.get(String(salaId)) || salas.get(Number(salaId));
    const toAbs = (p) => (typeof p === 'string' ? p : `/uploads/default.png`);
    const norm = (s) => (s || '').toString().trim().toLowerCase();

    if (!sala) return ack?.({ ok: false, error: 'Sala inexistente' });

    // ¿ya hay dos? -> sólo permitir reconexión del mismo user, si no: sala_llena
    if (sala.jugadores.length >= 2) {
      // Intento de reconexión: ¿coincide con alguno?
      const idx = sala.jugadores.findIndex(
        (j) =>
          (userId != null && j.userId != null && j.userId === userId) ||
          (jugador_id != null && j.jugador_id != null && j.jugador_id === jugador_id) ||
          (norm(nombre) && norm(j.nombre) && norm(nombre) === norm(j.nombre))
      );

      if (idx === -1) {
        socket.emit('sala_llena');
        return ack?.({ ok: false, error: 'Sala completa' });
      }

      // Es reconexión del mismo jugador: sólo actualizar socketId y datos visibles
      try {
        if (userId) {
          const u = await User.findByPk(userId);
          if (u) {
            nombre =
              (nombre && String(nombre).trim()) ||
              u.name ||
              u.username ||
              u.email?.split('@')[0] ||
              'Jugador';
            foto_perfil =
              (foto_perfil && String(foto_perfil).trim()) ||
              u.foto_perfil ||
              u.avatar_url ||
              '/uploads/default.png';
          }
        }
      } catch (e) {
        console.warn('No se pudo enriquecer usuario desde BD:', e?.message);
      }

      sala.jugadores[idx] = {
        ...sala.jugadores[idx],
        socketId: socket.id,
        userId: userId ?? sala.jugadores[idx].userId ?? null,
        nombre: String(
          (nombre && String(nombre).trim()) || sala.jugadores[idx].nombre || 'Jugador'
        ),
        foto_perfil: toAbs(foto_perfil || sala.jugadores[idx].foto_perfil),
        jugador_id: jugador_id ?? sala.jugadores[idx].jugador_id ?? null,
        // esCreador se conserva
      };

      socket.join(salaId);

      //console.log("sala.jugadores: ", sala.jugadores);

      const payload = { jugadores: sala.jugadores.map(({ socketId, ...r }) => r) };
      io.to(salaId).emit('sala_actualizada', payload);
      // si ya estaban 2, no toquemos countdown (ya lo habrá disparado el primer join).
      return ack?.({ ok: true, reconectado: true });
    }

    // Hay lugar (0 o 1 jugador): ingreso normal
    const yaEsta = sala.jugadores.some((j) => j.socketId === socket.id);
    if (!yaEsta) {
      // Enriquecer desde BD (opcional)
      try {
        if (userId) {
          const u = await User.findByPk(userId);
          if (u) {
            nombre =
              (nombre && String(nombre).trim()) ||
              u.name ||
              u.username ||
              u.email?.split('@')[0] ||
              'Jugador';
            foto_perfil =
              (foto_perfil && String(foto_perfil).trim()) ||
              u.foto_perfil ||
              u.avatar_url ||
              '/uploads/default.png';
          }
        }
      } catch (e) {
        console.warn('No se pudo enriquecer usuario desde BD:', e?.message);
      }

      const esCreador = sala.jugadores.length === 0;
      sala.jugadores.push({
        socketId: socket.id,
        userId: userId || null,
        nombre: String(
          (nombre && String(nombre).trim()) || (esCreador ? 'Jugador 1' : 'Jugador 2')
        ),
        foto_perfil: toAbs(foto_perfil),
        jugador_id: jugador_id || null,
        esCreador,
      });

      socket.join(salaId);

      // Registrar en DB solo cuando INGRESA (no en reconexión)
      (async () => {
        try {
          const sala_jugador = await SalaJugador.create({
            sala_id: sala.config.sala_id,
            jugador_id: jugador_id ?? null,
            joined_at: formatearTimestampParaMySQL(Date.now()),
          });
          //console.log("sala_jugador: ", sala_jugador, "jugador_id: ", jugador_id);
        } catch (error) {
          console.error('Error al crear sala_jugadores en la DB: ', error);
        }
      })();
    }

    const payload = { jugadores: sala.jugadores.map(({ socketId, ...r }) => r) };
    io.to(salaId).emit('sala_actualizada', payload);

    // Si ahora hay 2, arrancamos countdown una sola vez
    if (sala.jugadores.length === 2) {
      const kickoffAt = Date.now() + 10_000;
      io.to(salaId).emit('listo_para_jugar', { kickoffAt, config: sala.config });
      programarComienzo(io, salaId, 10_000);
    }
    //console.log("ultimo sala.jugadores: ", sala.jugadores);
    return ack?.({ ok: true });
  });

  socket.on('crear_tablas_faltantes', (datos, ack) => {
    // clave única por sala (podés reforzarla con partida_id si querés)
    const salaKey = String(datos?.salaId ?? '');
    const partidaKey = String(datos?.config?.partida_id ?? '');
    const key = `${salaKey}::${partidaKey}`;

    // si ya se procesó, ignoramos el duplicado
    if (tablasCreadasPorSala.has(key)) {
      return ack?.({ success: true, msg: 'Duplicado ignorado (ya procesado)' });
    }

    // marcamos como procesado antes de ejecutar la lógica para evitar condiciones de carrera
    tablasCreadasPorSala.add(key);

    //console.log("############ -> crear_tablas_faltantes de datos: ", datos);

    // TODO: acá va tu lógica real de creación de tablas/rows necesarias

    (async () => {
      try {
        const { config, jugadores = [], partida_preguntas_tabla = [] } = datos || {};
        const partidaId = Number(config?.partida_id);

        if (!partidaId || jugadores.length === 0) {
          return ack?.({ success: false, msg: 'Faltan datos: partida_id o jugadores.' });
        }

        // 1) Tomo jugador_id válidos y únicos
        const jugadorIds = Array.from(
          new Set(jugadores.map((j) => Number(j?.jugador_id)).filter((n) => Number.isFinite(n)))
        );
        if (jugadorIds.length === 0) {
          return ack?.({ success: false, msg: 'No hay jugador_id válidos.' });
        }

        // 2) Creo PartidaJugador + Estadistica para cada jugador (en paralelo)
        await Promise.all(
          jugadorIds.map(async (jugadorId) => {
            await PartidaJugador.create({ partida_id: partidaId, jugador_id: jugadorId });
            await Estadistica.create({ jugador_id: jugadorId, partida_id: partidaId, posicion: 0 });
          })
        );

        // 3) Inserto las 10 filas de PartidaPregunta (mapeando propiedades correctas)
        //    Si querés evitar duplicados, podés usar bulkCreate con ignoreDuplicates.
        const filasPP = (partida_preguntas_tabla || [])
          .map((pp) => ({
            partida_id: Number(pp?.partida_id) || partidaId,
            pregunta_id: Number(pp?.pregunta_id) || null,
            orden: Number(pp?.orden) || null,
            question_text_copy: String(pp?.question_text_copy ?? ''),
            question_text_copy_en: String(pp?.question_text_copy_en ?? ''),
            correct_option_id_copy:
              pp?.correct_option_id_copy != null ? Number(pp.correct_option_id_copy) : null,
            correct_option_text_copy: String(pp?.correct_option_text_copy ?? ''),
            correct_option_text_copy_en: String(pp?.correct_option_text_copy_en ?? ''),
          }))
          .filter((r) => Number.isFinite(r.pregunta_id) && Number.isFinite(r.orden));

        if (filasPP.length === 0) {
          return ack?.({ success: false, msg: 'partida_preguntas_tabla vacío o inválido.' });
        }

        // Opción A: create uno por uno
        // for (const row of filasPP) {
        //   await PartidaPregunta.create(row);
        // }

        // Opción B (recomendada): bulkCreate
        await PartidaPregunta.bulkCreate(filasPP, {
          validate: true,
          // ignoreDuplicates: true, // si tenés unique(partida_id, pregunta_id) y querés saltar duplicados
        });

        const endedAtLocal = (() => {
          const MS_3HS = 3 * 60 * 60 * 1000;
          const fecha = new Date(Date.now() - MS_3HS);
          const pad = (n) => String(n).padStart(2, '0');
          const y = fecha.getFullYear();
          const m = pad(fecha.getMonth() + 1);
          const d = pad(fecha.getDate());
          const H = pad(fecha.getHours());
          const M = pad(fecha.getMinutes());
          const S = pad(fecha.getSeconds());
          return `${y}-${m}-${d} ${H}:${M}:${S}`;
        })();

        const modPartid = await Partida.findOne({
          where: { id: partidaId },
        });
        if (modPartid) {
          const started_at = endedAtLocal;
          await modPartid.update({ started_at });
        }

        return ack?.({
          success: true,
          msg: 'Salió bien',
          jugadores_creados: jugadorIds.length,
          preguntas_insertadas: filasPP.length,
        });
      } catch (e) {
        console.error('Error en crear_tablas_faltantes:', e);
        return ack?.({ success: false, msg: 'Error en servidor', error: String(e?.message || e) });
      }
    })();
  });

  socket.on('salir_sala', ({ salaId }) => {
    const sala = salas.get(salaId);
    if (!sala) return;
    sala.jugadores = sala.jugadores.filter((j) => j.socketId !== socket.id);
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
      sala.jugadores = sala.jugadores.filter((j) => j.socketId !== socket.id);
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

  // === NUEVO: rebroadcast de respuestas dentro de la sala ===
  // El cliente emite: sala:respuesta { salaId, userId, nombre, indice, respuesta }
  socket.on('sala:respuesta', ({ salaId, userId, nombre, indice, respuesta }) => {
    // Normalizamos la clave por si viene numérica o string
    const sala = salas.get(salaId) || salas.get(String(salaId)) || salas.get(Number(salaId));
    if (!sala) {
      // Sala no existe: ignoramos silenciosamente (también podrías ack con error si quisieras)
      return;
    }

    //console.log("@@@@@@@@@@{ salaId, userId, nombre, indice, respuesta }: ", { salaId, userId, nombre, indice, respuesta });

    // Validaciones mínimas
    if (typeof indice !== 'number' || !respuesta) return;

    // Re-emitimos a todos los sockets de la sala (incluye a quien respondió)
    io.to(salaId).emit('sala:respuesta', {
      userId: userId ?? null,
      nombre: (nombre && String(nombre)) || 'Jugador',
      indice, // índice de la pregunta
      respuesta, // { texto, es_correcta, tiempo_respuesta_ms, ... }
    });
  });

  socket.on('jugador_termino', ({ salaId, jugador_id }, ack) => {
    try {
      const sala =
        salas.get(salaId) || salas.get(String(salaId)) || salas.get(Number(salaId));

      if (!sala) {
        return ack?.({ ok: false, error: 'Sala inexistente' });
      }

      const jugIdNum = Number(jugador_id);
      if (!Number.isFinite(jugIdNum)) {
        return ack?.({ ok: false, error: 'jugador_id inválido' });
      }

      // Inicializo el set de terminados si no existe
      if (!sala.terminados) {
        sala.terminados = new Set();
      }

      sala.terminados.add(jugIdNum);

      const totalJugadores = (sala.jugadores || []).length;
      const terminadosCount = sala.terminados.size;

      const esUltimo = terminadosCount >= totalJugadores && totalJugadores > 0;

      // Podrías limpiar el set si querés reusar la sala luego
      // if (esUltimo) sala.terminados.clear();

      return ack?.({ ok: true, esUltimo });
    } catch (e) {
      console.error('Error en jugador_termino:', e);
      return ack?.({ ok: false, error: 'Error en servidor' });
    }
  });


  socket.on('guardar_respuestas', async (datos, ack) => {
    try {
      const {
        partida_id,
        respuestas = [],
        resumen = null, // { jugadores: [...], ganador_jugador_id, ended_at }
        dificultad,
        tiempo,
      } = datos || {};

      const partidaId = Number(partida_id);
      if (!Number.isFinite(partidaId) || !Array.isArray(respuestas) || respuestas.length === 0) {
        return ack?.({ success: false, msg: 'Payload inválido (partida_id o respuestas).' });
      }

      // 1) Cargo todas las Estadisticas de la partida y mapeo por jugador_id
      const ests = await Estadistica.findAll({ where: { partida_id: partidaId } });
      const estByJugadorId = new Map(ests.map((e) => [Number(e.jugador_id), Number(e.id)]));

      // 2) Cargo PartidaPregunta de la partida y mapeo por pregunta_id
      const pps = await PartidaPregunta.findAll({ where: { partida_id: partidaId } });
      const ppIdByPreguntaId = new Map(pps.map((pp) => [Number(pp.pregunta_id), Number(pp.id)]));

      // 3) Armo filas a insertar
      const filas = [];
      for (const r of respuestas) {
        const jugadorId = Number(r?.jugador_id);
        const preguntaId = Number(r?.pregunta_id);
        const opcionElegidaId = r?.opcion_elegida_id == null ? null : Number(r.opcion_elegida_id);
        const esCorrecta = r?.es_correcta ? 1 : 0;
        const tms = r?.tiempo_respuesta_ms == null ? null : Number(r.tiempo_respuesta_ms);

        if (!Number.isFinite(jugadorId) || !Number.isFinite(preguntaId)) continue;

        // estadistica_id: uso el que vino o busco por (partida, jugador)
        let estadisticaId = r?.estadistica_id != null ? Number(r.estadistica_id) : null;
        if (!Number.isFinite(estadisticaId)) {
          estadisticaId = estByJugadorId.get(jugadorId) ?? null;
        }

        // partida_pregunta_id: uso el que vino o busco por (partida, pregunta)
        let partidaPreguntaId =
          r?.partida_pregunta_id != null ? Number(r.partida_pregunta_id) : null;
        if (!Number.isFinite(partidaPreguntaId)) {
          partidaPreguntaId = ppIdByPreguntaId.get(preguntaId) ?? null;
        }

        filas.push({
          partida_id: partidaId,
          jugador_id: jugadorId,
          pregunta_id: preguntaId,
          partida_pregunta_id: partidaPreguntaId, // puede quedar null si no existe
          opcion_elegida_id: opcionElegidaId, // null si “Sin respuesta”
          estadistica_id: estadisticaId, // null si no hay
          es_correcta: esCorrecta, // 1/0
          tiempo_respuesta_ms: tms, // null permitido
        });
      }

      if (filas.length === 0) {
        return ack?.({ success: false, msg: 'No hay filas válidas para insertar.' });
      }

      // 1) (opcional) quito duplicados dentro del MISMO payload
      const seen = new Set();
      const filasUnicas = [];
      for (const f of filas) {
        const k = `${f.partida_id}-${f.jugador_id}-${f.pregunta_id}`;
        if (seen.has(k)) continue;
        seen.add(k);
        filasUnicas.push(f);
      }

      // 2) Upsert masivo
      await Respuesta.bulkCreate(filasUnicas, {
        updateOnDuplicate: [
          'opcion_elegida_id',
          'es_correcta',
          'tiempo_respuesta_ms',
          'partida_pregunta_id',
          'estadistica_id',
        ],
      });

      // --- RESUMEN / GANADOR / ENDED_AT (TODO SE RECALCULA EN EL SERVER) ---

      // ended_at: usamos el que vino o lo calculamos
      let ended_at = resumen?.ended_at || formatearTimestampParaMySQL(Date.now());

      // ⚠️ NO confiamos en resumen.ganador_jugador_id del cliente
      let ganador_jugador_id = null;

      // === misma lógica de puntaje que en el FRONT ===
      function calcularPuntajeServidor(respuestasCor, tiempoStr, dificultadStr) {
        if (!respuestasCor || respuestasCor.length === 0) return 0;

        let multiplicador = 1;
        const diff = String(tiempoStr || '').toLowerCase();
        if (diff.includes('facil') || diff.includes('facíl') || diff.includes('easy')) multiplicador = 1;
        if (
          diff.includes('media') ||
          diff.includes('medium') ||
          diff.includes('normal')
        )
          multiplicador = 1.3;
        if (diff.includes('dificil') || diff.includes('difícil') || diff.includes('hard'))
          multiplicador = 1.6;

        let puntos = 0;
        respuestasCor.forEach((respuesta) => {
          const tSeg = respuesta.tiempo; // en segundos
          if (tSeg <= 3) puntos += 10;
          else if (tSeg <= 5) puntos += 7;
          else if (tSeg <= 8) puntos += 5;
          else if (tSeg <= 12) puntos += 3;
          else puntos += 1;
        });

        const dificult = String(dificultadStr || '').toLowerCase();
        let puntosDificultad = 0;
        if (dificult.includes('facíl') || dificult.includes('facil') || dificult.includes('easy'))
          puntosDificultad = 5 * respuestasCor.length;
        if (dificult.includes('media') || dificult.includes('medium') || dificult.includes('normal'))
          puntosDificultad = 10 * respuestasCor.length;
        if (dificult.includes('dificíl') || dificult.includes('dificil') || dificult.includes('hard'))
          puntosDificultad = 15 * respuestasCor.length;

        return Math.round((puntos + puntosDificultad) * multiplicador);
      }

      // 1) Agrupo respuestas por jugador
      const byJugador = new Map();
      for (const r of respuestas) {
        const j = Number(r.jugador_id);
        if (!Number.isFinite(j)) continue;
        if (!byJugador.has(j)) byJugador.set(j, []);
        byJugador.get(j).push(r);
      }

      // 2) Calculo stats por jugador (total_correctas, tiempos, puntaje_total)
      const statsMap = new Map();

      for (const [jugId, arr] of byJugador.entries()) {
        const total_correctas = arr.reduce((a, x) => a + (x.es_correcta ? 1 : 0), 0);
        const total_incorrectas = arr.length - total_correctas;

        const tiemposMs = arr.map((x) =>
          Number.isFinite(Number(x.tiempo_respuesta_ms)) ? Number(x.tiempo_respuesta_ms) : 0
        );
        const total_tiempo_ms = tiemposMs.reduce((a, b) => a + b, 0);

        const tiemposCorrectasMs = arr
          .filter((x) => x.es_correcta)
          .map((x) => Number(x.tiempo_respuesta_ms) || 0);
        const total_tiempo_correctas_ms = tiemposCorrectasMs.reduce((a, b) => a + b, 0);

        const respuestasCor = tiemposCorrectasMs.map((ms) => ({
          tiempo: Math.round(ms / 1000),
        }));

        const puntaje_total = calcularPuntajeServidor(
          respuestasCor,
          String(tiempo || ''),
          String(dificultad || '')
        );

        statsMap.set(jugId, {
          jugador_id: jugId,
          total_correctas,
          total_incorrectas,
          total_tiempo_correctas_ms,
          total_tiempo_ms,
          puntaje_total,
        });
      }

      // 3) Decidir GANADOR (NUNCA más empate si uno tiene 10 y el otro 2)
      const ids = [...statsMap.keys()];
      if (ids.length === 2) {
        const aId = ids[0];
        const bId = ids[1];
        const a = statsMap.get(aId);
        const b = statsMap.get(bId);

        if (a.total_correctas > b.total_correctas) {
          ganador_jugador_id = aId;
        } else if (b.total_correctas > a.total_correctas) {
          ganador_jugador_id = bId;
        } else {
          // mismo número de correctas → desempate por tiempo en correctas
          if (a.total_tiempo_correctas_ms < b.total_tiempo_correctas_ms) {
            ganador_jugador_id = aId;
          } else if (b.total_tiempo_correctas_ms < a.total_tiempo_correctas_ms) {
            ganador_jugador_id = bId;
          } else {
            ganador_jugador_id = null; // empate REAL (mismas correctas y mismo tiempo)
          }
        }
      }

      // 1) Actualizar Partida (ended_at y estado)
      try {
        await Partida.update({ ended_at, estado: 'finalizada' }, { where: { id: partidaId } });
      } catch (e) {
        console.warn('No se pudo actualizar Partida.ended_at:', e?.message);
      }

      // 2) Actualizar Estadistica por jugador (totales, puntaje con BONUS, posición)
      const BONUS_GANADOR = 1000;
      const BONUS_PERDEDOR = 500;
      const BONUS_EMPATE = 250;

      const jugadoresConPuntaje = [];

      for (const [jugadorId, st] of statsMap.entries()) {
        const esEmpate = ganador_jugador_id == null;
        const esGanador = !esEmpate && jugadorId === ganador_jugador_id;

        let bonus = 0;
        let posicion = 1;

        if (esEmpate) {
          bonus = BONUS_EMPATE;
          posicion = 1;
        } else {
          if (esGanador) {
            bonus = BONUS_GANADOR;
            posicion = 1;
          } else {
            bonus = BONUS_PERDEDOR;
            posicion = 0; // perdedor = 0
          }
        }

        const puntaje_total_final = (Number(st.puntaje_total) || 0) + bonus;

        try {
          await Estadistica.update(
            {
              total_correctas: st.total_correctas,
              total_incorrectas: st.total_incorrectas,
              puntaje_total: puntaje_total_final,
              posicion,
              tiempo_total_ms: st.total_tiempo_ms,
            },
            { where: { partida_id: partidaId, jugador_id: jugadorId } }
          );
        } catch (e) {
          console.warn('No se pudo actualizar Estadistica:', e?.message);
        }

        // 👇 acá va el Jugador.update corregido
        try {
          const jug = await Jugador.findByPk(jugadorId);
          if (jug) {
            const actual = Number(jug.puntaje) || 0;
            await jug.update({ puntaje: actual + puntaje_total_final });
          }
        } catch (e) {
          console.warn('No se pudo actualizar Jugador.puntaje:', e?.message);
        }

        jugadoresConPuntaje.push({
          jugador_id: jugadorId,
          total_correctas: st.total_correctas,
          total_incorrectas: st.total_incorrectas,
          total_tiempo_correctas_ms: st.total_tiempo_correctas_ms,
          total_tiempo_ms: st.total_tiempo_ms,
          puntaje_total: puntaje_total_final,
          posicion,
        });
      }

      // --- EMITIR A LA SALA EL RESUMEN FINAL CON PUNTAJES ---
      try {
        const salaId = datos?.salaId;
        if (salaId != null) {
          const sala =
            salas.get(salaId) || salas.get(String(salaId)) || salas.get(Number(salaId));

          let payloadResumen = {
            partida_id: partidaId,
            dificultad,
            tiempo,
            resumen: {
              jugadores: [],
              ganador_jugador_id,
              ended_at,
            },
          };

          if (sala && Array.isArray(sala.jugadores)) {
            const jugadoresSala = sala.jugadores.map((j) => {
              const stats = jugadoresConPuntaje.find(
                (st) => Number(st.jugador_id) === Number(j.jugador_id)
              );

              return {
                jugador_id: Number(j.jugador_id),
                nombre: j.nombre,
                foto_perfil: j.foto_perfil,
                ...(stats || {
                  total_correctas: 0,
                  total_incorrectas: 0,
                  total_tiempo_correctas_ms: 0,
                  total_tiempo_ms: 0,
                  puntaje_total: 0,
                  posicion: 0,
                }),
              };
            });

            payloadResumen.resumen.jugadores = jugadoresSala;
          }

          io.to(String(salaId)).emit('sala:fin_partida', payloadResumen);
        }
      } catch (e) {
        console.warn('No se pudo emitir sala:fin_partida:', e?.message);
      }

      return ack?.({
        success: true,
        msg: 'Respuestas guardadas y estadísticas actualizadas',
        ganador_jugador_id,
        ended_at,
      });
    } catch (e) {
      console.error('guardar_respuestas error:', e);
      return ack?.({ success: false, msg: 'Error en servidor', error: String(e?.message || e) });
    }
  });

}
