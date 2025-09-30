// routes/userRoutes.js

import express from "express";
import userController from "../controllers/user.controller.js";

const router = express.Router();

router.get("/users", userController.index);
router.get("/users/:id", userController.show);
// router.post("/users", userController.store);
router.put("/users/:id", userController.update);
// router.delete("/users/:id", userController.destroy);

export default router;
