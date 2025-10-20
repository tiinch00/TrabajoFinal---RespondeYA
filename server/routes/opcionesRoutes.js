import express from "express";
import opcionesController from "../controllers/opcion.controller.js";

const router = express.Router();

router.get("/opciones", opcionesController.index);
router.get('/opciones/:id', opcionesController.show);
router.post('/opciones/create', opcionesController.store);
router.put('/opciones/:id', opcionesController.update);
router.delete('/opciones/:id', opcionesController.destroy);

export default router;
