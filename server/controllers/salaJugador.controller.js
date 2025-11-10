import { Jugador, Sala, SalaJugador } from '../models/associations.js';

const index = async (req, res) => {
  const raw = req.query.sala_id; // viene por query. no por .params o .body
  //console.log("raw: ", raw);
  const id = raw != null ? Number(raw) : null;

  //console.log({ t1: typeof id });
  //console.log(id);

  if (id != null && (!Number.isFinite(id) || id <= 0)) {
    return res.status(400).json({ error: 'sala_id inválido' });
  }

  try {
    const where = id != null ? { sala_id: id } : undefined;
    //console.log("id de whre: ", where);
    const salaJugador = await SalaJugador.findAll({ where });
    //console.log("salaJugador: ", salaJugador);
    res.json(salaJugador);
  } catch (error) {
    //console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const salaJugador = await SalaJugador.findByPk(id);
    if (!salaJugador) {
      return res.status(404).json({ error: "SalaJugador not found" });
    }
    res.json(salaJugador);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const store = async (req, res) => {
  const { sala_id, jugador_id, joined_at } = req.body;

  // console.log({ sala_id: typeof sala_id });
  // console.log({ jugador_id: typeof jugador_id });
  // console.log({ joined_at: typeof joined_at });
  // console.log( "sala_id:",  sala_id );
  // console.log( "jugador_id: ",  jugador_id );
  // console.log( "joined_at: ",  joined_at );

  // validaciones de parametros
  if (!sala_id || !jugador_id) {
    return res.status(400).json({ error: "sala_id y jugador_id are required" });
  } else {
    // Validar existencia de sala_id
    const sala = await Sala.findByPk(sala_id);
    if (!sala) {
      return res.status(400).json({ error: "Invalid sala_id" });
    } else {
      // Validar existencia de jugador_id
      const jugador = await Jugador.findByPk(jugador_id);
      if (!jugador) {
        return res.status(400).json({ error: "Invalid jugador_id" });
      } else { // fin else y comienza try{...}
        
        try {
          const salaJugador = await SalaJugador.create({ sala_id, jugador_id, joined_at });
          res.status(201).json(salaJugador);

        } catch (error) {
          if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: "El jugador ya está en esta sala" });
          }
          if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ error: "Invalid sala_id or usuario_id" });
          }
          console.error(error);
          return res.status(500).json({ error: "Internal server error" });
        } // fin catch

      }
    }
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { sala_id, jugador_id, joined_at } = req.body;
  try {
    const salaJugador = await SalaJugador.findByPk(id);
    if (!salaJugador) {
      return res.status(404).json({ error: "SalaJugador not found" });
    }
    if (sala_id !== undefined || jugador_id !== undefined) {
      return res.status(400).json({ error: "sala_id and jugador_id cannot be changed" });
    }    
    await salaJugador.update({ joined_at });
    res.json(salaJugador);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: "El jugador ya está en esta sala" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const salaJugador = await SalaJugador.findByPk(id);
    if (!salaJugador) {
      return res.status(404).json({ error: "SalaJugador not found" });
    }
    await salaJugador.destroy();
    res.status(204).json({}); // Usar json para consistencia
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