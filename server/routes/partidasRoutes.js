import express from "express";
import partidasController from "../controllers/partida.controller.js";

const router = express.Router();

router.get("/partidas", partidasController.index);
router.get('/partidas/:id', partidasController.show);
router.post('/partidas/create', partidasController.store);
router.put('/partidas/:id', partidasController.update);
router.delete('/partidas/:id', partidasController.destroy);

export default router;
