import {Avatar} from '../models/associations.js';


const index = async (req, res) => {
  try {
    const avatars = await Avatar.findAll();
    res.json(avatars);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};


const show = async (req, res) => {
  const { id } = req.params;
  try {
    const avatar = await Avatar.findByPk(id);
    if (!avatar) {
      return res.status(404).send("avatar not found");
    }
    res.json(avatar);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};


const store = async (req, res) => {
  const { name, division, precio_puntos, activo, preview_url} = req.body;
  try {
    const avatar = await Avatar.create({ name, division, precio_puntos, activo, preview_url});
    res.status(201).json(avatar);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};


const update = async (req, res) => {
  const { id } = req.params;
  const { name, division, precio_puntos, activo, preview_url} = req.body;
  try {
    const avatar = await Avatar.findByPk(id);
    if (!avatar) {
      return res.status(404).send("avatar not found");
    }

    await avatar.update({ name, division, precio_puntos, activo, preview_url});
    res.json(avatar);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const avatar = await Avatar.findByPk(id);
    if (!avatar) {
      return res.status(404).send("avatar not found");
    }

    await avatar.destroy();
    res.status(204).send(); // No content
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export default {
  index,
  show,
  store,
  update,
  destroy,
};
