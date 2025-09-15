//CREATE TABLE categorias (
//   id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
//   nombre      VARCHAR(100) NOT NULL UNIQUE,
//   descripcion VARCHAR(255) NOT NULL UNIQUE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



import sequelize from "./sequelize.js"; 
import { DataTypes } from "sequelize";




const Categoria = sequelize.define('Categoria',{
   id: { // si queremos, no declaramos id, sequelize lo crea automaticamente
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false //requiere que el campo sea no null
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
   
  }
}, {
  tableName: "categorias", //hace referencia a la tabla en al bd
  timestamps: true  // para que tenga cuando se creo y cuando se modifico
});


export default Categoria;