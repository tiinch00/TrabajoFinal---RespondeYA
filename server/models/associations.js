import Administrador from './Administrador.js';
import Amigo from './amigo.js';
import Avatar from './Avatar.js';
import Categoria from './Categoria.js';
import Estadistica from './Estadistica.js';
import Jugador from './Jugador.js';
import Opcion from './Opcion.js';
import Partida from './Partida.js';
import PartidaJugador from './PartidaJugador.js';
import PartidaPregunta from './PartidaPregunta.js';
import Pregunta from './Pregunta.js';
import Respuesta from './Respuesta.js';
import Sala from './Sala.js';
import SalaJugador from './SalaJugador.js';
import User from './User.js';
import UserAvatar from './UserAvatar.js';
import bcrypt from 'bcrypt';

// USER HERENCIA - Administrador - 1:1
User.hasOne(Administrador, {
  foreignKey: 'user_id',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
});

Administrador.belongsTo(User, {
  foreignKey: 'user_id',
});

// admin crea avatares
Administrador.hasMany(Avatar, { foreignKey: 'admin_id' }); // 1:N
Avatar.belongsTo(Administrador, { foreignKey: 'admin_id' });

// admin crea categorias
Administrador.hasMany(Categoria, { foreignKey: 'admin_id' }); // 1:N
Categoria.belongsTo(Administrador, { foreignKey: 'admin_id' });

// admin crea preguntas
Administrador.hasMany(Pregunta, { foreignKey: 'admin_id' }); // 1:N
Pregunta.belongsTo(Administrador, { foreignKey: 'admin_id' });

// admin crea opciones de respuestas
Administrador.hasMany(Opcion, { foreignKey: 'admin_id' }); // 1:N
Opcion.belongsTo(Administrador, { foreignKey: 'admin_id' });

// USER HERENCIA - Jugador - 1:1
User.hasOne(Jugador, {
  foreignKey: 'user_id',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
});

Jugador.belongsTo(User, {
  foreignKey: 'user_id',
});

//USER - Password
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// Jugador
Jugador.belongsToMany(Sala, {
  // N:M
  through: SalaJugador,
  foreignKey: 'jugador_id',
  otherKey: 'sala_id',
});

Jugador.belongsToMany(Partida, {
  // N:M
  through: PartidaJugador,
  foreignKey: 'jugador_id',
  otherKey: 'partida_id',
});

Jugador.belongsToMany(Avatar, {
  // N:M
  through: UserAvatar,
  foreignKey: 'jugador_id',
  otherKey: 'avatar_id',
});

Jugador.hasMany(Estadistica, { foreignKey: 'jugador_id' }); // 1:N

Jugador.hasMany(Respuesta, { foreignKey: 'jugador_id' }); // 1:N

//AMIGO
Amigo.belongsTo(Jugador, { as: 'usuario', foreignKey: 'jugador_id' });
Amigo.belongsTo(Jugador, { as: 'amigo', foreignKey: 'amigo_id' });

//AVATAR
Avatar.belongsToMany(Jugador, {
  // N:M
  through: 'user_avatars',
  foreignKey: 'avatar_id',
  otherKey: 'jugador_id',
});

//SALA
Sala.belongsTo(Categoria, {
  // 1:1
  foreignKey: 'categoria_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

Sala.belongsToMany(Jugador, {
  // N:M
  through: SalaJugador,
  foreignKey: 'sala_id',
  otherKey: 'jugador_id',
});

//ESTADISTICA
Estadistica.belongsTo(Jugador, {
  // 1:1
  foreignKey: 'jugador_id',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT',
});

Estadistica.belongsTo(Partida, {
  foreignKey: 'partida_id',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT',
});

//OPCION
Opcion.belongsTo(Pregunta, { foreignKey: 'pregunta_id' });

//PARTIDA
Partida.belongsTo(Sala, {
  foreignKey: 'sala_id',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT',
});

Partida.belongsTo(Categoria, {
  foreignKey: 'categoria_id',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

Partida.belongsToMany(Pregunta, {
  through: PartidaPregunta,
  foreignKey: 'partida_id',
  otherKey: 'pregunta_id',
});

//categoria

Categoria.hasMany(Pregunta, { foreignKey: 'categoria_id' });
//PREGUNTA

Pregunta.belongsToMany(Partida, {
  through: PartidaPregunta, // solo el nombre de la tabla
  foreignKey: 'pregunta_id',
  otherKey: 'partida_id',
});

Pregunta.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'Categoria' });

Pregunta.hasMany(Opcion, { foreignKey: 'pregunta_id', as: 'Opciones' });

//RESPUESTA
Respuesta.belongsTo(Partida, {
  foreignKey: 'partida_id',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
});

Respuesta.belongsTo(Jugador, {
  foreignKey: 'jugador_id',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
});

Respuesta.belongsTo(Pregunta, {
  foreignKey: 'pregunta_id',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT',
});

Respuesta.belongsTo(PartidaPregunta, {
  foreignKey: 'partida_pregunta_id',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
});

Respuesta.belongsTo(Opcion, {
  foreignKey: 'opcion_elegida_id',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT',
});

Respuesta.belongsTo(Estadistica, {
  foreignKey: 'estadistica_id',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
});

export {
  User,
  Jugador,
  Administrador,
  Amigo,
  Categoria,
  Avatar,
  Estadistica,
  Opcion,
  Partida,
  PartidaJugador,
  PartidaPregunta,
  Pregunta,
  Respuesta,
  Sala,
  SalaJugador,
  UserAvatar,
};
