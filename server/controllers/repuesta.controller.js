
import {Respuesta,Partida,User,Pregunta} from '../models/associations.js';


const index = async (req, res) => {
  try {
    const respuestas = await Respuesta.findAll();
    res.json(respuestas);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};


const show = async (req, res) => {
  const { id } = req.params;
  try {
    const respuesta = await Respuesta.findByPk(id);
    if (!respuesta) {
      return res.status(404).send("Respuesta not found");
    }
    res.json(respuesta);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};


const store = async (req, res) => {
  const { partida_id, usuario_id, pregunta_id, partida_pregunta_id, opcion_elegida_id, estadistica_id, es_correcta, tiempo_respuesta_ms } = req.body;
  if (!partida_id || !usuario_id || !pregunta_id || !partida_pregunta_id || !opcion_elegida_id || !estadistica_id || !es_correcta || !tiempo_respuesta_ms){
     return res.status(400).json({ error: "Data are required" });
  }
  const partida = await Partida.findByPk(partida_id);
  if (!partida) {
    return res.status(400).json({ error: "Invalid partida_id" });
  }
   const user = await User.findByPk(usuario_id);
  if (!user) {
    return res.status(400).json({ error: "Invalid usuario_id" });
  }
  const pregunta = await Pregunta.findByPk(pregunta_id);
  if (!pregunta) {
    return res.status(400).json({ error: "Invalid pregunta_id" });
  }
  try {
    const respuesta = await Respuesta.create({ partida_id, usuario_id, pregunta_id, partida_pregunta_id, opcion_elegida_id, estadistica_id, es_correcta, tiempo_respuesta_ms });
    res.status(201).json(respuesta);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).send("El jugador ya respondió esta pregunta en la partida");
    }
    return res.status(500).send("Internal server error");
  }
};


const update = async (req, res) => {
  const { id } = req.params;
  const { partida_id, usuario_id, pregunta_id, partida_pregunta_id, opcion_elegida_id, estadistica_id, es_correcta, tiempo_respuesta_ms } = req.body;
    if (!partida_id || !usuario_id || !pregunta_id || !partida_pregunta_id || !opcion_elegida_id || !estadistica_id || !es_correcta || !tiempo_respuesta_ms){
     return res.status(400).json({ error: "Data are required" });
  }
  const partida = await Partida.findByPk(partida_id);
  if (!partida) {
    return res.status(400).json({ error: "Invalid partida_id" });
  }
   const user = await User.findByPk(usuario_id);
  if (!user) {
    return res.status(400).json({ error: "Invalid usuario_id" });
  }
  const pregunta = await Pregunta.findByPk(pregunta_id);
  if (!pregunta) {
    return res.status(400).json({ error: "Invalid pregunta_id" });
  }
  try {
    const respuesta = await Respuesta.findByPk(id);
    if (!respuesta) {
      return res.status(404).send("Respuesta not found");
    }

    await respuesta.update({ partida_id, usuario_id, pregunta_id, partida_pregunta_id, opcion_elegida_id, estadistica_id, es_correcta, tiempo_respuesta_ms });
    res.json(respuesta);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).send("El jugador ya respondió esta pregunta en la partida");
    }
    return res.status(500).send("Internal server error");
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const respuesta = await Respuesta.findByPk(id);
    if (!respuesta) {
      return res.status(404).send("Respuesta not found");
    }

    await respuesta.destroy();
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
