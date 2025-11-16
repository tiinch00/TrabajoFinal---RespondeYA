// routes/userRoutes.js

import express from "express";
import { uploadFotoPerfil } from "../middlewares/upload.js";
import userController from "../controllers/user.controller.js";

const router = express.Router();

router.get("/users", userController.index);
router.get("/users/:id", userController.show);
// router.post("/users", userController.store);
router.put("/users/:id", userController.update);

// subir/actualizar foto de perfil
router.post("/users/:id/foto", uploadFotoPerfil, userController.updatePhoto);
router.put("/users/:id/avatar", userController.setAvatar);
// borrar foto de perfil
router.delete("/users/:id/foto", userController.deletePhoto);

// router.delete("/users/:id", userController.destroy);

export default router;
