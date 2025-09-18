
import Opcion from "../models/opcion.js";
import Pregunta from "../models/pregunta.js";

const index = async (req, res) => {
  try {
    const opciones = await Opcion.findAll();
    res.json(opciones);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const show = async (req, res) => {
  const { id } = req.params;
  try {
    const opcion = await Opcion.findByPk(id);
    if (!opcion) {
      return res.status(404).send("opcion not found");
    }
    res.json(opcion);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const store = async (req, res) => {
  const { pregunta_id , texto, es_correcta} = req.body;
  if (!pregunta_id || !texto) {
    return res.status(400).json({ error: "pregunta_id, texto are required" });
  }
  const pregunta = await Pregunta.findByPk(pregunta_id);
  if (!pregunta) {
    return res.status(400).json({ error: "Invalid pregunta_id" });
  }     
  try {
    const opcion = await Opcion.create({ pregunta_id , texto, es_correcta });
    
    res.status(201).json(opcion);
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: "Invalid pregunta_id" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const update = async (req, res) => {
  const { id } = req.params;
  const { pregunta_id , texto , es_correcta} = req.body;
  if (!pregunta_id  || !texto) {
    return res.status(400).json({ error: "pregunta_id, texto are required" });
  }
  const pregunta = await Pregunta.findByPk(pregunta_id);
  if (!pregunta) {
    return res.status(400).json({ error: "Invalid pregunta_id" });
  }
  try {
    const opcion = await Opcion.findByPk(id);
    if (!opcion) {
      return res.status(404).json({ error: "opcion not found" });
    }

    await opcion.update({ pregunta_id, texto,es_correcta});
    res.json(opcion);
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: "Invalid pregunta_id" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const opcion = await Opcion.findByPk(id);
    if (!opcion) {
      return res.status(404).json({ error: "opcion not found" });
    }

    await opcion.destroy();
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
