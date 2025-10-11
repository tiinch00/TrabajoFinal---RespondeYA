import express from "express";
import userAvatarController from "../controllers/userAvatar.controller.js";

const router = express.Router();

router.get("/userAvatar", userAvatarController.index);
router.get("/userAvatar/:id", userAvatarController.show);
router.post("/userAvatar/", userAvatarController.store);

export default router;