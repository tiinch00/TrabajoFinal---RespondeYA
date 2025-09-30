// server/routes/estadisticaRoutes.js

import { Estadistica, Jugador } from "../models/associations.js";

import { authMiddleware } from "./authMiddleware.js";
import express from "express";

const router = express.Router();

/** Público: lista todas (para probar rápido) */
router.get("/estadisticas", async (_req, res) => {
    const stats = await Estadistica.findAll({ order: [["id", "DESC"]] });
    res.json(stats);
});

/** Protegido: solo las del usuario logueado */
router.get("/estadisticas/mias", authMiddleware, async (req, res) => {
    // req.user viene de authMiddleware → es el User actual
    const jugador = await Jugador.findOne({ where: { user_id: req.user.id } });
    if (!jugador) return res.json([]);
    const stats = await Estadistica.findAll({
        where: { jugador_id: jugador.jugador_id },
        order: [["id", "DESC"]],
    });
    res.json(stats);
});

export default router;
