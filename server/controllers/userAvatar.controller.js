import { UserAvatar } from '../models/associations.js';

const index = async (req, res) => {
  try {
    // lee de params O de query (por si luego cambias la ruta)
    const rawId = req.params.jugador_id ?? req.query.jugador_id;
    const jugadorId = Number(rawId);

    if (Number.isFinite(jugadorId) && jugadorId > 0) {
      // filtra por jugador_id
      const rows = await UserAvatar.findAll({
        where: { jugador_id: jugadorId },
        order: [["adquirido_at", "DESC"]],
      });
      return res.json(rows);
    }

    // sin jugador_id → devolver todos
    const all = await UserAvatar.findAll({
      order: [["adquirido_at", "DESC"]],
    });
    return res.json(all);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error, JUGADOR_ID" });
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const userAvatar = await UserAvatar.findByPk(id);
    if (!userAvatar) {
      return res.status(404).json({ error: "userAvatar not found" });
    }
    res.json(userAvatar);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const store = async (req, res) => {

  const { jugador_id, avatar_id, origen, adquirido_at } = req.body;
  //validar
  if (!jugador_id || !avatar_id) {
    return res.status(400).json({ error: "categoria_id and enunciado are required" });
  }
  try {
    const userAvatar = await UserAvatar.create({ jugador_id, avatar_id, origen, adquirido_at });
    res.status(201).json(userAvatar);
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: "Invalid categoria_id" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { usuario_id, avatar_id, origen, adquirido_at } = req.body;
  if (!usuario_id || !avatar_id) {
    return res.status(400).json({ error: "data are required" });
  }
  try {
    const userAvatar = await UserAvatar.findByPk(id);
    if (!userAvatar) {
      return res.status(404).json({ error: "userAvatar not found" });
    }
    await userAvatar.update({ usuario_id, avatar_id, origen, adquirido_at });
    res.json(userAvatar);
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: "Invalid categoria_id" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const userAvatar = await UserAvatar.findByPk(id);
    if (!userAvatar) {
      return res.status(404).json({ error: "userAvatar not found" });
    }
    await userAvatar.destroy();
    res.status(204).send();
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