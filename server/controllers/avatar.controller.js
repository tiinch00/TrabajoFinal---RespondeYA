import { Avatar } from '../models/associations.js';
import { Administrador } from '../models/associations.js';
const index = async (req, res) => {
  try {
    const avatars = await Avatar.findAll();
    res.json(avatars);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const avatar = await Avatar.findByPk(id);
    if (!avatar) {
      return res.status(404).send('avatar not found');
    }
    res.json(avatar);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const store = async (req, res) => {
  const { admin_id, nombre, division, precio_puntos, activo, preview_url } = req.body;
  if (!admin_id || !nombre || !division || precio_puntos === undefined || !preview_url) {
    return res.status(400).json({
      error:
        'Faltan datos obligatorios. Debes enviar: admin_id, nombre, division, precio_puntos y preview_url.',
    });
  }

  if (isNaN(precio_puntos) || precio_puntos < 0) {
    return res.status(400).json({ error: 'El campo precio_puntos debe ser un número positivo.' });
  }

  if (
    preview_url &&
    !/^((https?:\/\/.+)|\/assets\/.+)\.(jpg|jpeg|png|gif|webp)$/i.test(preview_url)
  ) {
    return res.status(400).json({
      error:
        'El campo preview_url debe ser una URL válida (http/https) o una ruta local en /assets/.',
    });
  }
  const admin = await Administrador.findByPk(admin_id);
  if (!admin) {
    return res.status(400).json({ error: 'El admin_id no existe en la base de datos.' });
  }

  try {
    const avatar = await Avatar.create({
      admin_id,
      nombre: nombre.trim(),
      division: division.trim(),
      precio_puntos: Number(precio_puntos),
      activo: activo ?? true, // por defecto true
      preview_url: preview_url.trim(),
    });
    res.status(201).json(avatar);
  } catch (error) {
    console.error('Error en store /avatar:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, division, precio_puntos, activo, preview_url } = req.body;
  try {
    const avatar = await Avatar.findByPk(id);
    if (!avatar) {
      return res.status(404).send('avatar not found');
    }

    await avatar.update({ name, division, precio_puntos, activo, preview_url });
    res.json(avatar);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const avatar = await Avatar.findByPk(id);
    if (!avatar) {
      return res.status(404).send('avatar not found');
    }

    await avatar.destroy();
    res.status(204).send(); // No content
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

export default {
  index,
  show,
  store,
  update,
  destroy,
};
