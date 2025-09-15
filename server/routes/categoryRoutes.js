// routes/categoryRoutes.js
import express from "express";
import categoriasController from "../controllers/categorias.controller.js";

const router = express.Router();

router.get("/categorias", categoriasController.index);
router.get("/categorias/:id", categoriasController.show);
router.post("/categorias", categoriasController.store);
router.put("/categorias/:id", categoriasController.update);
router.delete("/categorias/:id", categoriasController.destroy);

export default router;
