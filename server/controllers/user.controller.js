import { User } from '../models/associations.js';
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import path from "path";

const uploadsDir = path.resolve(process.cwd(), "uploads", "fotos_perfil");
// ajustá si lo servís desde otra carpeta

const deleteSafe = async (absPath) => {
  try { await fs.unlink(absPath); } catch { /* si no existe, ignorar */ }
};

const index = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const store = async (req, res) => {
  const { name, email, password, pais } = req.body;
  if (!name || !email || !password || !pais) {
    return res.status(400).json({ error: 'Name, email, pais, and password are required' });
  }
  try {
    const user = await User.create({ name, email, pais, password });

    res.status(201).json(user);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name y email son requeridos' });
  }
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const payload = { name, email };
    if (typeof password === 'string' && password.trim()) {
      payload.password = password.trim();
    }

    await user.update(payload);
    const { password: _pw, ...safe } = user.toJSON();
    res.json(safe);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    await user.destroy();
    res.status(204).send(); // No content
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};

// POST /users/:id/foto
const updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    // multer pone el archivo en req.file si pasó filtros/limites
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió archivo 'foto' o tipo no permitido" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Construí la URL pública que servís desde /uploads
    // OJO: req.file.filename ya viene con el nombre final
    const publicUrl = `/uploads/fotos_perfil/${req.file.filename}`;

    await user.update({ foto_perfil: publicUrl });

    // devolvé solo lo necesario
    return res.json({
      ok: true,
      url: publicUrl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        foto_perfil: publicUrl,
      }
    });
  } catch (err) {
    console.error("updatePhoto error:", err);
    return res.status(500).json({ error: "Error subiendo foto" });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "id inválido" });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const rel = user.foto_perfil;               // ej: "/uploads/fotos_perfil/abc.jpg"
    if (!rel) return res.status(204).send();    // nada que borrar

    // Normalizá la ruta y asegurate que apunta al directorio esperado
    const filename = path.basename(rel);        // protege de traversal
    const abs = path.join(uploadsDir, filename);

    await deleteSafe(abs);

    await user.update({ foto_perfil: null });

    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /users/:id/foto", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  index,
  show,
  store,
  update,
  destroy,
  updatePhoto,
  deletePhoto,
};
