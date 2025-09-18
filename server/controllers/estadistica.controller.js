
import Estadistica from "../models/estadistica.js";


const index = async (req, res) => {
  try {
    const estadisticas = await Estadistica.findAll();
    res.json(estadisticas);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};


const show = async (req, res) => {
  const { id } = req.params;
  try {
    const estadistica = await Estadistica.findByPk(id);
    if (!estadistica) {
      return res.status(404).send("Estadistica not found");
    }
    res.json(estadistica);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};


const store = async (req, res) => {
  const { usuario_id,partida_id,posicion,puntaje_total,total_correctas,total_incorrectas,tiempo_total_ms } = req.body;
  try {
    const estadistica = await Estadistica.create({ usuario_id,partida_id,posicion,puntaje_total,total_correctas,total_incorrectas,tiempo_total_ms });
    res.status(201).json(estadistica);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};


const update = async (req, res) => {
  const { id } = req.params;
  const { usuario_id,partida_id,posicion,puntaje_total,total_correctas,total_incorrectas,tiempo_total_ms } = req.body;
  try {
    const estadistica = await Estadistica.findByPk(id);
    if (!estadistica) {
      return res.status(404).send("estadistica not found");
    }

    await estadistica.update({ usuario_id,partida_id,posicion,puntaje_total,total_correctas,total_incorrectas,tiempo_total_ms });
    res.json(estadistica);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const estadistica = await Estadistica.findByPk(id);
    if (!estadistica) {
      return res.status(404).send("Estadistica not found");
    }

    await estadistica.destroy();
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
