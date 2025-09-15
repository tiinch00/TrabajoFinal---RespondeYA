import "dotenv/config";

import { Op } from "sequelize";
import User from '../models/user.js'
import { authMiddleware } from "../routes/authMiddleware.js";
import bcrypt from 'bcrypt'
import express from 'express';
import jwt from "jsonwebtoken";

const router = express.Router();


router.post('/register', async (req, res) => {
  try {
    const { usuario, email, password } = req.body;
    // Validaciones mínimas
    if (!usuario || !email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email ya registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: usuario,
      email,
      password: hashedPassword
    });
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body; // email puede ser email o username
    if (!email || !password) return res.status(400).json({ error: "Faltan datos" });

    const exists = await User.findOne({ where: { [Op.or]: [{ email }, { name: email }] } });
    if (!exists) return res.status(404).json({ error: "Usuario inexistente" });

    const ok = await bcrypt.compare(password, exists.password);
    if (!ok) return res.status(401).json({ error: "Password no coincide" });

    const JWT_SECRET = process.env.JWT_KEY || process.env.JWT_SECRET;
    if (!JWT_SECRET) return res.status(500).json({ error: "JWT_KEY no configurada en el servidor" });

    const token = jwt.sign({ id: exists.id }, JWT_SECRET, { expiresIn: "3h" });
    return res.status(200).json({ token });
  } catch (err) {
    console.error("LOGIN ERR:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

router.get("/me", authMiddleware, (req, res) => {
  res.json(req.user);
});



export default router;