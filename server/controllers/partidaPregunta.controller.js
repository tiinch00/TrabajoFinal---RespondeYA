import { PartidaPregunta, Partida, Pregunta } from '../models/associations.js';

const index = async (req, res) => {
  try {
    const partidaPreguntas = await PartidaPregunta.findAll();
    res.json(partidaPreguntas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const partidaPregunta = await PartidaPregunta.findByPk(id);
    if (!partidaPregunta) {
      return res.status(404).json({ error: 'PartidaPregunta not found' });
    }
    res.json(partidaPregunta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const store = async (req, res) => {
  const {
    partida_id,
    pregunta_id,
    orden,
    question_text_copy,
    question_text_copy_en,
    correct_option_id_copy,
    correct_option_text_copy,
    correct_option_text_copy_en,
  } = req.body;
  if (!partida_id || !pregunta_id || !orden) {
    return res.status(400).json({ error: 'partida_id, pregunta_id, and orden are required' });
  }

  const partida = await Partida.findByPk(partida_id);
  if (!partida) {
    return res.status(400).json({ error: 'Invalid partida_id' });
  }

  const pregunta = await Pregunta.findByPk(pregunta_id);
  if (!pregunta) {
    return res.status(400).json({ error: 'Invalid pregunta_id' });
  }
  // Validar orden
  if (orden < 1 || orden > 255) {
    return res.status(400).json({ error: 'orden must be between 1 and 255' });
  }
  // Verificar unicidad de orden para la partida
  const existingOrder = await PartidaPregunta.findOne({ where: { partida_id, orden } });
  if (existingOrder) {
    return res.status(409).json({ error: 'This orden is already used for the partida' });
  }
  try {
    const partidaPregunta = await PartidaPregunta.create({
      partida_id,
      pregunta_id,
      orden,
      question_text_copy,
      question_text_copy_en,
      correct_option_id_copy,
      correct_option_text_copy,
      correct_option_text_copy_en,
    });
    res.status(201).json(partidaPregunta);
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Invalid partida_id or pregunta_id' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const {
    partida_id,
    pregunta_id,
    orden,
    question_text_copy,
    correct_option_id_copy,
    correct_option_text_copy,
  } = req.body;
  try {
    const partidaPregunta = await PartidaPregunta.findByPk(id);
    if (!partidaPregunta) {
      return res.status(404).json({ error: 'PartidaPregunta not found' });
    }
    // No permitir cambiar partida_id o pregunta_id
    if (partida_id !== undefined || pregunta_id !== undefined) {
      return res.status(400).json({ error: 'partida_id and pregunta_id cannot be changed' });
    }
    // Validar orden si se cambia
    if (orden !== undefined) {
      if (orden < 1 || orden > 255) {
        return res.status(400).json({ error: 'orden must be between 1 and 255' });
      }
      const existingOrder = await PartidaPregunta.findOne({
        where: { partida_id: partidaPregunta.partida_id, orden },
      });
      if (existingOrder && existingOrder.id !== id) {
        return res.status(409).json({ error: 'This orden is already used for the partida' });
      }
    }
    await partidaPregunta.update({
      orden,
      question_text_copy,
      correct_option_id_copy,
      correct_option_text_copy,
    });
    res.json(partidaPregunta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const partidaPregunta = await PartidaPregunta.findByPk(id);
    if (!partidaPregunta) {
      return res.status(404).json({ error: 'PartidaPregunta not found' });
    }
    await partidaPregunta.destroy();
    res.status(204).json({});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  index,
  show,
  store,
  update,
  destroy,
};
