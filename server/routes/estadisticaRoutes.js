// server/routes/estadisticaRoutes.js

import estadisticasController from '../controllers/estadistica.controller.js';
import express from 'express';

const router = express.Router();

router.get('/estadisticas', estadisticasController.index);
router.post('/estadisticas/create', estadisticasController.store);
router.get('/estadisticas/:id', estadisticasController.show);
router.put('/estadisticas/:id', estadisticasController.update);

export default router;
