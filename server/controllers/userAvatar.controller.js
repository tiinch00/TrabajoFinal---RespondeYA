import { UserAvatar } from '../models/associations.js';

const index = async (req, res) => {
  try {
    const userAvatars = await UserAvatar.findAll();
    res.json(userAvatars);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
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