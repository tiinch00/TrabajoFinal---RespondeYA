// server/index.js

import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import cors from "cors";
import express from "express";
import sequelize from "./models/sequelize.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Middlewares base
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// 💓 Healthcheck bien arriba
app.get("/health", (req, res) => res.status(200).send("ok"));

app.get("/env-check", (_req, res) => {
  res.json({ JWT_KEY: process.env.JWT_KEY ? "set" : "missing" });
});

// Rutas de la API
app.use("/auth", authRoutes);
app.use("/api/contactar", contactRoutes);
app.use(userRoutes);
app.use(categoryRoutes);

// (Opcional) raíz para verificar rápido
app.get("/", (req, res) => res.status(200).json({ api: "RespondeYA OK" }));

const PORT = process.env.PORT || 3006;

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ DB conectada y tablas sincronizadas");
    console.log("🔊 Levantando API en puerto:", PORT);
    app.listen(PORT, () =>
      console.log(`🚀 API en http://localhost:${PORT}`)
    );
  } catch (e) {
    console.error("❌ Error de arranque:", e);
    process.exit(1);
  }
};

bootstrap();
