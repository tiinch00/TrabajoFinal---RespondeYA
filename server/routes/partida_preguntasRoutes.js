import express from "express";
import partidaPreguntasController from "../controllers/partidaPregunta.controller.js";

const router = express.Router();

router.get("/partida_preguntas", partidaPreguntasController.index);
router.get('/partida_preguntas/:id', partidaPreguntasController.show);
router.post('/partida_preguntas/create', partidaPreguntasController.store);
router.put('/partida_preguntas/:id', partidaPreguntasController.update);
router.delete('/partida_preguntas/:id', partidaPreguntasController.destroy);

export default router;
