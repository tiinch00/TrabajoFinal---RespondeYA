import express from 'express';
import jugadorController from '../controllers/jugador.controller.js';

const router = express.Router();

router.get('/jugadores', jugadorController.index);
router.get('/jugadores/:jugador_id', jugadorController.show);
router.put('/jugadores/update/:jugador_id', jugadorController.update);

router.get('jugador/:user_id', jugadorController.showUser);

export default router;
