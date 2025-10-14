// server/routes/estadisticaRoutes.js

import estadisticasController from "../controllers/estadistica.controller.js";
import express from "express";

const router = express.Router();

router.get("/estadisticas", estadisticasController.index);

export default router;
