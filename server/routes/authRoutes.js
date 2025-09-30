import 'dotenv/config';

import Jugador from '../models/Jugador.js';
import User from '../models/user.js';
import { authMiddleware } from '../routes/authMiddleware.js';
import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { usuario, email, password } = req.body;
    const role = 'jugador'; // default de registrar un usuario
    // Validaciones mínimas
    if (!usuario) return res.status(400).json({ error: 'El usuario es obligatorio' });
    if (!email) return res.status(400).json({ error: 'El email es obligatorio' });
    if (!password) return res.status(400).json({ error: 'La contraseña es obligatoria' });
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email ya registrado' });

    // crea el obj User
    const newUser = await User.create({
      role,
      name: usuario,
      email,
      password,
    });

    // verifica si el user es un Jugador
    if (newUser) {
      // crea el registro para 1:1 en jugadores
      await Jugador.create({ user_id: newUser.id });
    }

    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'El email es obligatorio' });
    if (!password) return res.status(400).json({ error: 'La contraseña es obligatoria' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario inexistente' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Password no coincide' });

    const JWT_SECRET = process.env.JWT_KEY || process.env.JWT_SECRET;
    if (!JWT_SECRET)
      return res.status(500).json({ error: 'JWT_KEY no configurada en el servidor' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '3h' });
    const { id, name, email: mail } = user;

    return res.status(200).json({
      token,
      user: { id, name, email: mail, role: user.role },
    });
  } catch (err) {
    console.error('LOGIN ERR:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
});
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

export default router;
