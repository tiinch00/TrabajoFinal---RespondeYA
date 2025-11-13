import { Categoria, Opcion, Pregunta } from '../models/associations.js';

import sequelize from '../models/sequelize.js';

const index = async (req, res) => {
  const { id } = req.params;
  try {
    if (id !== undefined && id !== null) {
      const preguntas = await Pregunta.findAll({
        where: { categoria_id: id },
      });
      res.json(preguntas);
    } else {
      const preguntasAll = await Pregunta.findAll();
      res.json(preguntasAll);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const indexWithOptions = async (req, res) => {
  const { id } = req.params;
  try {
    const preguntas = await Pregunta.findAll({
      where: { categoriaId: id },
      include: [{ model: Opcion, as: 'opciones' }],
    });
    res.json(preguntas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const pregunta = await Pregunta.findByPk(id);
    if (!pregunta) {
      return res.status(404).json({ error: 'Pregunta not found' });
    }
    res.json(pregunta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const preguntasByCategoria = async (req, res) => {
  const { nombre, dificultad } = req.params;
  console.log('Parámetros recibidos:', { nombre, dificultad });
  try {
    const preguntas = await Pregunta.findAll({
      include: [
        {
          model: Categoria,
          as: 'Categoria', // Especifica el alias definido en associations.js
          where: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('nombre')),
            nombre.toLowerCase()
          ),
          attributes: ['nombre'],
        },
        {
          model: Opcion,
          as: 'Opciones', // Especifica el alias para Opciones (si lo definiste)
          attributes: ['id', 'texto', 'texto_en', 'es_correcta'],
        },
      ],
      where: dificultad ? { dificultad: dificultad.toLowerCase() } : {},
    });

    console.log('Preguntas encontradas:', preguntas);
    if (!preguntas.length) {
      return res.status(404).json({ error: 'No hay preguntas para esa categoría o dificultad' });
    }

    res.json(preguntas);
  } catch (error) {
    console.error('Error en preguntasByCategoria:', error.message, error.stack);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

const store = async (req, res) => {
  const { admin_id, categoria_id, enunciado, dificultad } = req.body;
  //validar
  if (!categoria_id || !enunciado) {
    return res.status(400).json({ error: 'categoria_id and enunciado are required' });
  }
  //validar
  const categoria = await Categoria.findByPk(categoria_id);
  if (!categoria) {
    return res.status(400).json({ error: 'Invalid categoria_id' });
  }
  //dificultad
  if (dificultad && !['facil', 'normal', 'dificil'].includes(dificultad)) {
    return res.status(400).json({ error: 'Invalid dificultad value' });
  }
  try {
    const pregunta = await Pregunta.create({ admin_id, categoria_id, enunciado, dificultad });
    res.json(pregunta);
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Invalid categoria_id' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const update = async (req, res) => {
  const { pregunta_id, categoria_id } = req.params;
  const { admin_id, enunciado, dificultad } = req.body;
  if (!categoria_id || !enunciado) {
    return res.status(400).json({ error: 'categoria_id and enunciado are required' });
  }
  // categoria existe?
  const categoria = await Categoria.findByPk(categoria_id);
  if (!categoria) {
    return res.status(400).json({ error: 'Invalid categoria_id' });
  }
  if (dificultad && !['facil', 'normal', 'dificil'].includes(dificultad)) {
    return res.status(400).json({ error: 'Invalid dificultad value' });
  }
  try {
    const pregunta = await Pregunta.findByPk(pregunta_id);
    if (!pregunta) {
      return res.status(404).json({ error: 'Pregunta not found' });
    }
    await pregunta.update({ admin_id, categoria_id, enunciado, dificultad });
    res.json(pregunta);
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Invalid categoria_id' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const destroy = async (req, res) => {
  const { pregunta_id } = req.params;
  try {
    const pregunta = await Pregunta.findByPk(pregunta_id);
    if (!pregunta) {
      return res.status(404).json({ error: 'Pregunta not found' });
    }

    await pregunta.destroy();

    return res.status(200).json({ ok: true, id: pregunta_id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  indexWithOptions,
  index,
  show,
  preguntasByCategoria,
  store,
  update,
  destroy,
};
