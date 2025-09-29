// routes/categoryRoutes.js
import express from 'express';
import categoriasController from '../controllers/categoria.controller.js';

const router = express.Router();

router.get('/categorias', categoriasController.index);
router.get('/categorias/:id', categoriasController.show);
router.get('/categorias/nombre/:nombre', categoriasController.showByName);
router.post('/categorias', categoriasController.store);
router.put('/categorias/:id', categoriasController.update);
router.delete('/categorias/:id', categoriasController.destroy);

export default router;
