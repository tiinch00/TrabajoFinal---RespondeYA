import express from "express";
import salasController from "../controllers/sala.controller.js";

const router = express.Router();

router.get("/salas", salasController.index);
router.get('/salas/:id', salasController.show);
router.post('/salas/create', salasController.store);
router.put('/salas/:id', salasController.update);
router.delete('/salas/:id', salasController.destroy);

export default router;
