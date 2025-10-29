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
    // parseo seguro
    const jugador_id = Number(req.params.jugador_id);         // de params
    const puntosGanados = Number(req.body.puntosGanados);     // del body
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

    if (!Number.isFinite(puntosGanados) || puntosGanados < 0) {
      return res.status(400).json({ error: 'puntosGanados inválido' });
    }

    const jugador = await Jugador.findByPk(jugador_id);
    if (!jugador) {
      return res.status(404).send('Jugador not found');
    }

    const puntaje = (jugador.puntaje + puntosGanados);
    await jugador.update({ puntaje });
    
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
