import express from "express";
import jugadorController from "../controllers/jugador.controller.js";

const router = express.Router();

router.get("/jugadores", jugadorController.index);
router.get("/jugadores/:jugador_id", jugadorController.show);
// Actualiza puntaje por user_id (FK en tabla jugadores)
router.put("/jugadores/:user_id", jugadorController.updateByUserId);
router.put("/jugadores/update/:jugador_id", jugadorController.update);

export default router;