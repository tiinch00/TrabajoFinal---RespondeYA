import Pregunta from '../models/pregunta.js';
import Categoria from '../models/categoria.js';

const index = async (req, res) => {
  try {
    const preguntas = await Pregunta.findAll();
    res.json(preguntas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const pregunta = await Pregunta.findByPk(id);
    if (!pregunta) {
      return res.status(404).json({ error: "Pregunta not found" });
    }
    res.json(pregunta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const store = async (req, res) => {
  const { categoria_id, enunciado, dificultad } = req.body;
  //validar
  if (!categoria_id || !enunciado) {
    return res.status(400).json({ error: "categoria_id and enunciado are required" });
  }
  //validar
  const categoria = await Categoria.findByPk(categoria_id);
  if (!categoria) {
    return res.status(400).json({ error: "Invalid categoria_id" });
  }
  //dificultad
  if (dificultad && !['facil', 'normal', 'dificil'].includes(dificultad)) {
    return res.status(400).json({ error: "Invalid dificultad value" });
  }
  try {
    const pregunta = await Pregunta.create({ categoria_id, enunciado, dificultad });
    res.status(201).json(pregunta);
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
  const { categoria_id, enunciado, dificultad } = req.body;
  if (!categoria_id || !enunciado) {
    return res.status(400).json({ error: "categoria_id and enunciado are required" });
  }
  // categoria existe?
  const categoria = await Categoria.findByPk(categoria_id);
  if (!categoria) {
    return res.status(400).json({ error: "Invalid categoria_id" });
  }
  if (dificultad && !['facil', 'normal', 'difícil'].includes(dificultad)) {
    return res.status(400).json({ error: "Invalid dificultad value" });
  }
  try {
    const pregunta = await Pregunta.findByPk(id);
    if (!pregunta) {
      return res.status(404).json({ error: "Pregunta not found" });
    }
    await pregunta.update({ categoria_id, enunciado, dificultad });
    res.json(pregunta);
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
    const pregunta = await Pregunta.findByPk(id);
    if (!pregunta) {
      return res.status(404).json({ error: "Pregunta not found" });
    }
    await pregunta.destroy();
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