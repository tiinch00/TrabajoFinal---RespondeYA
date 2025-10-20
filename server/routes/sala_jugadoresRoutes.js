import express from "express";
import salaJugadoresController from "../controllers/salaJugador.controller.js";

const router = express.Router();

router.get("/sala_jugadores", salaJugadoresController.index);
router.get('/sala_jugadores/:id', salaJugadoresController.show);
router.post('/sala_jugadores/create', salaJugadoresController.store);
router.put('/sala_jugadores/:id', salaJugadoresController.update);
router.delete('/sala_jugadores/:id', salaJugadoresController.destroy);

export default router;
