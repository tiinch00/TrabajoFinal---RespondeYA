import {Sala,User,Categoria} from '../models/associations.js';


const index = async (req, res) => {
  try {
    const salas = await Sala.findAll();
    res.json(salas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const sala = await Sala.findByPk(id);
    if (!sala) {
      return res.status(404).json({ error: "Sala not found" });
    }
    res.json(sala);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const store = async (req, res) => {
  const { codigo, creador_id, categoria_id, max_jugadores, estado } = req.body;
  if (!creador_id) {
    return res.status(400).json({ error: "creador_id is required" });
  }
  const creador = await User.findByPk(creador_id);
  if (!creador) {
    return res.status(400).json({ error: "Invalid creador_id" });
  }
  if (categoria_id) {
    const categoria = await Categoria.findByPk(categoria_id);
    if (!categoria) {
      return res.status(400).json({ error: "Invalid categoria_id" });
    }
  }
 if (max_jugadores !== undefined && max_jugadores !== 2) {
  return res.status(400).json({ error: "max_jugadores must be 2" });
}
  if (estado && !["esperando", "en_curso", "cancelada"].includes(estado)) {
    return res.status(400).json({ error: "Invalid estado value" });
  }
  try {
    const sala = await Sala.create({ codigo, creador_id, categoria_id, max_jugadores, estado });
    res.status(201).json(sala);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: "Código de sala ya existe" });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: "Invalid creador_id or categoria_id" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { codigo, creador_id, categoria_id, max_jugadores, estado } = req.body;
  if (creador_id && !creador_id) { 
    return res.status(400).json({ error: "creador_id cannot be changed" }); 
  }
  if (creador_id) {
    const creador = await User.findByPk(creador_id);
    if (!creador) {
      return res.status(400).json({ error: "Invalid creador_id" });
    }
  }
  if (categoria_id) {
    const categoria = await Categoria.findByPk(categoria_id);
    if (!categoria) {
      return res.status(400).json({ error: "Invalid categoria_id" });
    }
  }
  if (max_jugadores !== undefined && max_jugadores !== 2) {
  return res.status(400).json({ error: "max_jugadores must be 2" });
}
  if (estado && !["esperando", "en_curso", "cancelada"].includes(estado)) {
    return res.status(400).json({ error: "Invalid estado value" });
  }
  try {
    const sala = await Sala.findByPk(id);
    if (!sala) {
      return res.status(404).json({ error: "Sala not found" });
    }
    await sala.update({ codigo, creador_id, categoria_id, max_jugadores, estado });
    res.json(sala);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: "Código de sala ya existe" });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: "Invalid creador_id or categoria_id" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const sala = await Sala.findByPk(id);
    if (!sala) {
      return res.status(404).json({ error: "Sala not found" });
    }
    await sala.destroy();
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