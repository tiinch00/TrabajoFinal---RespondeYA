import sequelize from "./sequelize.js"; 
import { DataTypes } from "sequelize";


const User = sequelize.define('User',{
   id: { // si queremos, no declaramos id, sequelize lo crea automaticamente
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false //requiere que el campo sea no null
  },
  email: {
    type: DataTypes.STRING,
    // unique: true, //para que solo se pueda usar una vez el correo
    allowNull: false,
    validate: {
    isEmail: true // valida formato de correo
  }
  },
  password: {
    type:DataTypes.STRING,
    allowNull: false
  },
  puntaje: {
    type:DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }


}, {
  tableName: "users", //hace referencia a la tabla en al bd
  timestamps: true  // para que tenga cuando se creo y cuando se modifico
});


export default User;