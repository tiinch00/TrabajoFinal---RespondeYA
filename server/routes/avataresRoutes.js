import avatarController from "../controllers/avatar.controller.js";
import express from "express";

const router = express.Router();

router.get("/avatar", avatarController.index);

export default router;