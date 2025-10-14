import amigoController from "../controllers/amigo.controller.js";
import express from "express";

const router = express.Router();

router.get("/amigos", amigoController.index);
router.delete("/amigos/eliminar/:id", amigoController.destroy);

export default router;