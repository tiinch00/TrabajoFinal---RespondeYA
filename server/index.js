// index.js
import express from "express";
import cors from "cors";
import sequelize from "./models/sequelize.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js"; 
import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
//import "./models/User.js"; // Asegura registrar el modelo

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true })); // Vite
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api/contactar", contactRoutes);
app.use(userRoutes);
app.use(categoryRoutes)


const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // crea/ajusta tablas
    console.log("✅ DB conectada y tablas sincronizadas");
    app.listen(process.env.PORT || 3000, () =>
      console.log(`🚀 API en http://localhost:${process.env.PORT || 3000}`)
    );
  } catch (e) {
    console.error("❌ Error de arranque:", e);
    process.exit(1);
  }
};

bootstrap();
