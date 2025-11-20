// server/index.js

import 'dotenv/config';
import './models/associations.js';

import adminRoutes from './routes/adminRoutes.js';
import amigoRoutes from './routes/amigoRoutes.js';
import authRoutes from './routes/authRoutes.js';
import avataresRoutes from './routes/avataresRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import cors from 'cors';
import crearPagoRoutes from './routes/crearPagoRoutes.js';
import { crearSocketServer } from './sockets/index.js';
import estadisticaRoutes from './routes/estadisticaRoutes.js';
import express from 'express';
import { fileURLToPath } from "url";
import http from 'http';
import jugadorRoutes from './routes/jugadorRoutes.js';
import opcionesRoutes from './routes/opcionesRoutes.js';
import partidaJugadoresRoutes from './routes/partida_jugadoresRoutes.js';
import partidaPreguntasRoutes from './routes/partida_preguntasRoutes.js';
import partidasRoutes from './routes/partidasRoutes.js';
import path from "path";
import preguntasRoutes from './routes/preguntasRoutes.js';
import respuestasRoutes from './routes/respuestasRoutes.js';
import salaJugadoresRoutes from './routes/sala_jugadoresRoutes.js';
import salasRoutes from './routes/salasRoutes.js';
import sequelize from './models/sequelize.js';
import soapRoutes from './routes/soapRoutes.js';
import userAvataresRoutes from './routes/userAvataresRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const allowedOrigins = [
  "https://proyecto-respondeya.vercel.app",
  "https://respondeya.website",
  "http://localhost:5173",
];

// 1) CORS primero
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// 2) Luego JSON
app.use(express.json());

// 💓 Healthcheck
app.get("/health", (req, res) => res.status(200).send("ok"));
app.get("/env-check", (_req, res) => {
  res.json({ JWT_KEY: process.env.JWT_KEY ? "set" : "missing" });
});

// Rutas de la API
app.use('/auth', authRoutes);
app.use('/api/contactar', contactRoutes);
app.use('/admin', adminRoutes);
app.use('/api', crearPagoRoutes);
app.use('/api', soapRoutes);
app.use(userRoutes);
app.use(jugadorRoutes);
app.use(avataresRoutes);
app.use(userAvataresRoutes);
app.use(amigoRoutes);
app.use(categoryRoutes);
app.use(preguntasRoutes);
app.use(opcionesRoutes);
app.use(estadisticaRoutes);
app.use(partidasRoutes);
app.use(salasRoutes);
app.use(partidaJugadoresRoutes);
app.use(salaJugadoresRoutes);
app.use(partidaPreguntasRoutes);
app.use(respuestasRoutes);

// raíz rápida
app.get("/", (req, res) => res.status(200).json({ api: "RespondeYA OK" }));

const PORT = process.env.PORT || 3006;

// ⬇️ Crear servidor HTTP y Socket.IO sobre el mismo puerto
const server = http.createServer(app);

// Inicializa Socket.IO organizado por controllers
crearSocketServer(server); // ← listo, Socket.IO queda inicializado y organizado por “controllers”

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await sequelize.query('SELECT * FROM test_backend;');
    res.json(rows);
  } catch (error) {
    console.error('❌ Error en /test-db:', error);
    res.status(500).json({ error: error.message });
  }
});

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    //await sequelize.sync({ alter: true });
    console.log('✅ DB conectada y tablas sincronizadas');
    console.log('🔊 Levantando API en puerto:', PORT);
    //server.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
    /*
    La ruta /test-db funciona perfecto ✅
    Tu API se conecta a la misma RDS y a la base respondeya ✅
    Sequelize ve la tabla test_backend, así que la conexión a la DB está bien ✅
    O sea: lo de “Table 'respondeya.users' doesn't exist” ya no es un problema de conexión, sino que eran errores viejos en el log. Ahora estamos bien con la base
    */
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API escuchando en 0.0.0.0:${PORT}`);
    });
  } catch (e) {
    console.error('❌ Error de arranque:', e);
    process.exit(1);
  }
};

bootstrap();
