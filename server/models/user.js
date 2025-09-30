import { DataTypes } from "sequelize";
import sequelize from "./sequelize.js";

const User = sequelize.define('User',{
   id: { // si queremos, no declaramos id, sequelize lo crea automaticamente
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  role: {
    type: DataTypes.ENUM('jugador', 'administrador'),
    allowNull: false
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
}, {
  tableName: "users",
  timestamps: true,  
  underscored: true
});

export default User;