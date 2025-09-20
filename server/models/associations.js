import User from "./user.js";
import Amigo from './amigo.js'
import Categoria from "./categoria.js";
import Avatar from "./avatar.js";
import Estadistica from "./estadistica.js";
import Opcion from "./opcion.js";
import Partida from "./partida.js";
import PartidaJugador from "./partidaJugador.js";
import PartidaPregunta from "./partidaPregunta.js";
import Pregunta from "./pregunta.js";
import Respuesta from "./respuesta.js";
import Sala from "./sala.js";
import SalaJugador from "./salaJugador.js";
import UserAvatar from "./userAvatar.js";
import bcrypt from "bcrypt";


//USER
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.belongsToMany(Sala, {
  through: SalaJugador,  // a travez de : 
  foreignKey: 'usuario_id',
  otherKey: 'sala_id'
});

User.belongsToMany(Partida, {
  through: PartidaJugador,
  foreignKey: "usuario_id",
  otherKey: "partida_id"
});

User.belongsToMany(Avatar, {
  through: UserAvatar,
  foreignKey: "usuario_id",
  otherKey: "avatar_id",
});


//AMIGO
Amigo.belongsTo(User, { as: 'usuario', foreignKey: 'usuario_id' });
Amigo.belongsTo(User, { as: 'amigo', foreignKey: 'amigo_id' });


//AVATAR
Avatar.belongsToMany(User, {
  through: 'user_avatars',
  foreignKey: "avatar_id",
  otherKey: "usuario_id",
});



//SALA
Sala.belongsTo(Categoria, {
  foreignKey: "categoria_id",
  onUpdate: "CASCADE",
  onDelete: "SET NULL",
});

Sala.belongsToMany(User, {
  through: SalaJugador,  
  foreignKey: 'sala_id',
  otherKey: 'usuario_id'
});

//ESTADISTICA
Estadistica.belongsTo(User, { 
  foreignKey: "usuario_id", 
  onUpdate: "CASCADE", 
  onDelete: "RESTRICT" 
});

Estadistica.belongsTo(Partida, { 
  foreignKey: "partida_id", 
  onUpdate: "CASCADE", 
  onDelete: "RESTRICT" 
});

//OPCION
Opcion.belongsTo(Pregunta, { foreignKey: 'pregunta_id' });



//PARTIDA
Partida.belongsTo(User, { 
  foreignKey: 'usuario_id', 
  onUpdate: 'CASCADE', 
  onDelete: 'RESTRICT' 
})

Partida.belongsTo(Sala, { 
  foreignKey: 'sala_id', 
  onUpdate: 'CASCADE', 
  onDelete: 'RESTRICT' 
});

Partida.belongsTo(Categoria, { 
  foreignKey: 'categoria_id', 
  onUpdate: 'CASCADE', 
  onDelete: 'SET NULL' 
});

Partida.belongsToMany(Pregunta, {
  through: PartidaPregunta,
  foreignKey: "partida_id",
  otherKey: "pregunta_id"
});

//PREGUNTA

Pregunta.belongsToMany(Partida, {
  through: PartidaPregunta,  // solo el nombre de la tabla
  foreignKey: 'pregunta_id',
  otherKey: 'partida_id'
});

Pregunta.belongsTo(Categoria, { foreignKey: 'categoria_id' });


//RESPUESTA
Respuesta.belongsTo(Partida, { 
  foreignKey: "partida_id", 
  onUpdate: "CASCADE", 
  onDelete: "CASCADE" 
});

Respuesta.belongsTo(User, { 
  foreignKey: "usuario_id", 
  onUpdate: "CASCADE", 
  onDelete: "CASCADE" 
});

Respuesta.belongsTo(Pregunta, { 
  foreignKey: "pregunta_id", 
  onUpdate: "CASCADE", 
  onDelete: "RESTRICT" 
});

Respuesta.belongsTo(PartidaPregunta, { 
  foreignKey: "partida_pregunta_id", 
  onUpdate: "CASCADE", 
  onDelete: "CASCADE" 
});

Respuesta.belongsTo(Opcion, { 
  foreignKey: "opcion_elegida_id", 
  onUpdate: "CASCADE", 
  onDelete: "RESTRICT" 
});

Respuesta.belongsTo(Estadistica, { 
  foreignKey: "estadistica_id", 
  onUpdate: "CASCADE", 
  onDelete: "CASCADE" 
});


export {
  User,
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
  UserAvatar
};
