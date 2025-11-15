import amigoController from "../controllers/amigo.controller.js";
import express from "express";

const router = express.Router();

router.get("/amigos", amigoController.index);
router.get("/amigos/:id", amigoController.show);
router.post("/amigos/create", amigoController.store);
router.put("/amigos/:id", amigoController.update);
router.delete("/amigos/eliminar/:id", amigoController.destroy);

export default router;