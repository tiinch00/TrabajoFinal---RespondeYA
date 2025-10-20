import express from "express";
import partidaJugadoresController from "../controllers/partidaJugador.controller.js";

const router = express.Router();

router.get("/partida_jugadores", partidaJugadoresController.index);
router.get('/partida_jugadores/:id', partidaJugadoresController.show);
router.post('/partida_jugadores/create', partidaJugadoresController.store);
router.put('/partida_jugadores/:id', partidaJugadoresController.update);
router.delete('/partida_jugadores/:id', partidaJugadoresController.destroy);

export default router;
