import { Estadistica, Jugador, User } from '../models/associations.js';

const index = async (req, res) => {
  try {
    const jugadores = await Jugador.findAll();
    res.json(jugadores);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error findAll()');
  }
};

const show = async (req, res) => {
  const { jugador_id } = req.params;
  //console.log(jugador_id);
  try {
    const jugador = await Jugador.findByPk(jugador_id);

    if (!jugador) return res.status(404).json({ error: 'Jugador not found' });
    //console.log(jugador);
    res.json(jugador);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error findByPk(id)');
  }
};
const showUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const jugador = await Jugador.findOne({
      where: { user_id },
    });

    if (!jugador) {
      return res.status(404).json({ error: 'Jugador not found' });
    }

    res.json(jugador);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error findOne(user_id)');
  }
};

const store = async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  try {
    const user = await User.findByPk(user_id);
    // si no existe el usuario, se envia un error a la consola
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const jugador = await Jugador.create({ user_id });
    res.status(201).json(jugador);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'user_id already exists' });
    }
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const update = async (req, res) => {
  try {
    // verificacion si es null o no una variable de tipo INT
    const toNullableNumber = (v) => {
      if (v == null || v === '') return null; // trata undefined, null y '' como null
      const n = Number(v);
      return Number.isNaN(n) ? null : n; // si no es número válido → null
    };

    // parseo seguro
    const jugador_id = Number(req.params.jugador_id); // de params
    const puntosGanados = toNullableNumber(Number(req.body.puntaje)); // del body
    const puntosRestados = toNullableNumber(Number(req.body.puntajeRestado)); // del body
    const ruleta_started_at = req.body.ruleta_started_at; // del body

    // validaciones
    if (!Number.isFinite(jugador_id) && !(jugador_id > 0)) {
      return res.status(400).json({ error: 'jugador_id inválido' });
    }

    /*if (!Number.isFinite(puntosGanados) || puntosGanados < 0) {
      return res.status(400).json({ error: 'puntosGanados inválido' });
    }

    if (!Number.isFinite(puntosRestados) || puntosRestados < 0) {
      return res.status(400).json({ error: 'puntosRestados inválido' });
    }*/

    const jugador = await Jugador.findByPk(jugador_id);
    if (!jugador) {
      return res.status(404).send('Jugador not found');
    }

    if (puntosGanados !== null && puntosGanados !== undefined) {
      const puntaje = puntosGanados;
      //console.log("PuntosGanados: ", puntosGanados);
      //console.log("PuntosGanados de jugador.puntaje: ", jugador.puntaje);
      await jugador.update({ puntaje: puntaje });
    } else {
      if (puntosRestados !== null && puntosRestados !== undefined) {
        const puntaje = jugador.puntaje - puntosRestados;
        //console.log("puntosRestados: ", puntosRestados);
        //console.log("puntosRestados de jugador.puntaje: ", jugador.puntaje);
        await jugador.update({ puntaje: puntaje });
      }
    }

    if (ruleta_started_at !== undefined && ruleta_started_at !== null) {
      if (typeof ruleta_started_at === 'string') {
        await jugador.update({ ruleta_started_at });
      } else {
        return res.status(400).json({ error: 'ruleta_started_at inválido (no es un string)' });
      }
    }

    await jugador.reload();
    res.json(jugador);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'jugador_id already exists' });
    }
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const updatePuntajeEstadisticas = async (req, res) => {
  const toNullableNumber = (v) => {
    if (v == null || v === '') return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  try {
    const jugador_id = Number(req.params.jugador_id);
    const puntosObtenidos = toNullableNumber(req.body.puntaje);
    const partida_id = toNullableNumber(req.body.partida_id);

    // console.log("jugador_id: ", jugador_id);
    // console.log("puntosObtenidos: ", puntosObtenidos);
    // console.log("partida_id: ", partida_id);

    if (!Number.isFinite(jugador_id)) {
      return res.status(400).json({ error: 'jugador_id inválido' });
    }

    if (puntosObtenidos === null || partida_id === null) {
      return res.status(400).json({ error: 'puntaje o partida_id inválidos' });
    }

    const estadistica = await Estadistica.findOne({
      where: { partida_id, jugador_id },
    });

    if (!estadistica) {
      return res.status(404).json({ error: 'Estadistica no encontrada' });
    }

    // actualizar puntaje_total en Estadistica
    await estadistica.update({ puntaje_total: puntosObtenidos });
    // console.log("jugador.controller.js estdistica:", estadistica);

    // actualizar puntaje en Jugador
    const jugador = await Jugador.findByPk(jugador_id);
    if (!jugador) {
      return res.status(404).send('Jugador not found');
    }
    // console.log("jugador.controller.js jugador:", jugador);
    const nuevoPuntaje = Number(jugador.puntaje || 0) + puntosObtenidos;
    await jugador.update({ puntaje: nuevoPuntaje });
    // console.log("jugador.controller.js jugadorActualizado:", jugador);
    return res.json({ jugador, estadistica, success: 'ok' });
  } catch (e) {
    console.warn('No se pudo actualizar en updatePuntajeEstadisticas:', e?.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const destroy = async (req, res) => {
  const { jugador_id } = req.params;
  try {
    const jugador = await Jugador.findByPk(jugador_id);
    if (!jugador) {
      return res.status(404).send('User not found');
    }

    await jugador.destroy();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

export default {
  index,
  show,
  showUser,
  store,
  update,
  updatePuntajeEstadisticas,
  destroy,
};
