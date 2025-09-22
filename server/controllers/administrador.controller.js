import { Administrador, User } from '../models/associations.js';

const index = async (req, res) => {
    try {
        const administrador = await Administrador.findAll();
        res.json(administrador);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};


const show = async (req, res) => {
    const { admin_id } = req.params;
    try {
        const administrador = await Administrador.findByPk(admin_id);
        if (!administrador) {
            return res.status(404).send("User not found");
        }
        res.json(administrador);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};


const store = async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: "User_id is required" });
    }
    try {
        const user = await User.findByPk(user_id);
        // si no existe el usuario, se envia un error a la consola
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const administrador = await Administrador.create({ user_id });

        res.status(201).json(administrador);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: "Email already exists" });
        }
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};

/*
const update = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).send("User not found");
        }

        await user.update({ name, email, password });
        res.json(user);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: "Email already exists" });
        }
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};*/

const destroy = async (req, res) => {
    const { admin_id } = req.params;
    try {
        const administrador = await Administrador.findByPk(admin_id);
        if (!administrador) {
            return res.status(404).send("User not found");
        }

        await administrador.destroy();
        res.status(204).send(); // No content
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};

export default {
    index,
    show,
    store,
    //update,
    destroy,
};
