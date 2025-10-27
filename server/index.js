// server/index.js

import 'dotenv/config';
import './models/associations.js';

import { Server } from 'socket.io';
import adminRoutes from './routes/adminRoutes.js';
import amigoRoutes from './routes/amigoRoutes.js';
import authRoutes from './routes/authRoutes.js';
import avataresRoutes from './routes/avataresRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import cors from 'cors';
import estadisticaRoutes from './routes/estadisticaRoutes.js';
import express from 'express';
import http from 'http';
import jugadorRoutes from './routes/jugadorRoutes.js';
import opcionesRoutes from './routes/opcionesRoutes.js';
import partidaJugadoresRoutes from './routes/partida_jugadoresRoutes.js';
import partidaPreguntasRoutes from './routes/partida_preguntasRoutes.js';
import partidasRoutes from './routes/partidasRoutes.js';
import preguntasRoutes from './routes/preguntasRoutes.js';
import respuestasRoutes from './routes/respuestasRoutes.js';
import salaJugadoresRoutes from './routes/sala_jugadoresRoutes.js';
import salasRoutes from './routes/salasRoutes.js';
import sequelize from './models/sequelize.js';
import userAvataresRoutes from './routes/userAvataresRoutes.js';
import userRoutes from './routes/userRoutes.js';
import crearPagoRoutes from './routes/crearPagoRoutes.js';
import soapRoutes from './routes/soapRoutes.js';

const app = express();

// Middlewares base
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// 💓 Healthcheck bien arriba
app.get('/health', (req, res) => res.status(200).send('ok'));

app.get('/env-check', (_req, res) => {
  res.json({ JWT_KEY: process.env.JWT_KEY ? 'set' : 'missing' });
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

// (Opcional) raíz para verificar rápido
app.get('/', (req, res) => res.status(200).json({ api: 'RespondeYA OK' }));

// 💓 Healthcheck bien arriba
app.get('/health', (req, res) => res.status(200).send('ok'));
app.get('/env-check', (_req, res) => {
  res.json({ JWT_KEY: process.env.JWT_KEY ? 'set' : 'missing' });
});

const PORT = process.env.PORT || 3006;

// ⬇️ Crear servidor HTTP y Socket.IO sobre el mismo puerto
const server = http.createServer(app);
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
    credentials: false, // ← simplifica en dev
  },
});

// Eventos de Socket - y conexion con el socket
io.on('connection', (socket) => {
  console.log('🔌 socket conectado:', socket.id, 'conectados:', io.of('/').sockets.size);

  // obtiene el mensaje a traves de la variable "chat:message"
  socket.on('chat:message', (msg, ack) => {
    console.log('📩 recibido en server:', msg, 'conectados:', io.of('/').sockets.size);

    // se almacena la info del propietario del mensaje en un objeto
    const payload = {
      id: msg?.clientId || Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      clientId: msg?.clientId || null,
      username: String(msg?.username || 'anonymous'),
      text: String(msg?.text || ''),
      createdAt: new Date().toISOString(),
    };

    // se emite y todos los usuario puedes ver el mensaje de un usario y incluye al emisor
    io.emit('chat:message', payload);
    if (typeof ack === 'function') ack({ ok: true });
  });
});

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    //await sequelize.sync({ alter: true });
    console.log('✅ DB conectada y tablas sincronizadas');
    console.log('🔊 Levantando API en puerto:', PORT);
    server.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
  } catch (e) {
    console.error('❌ Error de arranque:', e);
    process.exit(1);
  }
};

bootstrap();
