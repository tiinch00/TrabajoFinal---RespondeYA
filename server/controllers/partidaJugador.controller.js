import { PartidaJugador, Partida, Jugador } from '../models/associations.js';

const index = async (req, res) => {
  try {
    const partidaJugadores = await PartidaJugador.findAll();
    res.json(partidaJugadores);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const partidaJugador = await PartidaJugador.findByPk(id);
    if (!partidaJugador) {
      return res.status(404).json({ error: 'PartidaJugador not found' });
    }
    res.json(partidaJugador);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const store = async (req, res) => {
  const { partida_id, jugador_id } = req.body;
  if (!partida_id || !jugador_id) {
    return res.status(400).json({ error: 'partida_id, usuario_id' });
  }
  const partida = await Partida.findByPk(partida_id);
  if (!partida) {
    return res.status(400).json({ error: 'Invalid partida_id' });
  }

  const jugador = await Jugador.findByPk(jugador_id);
  if (!jugador) {
    return res.status(400).json({ error: 'Invalid usuario_id' });
  }

  try {
    const partidaJugador = await PartidaJugador.create({ partida_id, jugador_id });
    res.status(201).json(partidaJugador);
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Invalid partida_id or usuario_id' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { partida_id, usuario_id, rol, joined_at } = req.body;
  try {
    const partidaJugador = await PartidaJugador.findByPk(id);
    if (!partidaJugador) {
      return res.status(404).json({ error: 'PartidaJugador not found' });
    }
    // No permitir cambiar partida_id o usuario_id
    if (partida_id !== undefined || usuario_id !== undefined) {
      return res.status(400).json({ error: 'partida_id and usuario_id cannot be changed' });
    }
    // Validar rol
    if (rol && !['creador', 'invitado'].includes(rol)) {
      return res.status(400).json({ error: 'Invalid rol value' });
    }
    await partidaJugador.update({ rol, joined_at });
    res.json(partidaJugador);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'El jugador ya está en esta partida' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const partidaJugador = await PartidaJugador.findByPk(id);
    if (!partidaJugador) {
      return res.status(404).json({ error: 'PartidaJugador not found' });
    }
    await partidaJugador.destroy();
    res.status(204).json({});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  index,
  show,
  store,
  update,
  destroy,
};
