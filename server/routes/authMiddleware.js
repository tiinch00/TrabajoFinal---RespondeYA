import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers['authorization'];
    if (!header) return res.status(401).json({ error: 'Token requerido' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email'],
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
