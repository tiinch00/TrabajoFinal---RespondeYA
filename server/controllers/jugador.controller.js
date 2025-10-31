import { Jugador, User } from '../models/associations.js';

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
      if (v == null || v === '') return null;     // trata undefined, null y '' como null
      const n = Number(v);
      return Number.isNaN(n) ? null : n;          // si no es número válido → null
    };
    
    // parseo seguro
    const jugador_id = Number(req.params.jugador_id);         // de params
    const puntosGanados = toNullableNumber(Number(req.body.puntaje));     // del body
    const puntosRestados = toNullableNumber(Number(req.body.puntajeRestado));     // del body
    const ruleta_started_at = req.body.ruleta_started_at;     // del body

    //console.log("jugador_id:", jugador_id);
    //console.log("puntaje:", puntaje);
    //console.log({ t1: typeof req.body.ruleta_started_at });

    // Debug opcional para ver tipos/valores
    // console.log({ jugador_id, puntaje, t1: typeof req.params.jugador_id, t2: typeof req.body?.puntaje });  

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
      const puntaje = (jugador.puntaje + puntosGanados);
      //console.log("PuntosGanados: ", puntosGanados);
      //console.log("PuntosGanados de jugador.puntaje: ", jugador.puntaje);
      await jugador.update({ puntaje });
    } else {
      if (puntosRestados !== null && puntosRestados !== undefined){
      const puntaje = (jugador.puntaje - puntosRestados);
      //console.log("puntosRestados: ", puntosRestados);
      //console.log("puntosRestados de jugador.puntaje: ", jugador.puntaje);
      await jugador.update({ puntaje });
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
  store,
  update,
  destroy,
};
