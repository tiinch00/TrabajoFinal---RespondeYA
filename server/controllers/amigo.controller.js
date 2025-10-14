import { Amigo } from '../models/associations.js';

const index = async (req, res) => {

  const { jugador_id } = req.params;

  try {
    if (jugador_id !== undefined && jugador_id !== null) {
      const jugadorId = Number(jugador_id);

      // si no es un numero entero, envia un error
      if (!Number.isInteger(jugadorId)) {
        return res.status(400).json({ error: "Numero incorrecto, jugador_id inválido." });
      }

      // obtiene todos los avatares del jugador
      const rows = await Amigo.findAll({
        where: { jugador_id: jugadorId },
        order: [["aceptado_at", "DESC"]], // opcional, ordena por fecha
      });

      // devuelve una lista (vacía o con datos de los avatares)
      return res.json(rows);

    } else {
      const amigos = await Amigo.findAll();
      res.json(amigos);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const show = async (req, res) => {
  const { id } = req.params;
  try {
    const amigo = await Amigo.findByPk(id);
    if (!amigo) {
      return res.status(404).json({ error: "amigo not found" });
    }
    res.json(amigo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const store = async (req, res) => {
  const { usuario_id, amigo_id, aceptado_en } = req.body;
  if (!usuario_id || !amigo_id) {
    return res.status(400).json({ error: "Usuario_id and amigo_id are required" });
  }
  if (usuario_id === amigo_id) {
    return res.status(400).json({ error: "Usuario_id and amigo_id cannot be the same" });
  }
  //usuarios existen?
  const usuario = await User.findByPk(usuario_id);
  const amigo = await User.findByPk(amigo_id);
  if (!usuario || !amigo) {
    return res.status(400).json({ error: "Invalid usuario_id or amigo_id" });
  }
  try {
    const amigo = await Amigo.create({ usuario_id, amigo_id, aceptado_en });
    res.status(201).json(amigo);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: "Friendship already exists" });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: "Invalid usuario_id or amigo_id" });
    }
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};


const update = async (req, res) => {
  const { id } = req.params;
  const { usuario_id, amigo_id, aceptado_en } = req.body;
  if (!usuario_id || !amigo_id) {
    return res.status(400).json({ error: "Usuario_id and amigo_id are required" });
  }
  if (usuario_id === amigo_id) {
    return res.status(400).json({ error: "Usuario_id and amigo_id cannot be the same" });
  }
  const usuario = await User.findByPk(usuario_id);
  const amigo = await User.findByPk(amigo_id);
  if (!usuario || !amigo) {
    return res.status(400).json({ error: "Invalid usuario_id or amigo_id" });
  }
  try {
    const amigo = await Amigo.findByPk(id);
    if (!amigo) {
      return res.status(404).json({ error: "amigo not found" });
    }

    await amigo.update({ usuario_id, amigo_id, aceptado_en });
    res.json(amigo);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: "Friendship already exists" });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: "Invalid usuario_id or amigo_id" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const amigo = await Amigo.findByPk(id);
    if (!amigo) {
      return res.status(404).json({ error: "amigo not found" });
    }

    await amigo.destroy();
    res.status(204).send(); // No content
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
