// server/index.js

import "dotenv/config";

import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import cors from "cors";
import express from "express";
import http from "http";
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

// 💓 Healthcheck bien arriba
app.get("/health", (req, res) => res.status(200).send("ok"));
app.get("/env-check", (_req, res) => {
  res.json({ JWT_KEY: process.env.JWT_KEY ? "set" : "missing" });
});

const PORT = process.env.PORT || 3006;

// ⬇️ Crear servidor HTTP y Socket.IO sobre el mismo puerto
const server = http.createServer(app);
const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: false, // ← simplifica en dev
  },
});

// Eventos de Socket
io.on("connection", (socket) => {
  console.log("🔌 socket conectado:", socket.id, "conectados:", io.of("/").sockets.size);

  socket.on("chat:message", (msg, ack) => {
    console.log("📩 recibido en server:", msg, "conectados:", io.of("/").sockets.size);

    const payload = {
      id: msg?.clientId || Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      clientId: msg?.clientId || null,
      username: String(msg?.username || "anonymous"),
      text: String(msg?.text || ""),
      createdAt: new Date().toISOString(),
    };

    io.emit("chat:message", payload); // ← TODOS los clientes (incluye al emisor)
    if (typeof ack === "function") ack({ ok: true });
  });

});

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    //await sequelize.sync({ alter: true });
    console.log("✅ DB conectada y tablas sincronizadas");
    console.log("🔊 Levantando API en puerto:", PORT);
    server.listen(PORT, () =>
      console.log(`🚀 API en http://localhost:${PORT}`)
    );
  } catch (e) {
    console.error("❌ Error de arranque:", e);
    process.exit(1);
  }
};

bootstrap();