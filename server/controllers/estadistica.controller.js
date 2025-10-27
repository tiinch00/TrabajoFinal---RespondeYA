import { Estadistica } from '../models/associations.js';

const index = async (req, res) => {  
    const { jugador_id } = req.params; 
    console.log(jugador_id);
  try {
      
    //const jugador_id = Number(req.params.jugador_id);
    //console.log(jugador_id);

    if (jugador_id !== undefined && jugador_id !== null) {

    const jugadorId = Number(jugador_id);

    // si no es un numero entero, envia un error
    if (!Number.isInteger(jugadorId)) {
      return res.status(400).json({ error: "Numero incorrecto, jugador_id inválido." });
    }
    console.log("Entro al if de Number.isInteger(jugadorId)")

    // obtiene todos los avatares del jugador
      const rows = await Estadistica.findAll({
        where: { jugador_id: jugadorId }
      });
      // devuelve una lista (vacía o con datos de los avatares)
      return res.json(rows);
    } else {
      console.log("Estadas todas las estadisicas en findAll()")
      const estadisticas = await Estadistica.findAll();
      res.json(estadisticas);
    }
    
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
  const { usuario_id, partida_id, posicion, puntaje_total, total_correctas, total_incorrectas, tiempo_total_ms } = req.body;
  try {
    const estadistica = await Estadistica.create({ usuario_id, partida_id, posicion, puntaje_total, total_correctas, total_incorrectas, tiempo_total_ms });
    res.status(201).json(estadistica);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};


const update = async (req, res) => {
  const { id } = req.params;
  const { usuario_id, partida_id, posicion, puntaje_total, total_correctas, total_incorrectas, tiempo_total_ms } = req.body;
  try {
    const estadistica = await Estadistica.findByPk(id);
    if (!estadistica) {
      return res.status(404).send("estadistica not found");
    }

    await estadistica.update({ usuario_id, partida_id, posicion, puntaje_total, total_correctas, total_incorrectas, tiempo_total_ms });
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
