import express from 'express';
import categoriasController from '../controllers/categoria.controller.js';
import preguntaController from '../controllers/pregunta.controller.js';
import opcionController from '../controllers/opcion.controller.js';

const router = express.Router();
//categorias
router.get('/categorias', categoriasController.index);
router.get('/categoria/:id', categoriasController.show);
router.post('/categoria/create', categoriasController.store);
router.put('/categoria/:id/edit', categoriasController.update);
router.delete('/categoria/:id/delete', categoriasController.destroy);
//preguntas
router.get('/categoria/:nombre/:id/preguntas', preguntaController.index);
//router.get('/categoria/:id/preguntas/options', preguntaController.indexWithOptions);
router.post('/categoria/:id/preguntas/create', preguntaController.store);
router.put(
  '/categoria/:nombre/:categoria_id/pregunta/:pregunta_id/edit',
  preguntaController.update
);
router.delete(
  '/categoria/:nombre/:categoria_id/pregunta/:pregunta_id/delete',
  preguntaController.destroy
);

//opciones
router.get('/categoria/:nombre/:id/pregunta/:id/opciones', opcionController.index);
router.post(
  '/categoria/:nombre/:categoria_id/pregunta/:pregunta_id/opciones/crear',
  opcionController.store
);

router.put(
  '/categoria/:nombre/:categoria_id/pregunta/:pregunta_id/opciones/edit',
  opcionController.update
);

export default router;
