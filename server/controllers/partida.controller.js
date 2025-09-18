import Partida from '../models/partida.js';
import User from '../models/user.js';
import Sala from '../models/sala.js';
import Categoria from '../models/categoria.js';

const index = async (req, res) => {
  try {
    const partidas = await Partida.findAll();
    res.json(partidas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const partida = await Partida.findByPk(id);
    if (!partida) {
      return res.status(404).json({ error: "Partida not found" });
    }
    res.json(partida);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const store = async (req, res) => {
  const { usuario_id, sala_id, categoria_id, modo, total_preguntas, estado, started_at, ended_at } = req.body;
  if (!modo) {
    return res.status(400).json({ error: "modo is required" });
  }
  if (modo === 'individual' && (!usuario_id || sala_id !== undefined)) {
    return res.status(400).json({ error: "individual mode requires usuario_id and no sala_id" });
  }
  if (modo === 'multijugador' && (!sala_id || usuario_id !== undefined)) {
    return res.status(400).json({ error: "multijugador mode requires sala_id and no usuario_id" });
  }
  if (usuario_id) {
    const usuario = await User.findByPk(usuario_id);
    if (!usuario) {
      return res.status(400).json({ error: "Invalid usuario_id" });
    }
  }
  if (sala_id) {
    const sala = await Sala.findByPk(sala_id);
    if (!sala) {
      return res.status(400).json({ error: "Invalid sala_id" });
    }
  }
  if (categoria_id) {
    const categoria = await Categoria.findByPk(categoria_id);
    if (!categoria) {
      return res.status(400).json({ error: "Invalid categoria_id" });
    }
  }
  // Validar total_preguntas
  if (!total_preguntas || total_preguntas < 1 || total_preguntas > 255) {
    return res.status(400).json({ error: "total_preguntas must be between 1 and 255" });
  }
  // Validar estado
  if (estado && !['pendiente', 'en_curso', 'finalizada', 'abandonada'].includes(estado)) {
    return res.status(400).json({ error: "Invalid estado value" });
  }
  try {
    const partida = await Partida.create({ usuario_id, sala_id, categoria_id, modo, total_preguntas, estado, started_at, ended_at });
    res.status(201).json(partida);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: "A partida for this sala_id already exists" });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: "Invalid usuario_id, sala_id, or categoria_id" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { usuario_id, sala_id, categoria_id, modo, total_preguntas, estado, started_at, ended_at } = req.body;
  try {
    const partida = await Partida.findByPk(id);
    if (!partida) {
      return res.status(404).json({ error: "Partida not found" });
    }
    // No permitir cambiar usuario_id o sala_id después de la creación
    if (usuario_id !== undefined || sala_id !== undefined) {
      return res.status(400).json({ error: "usuario_id and sala_id cannot be changed" });
    }
    // Validar modo (solo si se proporciona)
    if (modo && !['individual', 'multijugador'].includes(modo)) {
      return res.status(400).json({ error: "Invalid modo value" });
    }
    // Validar categoria_id si se cambia
    if (categoria_id !== undefined) {
      const categoria = await Categoria.findByPk(categoria_id);
      if (categoria_id && !categoria) {
        return res.status(400).json({ error: "Invalid categoria_id" });
      }
    }
    // Validar total_preguntas
    if (total_preguntas !== undefined && (total_preguntas < 1 || total_preguntas > 255)) {
      return res.status(400).json({ error: "total_preguntas must be between 1 and 255" });
    }
    // Validar estado
    if (estado && !['pendiente', 'en_curso', 'finalizada', 'abandonada'].includes(estado)) {
      return res.status(400).json({ error: "Invalid estado value" });
    }
    await partida.update({ categoria_id, modo, total_preguntas, estado, started_at, ended_at });
    res.json(partida);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: "A partida for this sala_id already exists" });
    }
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
    const partida = await Partida.findByPk(id);
    if (!partida) {
      return res.status(404).json({ error: "Partida not found" });
    }
    await partida.destroy();
    res.status(204).json({});
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