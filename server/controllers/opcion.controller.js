import { Opcion, Pregunta } from '../models/associations.js';

const index = async (req, res) => {
  const { pregunta_id } = req.params;

  try {
    const opciones = await Opcion.findAll({
      where: { pregunta_id: pregunta_id },
    });
    res.json(opciones);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const opcion = await Opcion.findByPk(id);
    if (!opcion) {
      return res.status(404).send('opcion not found');
    }
    res.json(opcion);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const storeViejo = async (req, res) => {
  const { pregunta_id, texto, es_correcta } = req.body;
  if (!pregunta_id || !texto) {
    return res.status(400).json({ error: 'pregunta_id, texto are required' });
  }
  const pregunta = await Pregunta.findByPk(pregunta_id);
  if (!pregunta) {
    return res.status(400).json({ error: 'Invalid pregunta_id' });
  }
  try {
    const opcion = await Opcion.create({ pregunta_id, texto, es_correcta });

    res.status(201).json(opcion);
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Invalid pregunta_id' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const store = async (req, res) => {
  const { admin_id, opcion1, opcion2, opcion3, opcion4, es_correcta } = req.body;
  const { pregunta_id } = req.params;

  const opciones = [opcion1, opcion2, opcion3, opcion4];
  const nombres = ['opcion1', 'opcion2', 'opcion3', 'opcion4'];
  if (!pregunta_id || opciones.every((o) => !o)) {
    return res.status(400).json({ error: 'pregunta_id y al menos una opción son requeridos' });
  }

  if (!es_correcta || !nombres.includes(es_correcta)) {
    return res.status(400).json({ error: 'Debe especificar una opción correcta válida' });
  }

  try {
    const pregunta = await Pregunta.findByPk(pregunta_id);
    if (!pregunta) return res.status(400).json({ error: 'Invalid pregunta_id' });

    // si ya existe una opcion correcta
    const existingCorrectOption = await Opcion.findOne({
      where: { pregunta_id, es_correcta: true },
    });
    if (existingCorrectOption && opciones.some((_, i) => nombres[i] === es_correcta)) {
      return res.status(400).json({ error: 'Ya existe una opción correcta para esta pregunta' });
    }

    const nuevasOpciones = await Promise.all(
      opciones.map((texto, i) =>
        texto
          ? Opcion.create({
              admin_id,
              pregunta_id,
              texto,
              es_correcta: nombres[i] === es_correcta,
            })
          : null
      )
    );

    res.status(201).json({
      ok: true,
      message: 'Opciones creadas exitosamente',
      opciones: nuevasOpciones.filter(Boolean),
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map((e) => e.message) });
    }
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const update = async (req, res) => {
  const { admin_id, opcion1, opcion2, opcion3, opcion4, es_correcta } = req.body;
  const { pregunta_id } = req.params;

  const opciones = [opcion1, opcion2, opcion3, opcion4];
  const nombres = ['opcion1', 'opcion2', 'opcion3', 'opcion4'];

  // Validaciones básicas
  if (!pregunta_id || opciones.every((o) => !o)) {
    return res.status(400).json({ error: 'pregunta_id y al menos una opción son requeridos' });
  }

  if (!es_correcta || !nombres.includes(es_correcta)) {
    return res.status(400).json({ error: 'Debe especificar una opción correcta válida' });
  }

  try {
    const pregunta = await Pregunta.findByPk(pregunta_id);
    if (!pregunta) {
      return res.status(400).json({ error: 'Invalid pregunta_id' });
    }

    const opcionesExistentes = await Opcion.findAll({
      where: { pregunta_id },
      order: [['id', 'ASC']],
    });

    if (opcionesExistentes.length === 0) {
      const nuevasOpciones = await Promise.all(
        opciones.map((texto, i) =>
          texto
            ? Opcion.create({
                admin_id,
                pregunta_id,
                texto,
                es_correcta: nombres[i] === es_correcta,
              })
            : null
        )
      );

      return res.status(201).json({
        ok: true,
        message: 'Opciones creadas porque no existían previamente',
        opciones: nuevasOpciones.filter(Boolean),
      });
    }

    await Promise.all(
      opcionesExistentes.map((opcion, i) => {
        const texto = opciones[i];
        if (texto) {
          return opcion.update({
            admin_id,
            texto,
            es_correcta: nombres[i] === es_correcta,
          });
        }
        return null;
      })
    );

    const opcionesActualizadas = await Opcion.findAll({ where: { pregunta_id } });

    res.status(200).json({
      ok: true,
      message: 'Opciones actualizadas exitosamente',
      opciones: opcionesActualizadas,
    });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Invalid pregunta_id' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const opcion = await Opcion.findByPk(id);
    if (!opcion) {
      return res.status(404).json({ error: 'opcion not found' });
    }

    await opcion.destroy();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  index,
  show,
  store,
  update,
  destroy,
};
