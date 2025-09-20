import {SalaJugador} from '../models/associations.js';

const index = async (req, res) => {
  try {
    const salaJugador = await SalaJugador.findAll();
    res.json(salaJugador);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const salaJugador = await SalaJugador.findByPk(id);
    if (!salaJugador) {
      return res.status(404).json({ error: "SalaJugador not found" });
    }
    res.json(salaJugador);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const store = async (req, res) => {
  const { sala_id, usuario_id, rol, joined_at } = req.body;
  if (!sala_id || !usuario_id || !rol) {
    return res.status(400).json({ error: "sala_id, usuario_id, and rol are required" });
  }
  // Validar existencia de sala_id
  const sala = await Sala.findByPk(sala_id);
  if (!sala) {
    return res.status(400).json({ error: "Invalid sala_id" });
  }
  // Validar existencia de usuario_id
  const usuario = await User.findByPk(usuario_id);
  if (!usuario) {
    return res.status(400).json({ error: "Invalid usuario_id" });
  }
  // Validar rol
  if (!['creador', 'invitado'].includes(rol)) {
    return res.status(400).json({ error: "Invalid rol value" });
  }
  try {
    const salaJugador = await SalaJugador.create({ sala_id, usuario_id, rol, joined_at });
    res.status(201).json(salaJugador);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: "El jugador ya está en esta sala" });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: "Invalid sala_id or usuario_id" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { sala_id, usuario_id, rol, joined_at } = req.body;
  try {
    const salaJugador = await SalaJugador.findByPk(id);
    if (!salaJugador) {
      return res.status(404).json({ error: "SalaJugador not found" });
    }
    if (sala_id !== undefined || usuario_id !== undefined) {
      return res.status(400).json({ error: "sala_id and usuario_id cannot be changed" });
    }
    // Validar rol
    if (rol && !['creador', 'invitado'].includes(rol)) {
      return res.status(400).json({ error: "Invalid rol value" });
    }
    await salaJugador.update({ rol, joined_at });
    res.json(salaJugador);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: "El jugador ya está en esta sala" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const salaJugador = await SalaJugador.findByPk(id);
    if (!salaJugador) {
      return res.status(404).json({ error: "SalaJugador not found" });
    }
    await salaJugador.destroy();
    res.status(204).json({}); // Usar json para consistencia
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  index,
  show,
  store,
  update,
  destroy,
};