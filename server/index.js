// index.js

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from './routes/categoryRoutes.js'
import contactRoutes from "./routes/contactRoutes.js";
import cors from "cors";
import express from "express";
import sequelize from "./models/sequelize.js";
import userRoutes from './routes/userRoutes.js'

//import "./models/User.js"; // Asegura registrar el modelo

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // Vite

// rutas
app.use("/auth", authRoutes);
app.use("/api/contactar", contactRoutes);
app.use(userRoutes);
app.use(categoryRoutes)

// Arranque + test de DB
const PORT = process.env.PORT || 3006;

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // crea/ajusta tablas
    console.log("✅ DB conectada y tablas sincronizadas");
    app.listen(PORT, () =>
      console.log(`🚀 API en http://localhost:${PORT}`)
    );
  } catch (e) {
    console.error("❌ Error de arranque:", e);
    process.exit(1);
  }
};

bootstrap();
