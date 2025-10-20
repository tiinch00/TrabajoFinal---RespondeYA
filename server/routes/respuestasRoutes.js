import express from "express";
import respuestasController from "../controllers/repuesta.controller.js";

const router = express.Router();

router.get("/respuestas", respuestasController.index);
router.get('/respuestas/:id', respuestasController.show);
router.post('/respuestas/create', respuestasController.store);
router.put('/respuestas/:id', respuestasController.update);
router.delete('/respuestas/:id', respuestasController.destroy);

export default router;
