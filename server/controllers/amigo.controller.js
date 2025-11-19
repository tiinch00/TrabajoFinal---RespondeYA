import { Amigo, Jugador, User } from '../models/associations.js';

export const index = async (req, res) => {
  try {
    const { jugador_id, amigo_id } = req.query;

    const where = {};
    if (jugador_id) where.jugador_id = Number(jugador_id);
    if (amigo_id) where.amigo_id = Number(amigo_id);

    const amigos = await Amigo.findAll({
      where,
      order: [
        ['aceptado_en', 'DESC'], // 👈 nombre correcto
        ['creado_en', 'DESC'],   // opcional como desempate
      ],
    });

    return res.json(amigos);
  } catch (err) {
    console.error('GET /amigos error:', err);
    return res.status(500).json({ error: err.message });
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
  let { jugador_id, amigo_id, aceptado_en } = req.body;

  const jId = Number(jugador_id);
  const aId = Number(amigo_id);

  if (!Number.isFinite(jId) || jId <= 0 || !Number.isFinite(aId) || aId <= 0) {
    return res.status(400).json({ error: "jugador_id and amigo_id are required" });
  }
  if (jId === aId) {
    return res.status(400).json({ error: "jugador_id and amigo_id cannot be the same" });
  }

  try {
    const jugador = await Jugador.findByPk(jId);
    const amigoJugador = await Jugador.findByPk(aId);

    if (!jugador || !amigoJugador) {
      return res.status(400).json({ error: "Invalid jugador_id or amigo_id" });
    }

    const nuevoAmigo = await Amigo.create({
      jugador_id: jId,
      amigo_id: aId,
      aceptado_en: aceptado_en || null,
    });

    return res.status(201).json(nuevoAmigo);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Friendship already exists" });
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ error: "Invalid jugador_id or amigo_id" });
    }
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};



const update = async (req, res) => {
  const { id } = req.params;
  const { aceptado_en } = req.body;

  try {
    const amigo = await Amigo.findByPk(id);
    if (!amigo) {
      return res.status(404).json({ error: "amigo not found" });
    }

    await amigo.update({
      aceptado_en: aceptado_en || new Date(),
    });

    return res.json(amigo);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Friendship already exists" });
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ error: "Invalid jugador_id or amigo_id" });
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
