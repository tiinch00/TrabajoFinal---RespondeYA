import { Jugador, User } from '../models/associations.js';

const index = async (req, res) => {
    try {
        const jugador = await Jugador.findAll();
        res.json(jugador);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error findAll()");
    }
};


const show = async (req, res) => {
    const { jugador_id } = req.params;
    try {
        const jugador = await Jugador.findByPk(jugador_id);
        if (!jugador) {
            return res.status(404).send("Jugador not found");
        }
        res.json(jugador);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error findByPk(id)");
    }
};


const store = async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
    }
    try {
        const user = await User.findByPk(user_id);
        // si no existe el usuario, se envia un error a la consola
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const jugador = await Jugador.create({ user_id });
        res.status(201).json(jugador);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: "user_id already exists" });
        }
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};


const update = async (req, res) => {
    const { jugador_id } = req.params;
    const { puntaje } = req.body;
    if (!puntaje) {
        return res.status(400).json({ error: "Puntaje is required" });
    }
    try {
        const jugador = await Jugador.findByPk(jugador_id);
        if (!jugador) {
            return res.status(404).send("Jugador not found");
        }

        await jugador.update({ puntaje });
        res.json(jugador);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: "jugador_id already exists" });
        }
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};

const destroy = async (req, res) => {
    const { jugador_id } = req.params;
    try {
        const jugador = await Jugador.findByPk(jugador_id);
        if (!jugador) {
            return res.status(404).send("User not found");
        }

        await jugador.destroy();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};

export default {
    index,
    show,
    store,
    update,
    destroy,
};
