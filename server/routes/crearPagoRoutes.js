import express from 'express';
import crearOrden from '../controllers/crearOrden.controller.js';
const router = express.Router();

router.post('/crearOrden', crearOrden);

export default router;
