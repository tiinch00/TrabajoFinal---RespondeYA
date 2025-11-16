import { Estadistica } from '../models/associations.js';

const index = async (req, res) => {
  try {
    const rawId = req.params.jugador_id ?? req.query.jugador_id;
    const jugadorId = Number(rawId);

    if (Number.isFinite(jugadorId) && jugadorId > 0) {
      // si no es un numero entero, envia un error
      if (!Number.isInteger(jugadorId)) {
        return res.status(400).json({ error: 'Numero incorrecto, jugador_id inválido.' });
      }

      // obtiene todos los avatares del jugador
      const rows = await Estadistica.findAll({
        where: { jugador_id: jugadorId },
      });
      // devuelve una lista (vacía o con datos de los avatares)
      return res.json(rows);
    } else {
      // console.log('Estadas todas las estadisicas en findAll()');
      const estadisticas = await Estadistica.findAll();
      res.json(estadisticas);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const index2 = async (req, res) => {
  try {
    const data = await Estadistica.findAll();
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const estadistica = await Estadistica.findByPk(id);
    if (!estadistica) {
      return res.status(404).send('Estadistica not found');
    }
    res.json(estadistica);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const store = async (req, res) => {
  const {
    jugador_id,
    partida_id,
    posicion,
    puntaje_total,
    total_correctas,
    total_incorrectas,
    tiempo_total_ms,
  } = req.body;
  try {
    const estadistica = await Estadistica.create({
      jugador_id,
      partida_id,
      posicion,
      puntaje_total,
      total_correctas,
      total_incorrectas,
      tiempo_total_ms,
    });
    res.status(201).json(estadistica);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const {
    usuario_id,
    partida_id,
    posicion,
    puntaje_total,
    total_correctas,
    total_incorrectas,
    tiempo_total_ms,
  } = req.body;
  try {
    const estadistica = await Estadistica.findByPk(id);
    if (!estadistica) {
      return res.status(404).send('estadistica not found');
    }

    await estadistica.update({
      usuario_id,
      partida_id,
      posicion,
      puntaje_total,
      total_correctas,
      total_incorrectas,
      tiempo_total_ms,
    });
    res.json(estadistica);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const estadistica = await Estadistica.findByPk(id);
    if (!estadistica) {
      return res.status(404).send('Estadistica not found');
    }

    await estadistica.destroy();
    res.status(204).send(); // No content
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

export default {
  index,
  index2,
  show,
  store,
  update,
  destroy,
};
