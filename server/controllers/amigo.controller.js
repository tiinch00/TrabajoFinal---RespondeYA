
import Amigo from "../models/amigo.js";


const index = async (req, res) => {
  try {
    const amigos = await Amigo.findAll();
    res.json(amigos);
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
  const { usuario_id, amigo_id,aceptado_en} = req.body;
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
