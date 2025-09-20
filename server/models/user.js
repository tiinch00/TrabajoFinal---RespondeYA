import sequelize from "./sequelize.js"; 
import { DataTypes } from "sequelize";

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

export default User;