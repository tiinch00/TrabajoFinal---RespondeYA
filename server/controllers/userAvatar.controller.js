import { UserAvatar } from '../models/associations.js';

const index = async (req, res) => {

  const { jugador_id } = req.params;

  // verificacion de jugador_id (null o undefined)
  if (jugador_id !== undefined && jugador_id !== null) {
    
    // busca a todos los avatares de un jugador
    try {
      const jugadorId = Number(jugador_id);

      // si no es un numero entero, envia un error
      if (!Number.isInteger(jugadorId)) {
        return res.status(400).json({ error: "Numero incorrecto, jugador_id inválido." });
      }

      // obtiene todos los avatares del jugador
      const rows = await UserAvatar.findAll({
        where: { jugador_id: jugadorId },
        order: [["adquirido_at", "DESC"]], // opcional, ordena por fecha
      });

      // devuelve una lista (vacía o con datos de los avatares)
      return res.json(rows);
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error, JUGADOR_ID" });
    }

  } else {
    
    // busca a todos los avatares de todos los jugadores
    try {
      const userAvatars = await UserAvatar.findAll();
      res.json(userAvatars);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error, SIN JUGADOR_ID" });
    }

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