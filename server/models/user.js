import sequelize from "./sequelize.js"; 
import { DataTypes } from "sequelize";
import Sala from './sala.js';
import Partida from './partida.js';
import Avatar from './avatar.js';


const User = sequelize.define('User',{
   id: { // si queremos, no declaramos id, sequelize lo crea automaticamente
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false //requiere que el campo sea no null
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true, //para que solo se pueda usar una vez el correo
    allowNull: false,
    validate: {
    isEmail: true // valida formato de correo
  }
  },
  password: {
    type:DataTypes.STRING(255),
    allowNull: false
  },
  puntaje: {
    type:DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  }


}, {
  tableName: "users",
  timestamps: true  
});

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.belongsToMany(Sala, {
  through: 'sala_jugadores',  // a travez de : 
  foreignKey: 'usuario_id',
  otherKey: 'sala_id'
});

User.belongsToMany(Partida, {
  through: "partida_jugadores",
  foreignKey: "usuario_id",
  otherKey: "partida_id"
});

User.belongsToMany(Avatar, {
  through: 'user_avatars',
  foreignKey: "usuario_id",
  otherKey: "avatar_id",
});

export default User;