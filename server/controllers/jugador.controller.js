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

const updateByUserId = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);
    const puntaje = Number(req.body?.puntaje ?? NaN);

    const jugador = await Jugador.findOne({ where: { user_id } });
    if (!jugador) {
      return res.status(404).json({ error: 'Jugador no encontrado para ese user_id' });
    }

    // Estrategia A: ACUMULAR
    await jugador.increment({ puntaje });
    await jugador.reload();

    // (Si quisieras reemplazar, usa:  ...)
    //const usuario = await jugador.update({ puntaje });

    //console.log(usuario);

    return res.json({
      ok: true,
      jugador: {
        jugador_id: jugador.jugador_id,
        user_id: jugador.user_id,
        puntaje: jugador.puntaje,
      },
    });
  } catch (err) {
    console.error('PUT /jugadores/:user_id', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

const update = async (req, res) => {
  try {
    // parseo seguro
    const jugador_id = Number(req.params.jugador_id);
    const puntaje = Number(req.body?.puntaje);

    // Debug opcional para ver tipos/valores
    // console.log({ jugador_id, puntaje, t1: typeof req.params.jugador_id, t2: typeof req.body?.puntaje });

    // validaciones
    if (!Number.isInteger(jugador_id) || jugador_id <= 0) {
      return res.status(400).json({ error: 'jugador_id inválido' });
    }

    if (!Number.isFinite(puntaje) || puntaje < 0) {
      return res.status(400).json({ error: 'puntaje inválido' });
    }

    const jugador = await Jugador.findByPk(jugador_id);    
    if (!jugador) {
      return res.status(404).send('Jugador not found');
    }

    await jugador.update({ puntaje });
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
