import express from "express";
import jugadorController from "../controllers/jugador.controller.js";

const router = express.Router();

// Actualiza puntaje por user_id (FK en tabla jugadores)
router.put("/jugadores/:user_id", jugadorController.updateByUserId);

export default router;