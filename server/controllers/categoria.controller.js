import { Categoria } from '../models/associations.js';

const index = async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    res.json(categorias);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria not found' });
    }
    res.json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const showByName = async (req, res) => {
  const { nombre } = req.params;
  try {
    const categoria = await Categoria.findOne({
      where: { nombre },
    });

    if (!categoria) {
      return res.status(404).json({ error: 'Categoria not found' });
    }

    res.json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const store = async (req, res) => {
  const { admin_id, nombre, descripcion } = req.body;
  if (!admin_id || !nombre || !descripcion) {
    return res.status(400).json({ error: 'Nombre and descripcion are required' });
  }
  if (nombre.length > 100 || descripcion.length > 255) {
    return res.status(400).json({ error: 'Nombre or descripcion too long' });
  }
  try {
    const categoria = await Categoria.create({ admin_id, nombre, descripcion });
    res.status(201).json(categoria);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Nombre or descripcion already exists' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  if (!nombre || !descripcion) {
    return res.status(400).json({ error: 'Nombre and descripcion are required' });
  }
  if (nombre.length > 100 || descripcion.length > 255) {
    return res.status(400).json({ error: 'Nombre or descripcion too long' });
  }
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria not found' });
    }
    await categoria.update({ nombre, descripcion });
    res.json(categoria);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Nombre or descripcion already exists' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria not found' });
    }
    await categoria.destroy();
    return res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  index,
  show,
  showByName,
  store,
  update,
  destroy,
};
