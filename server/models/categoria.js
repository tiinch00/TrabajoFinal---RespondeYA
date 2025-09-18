import sequelize from "./sequelize.js"; 
import { DataTypes } from "sequelize";

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100), 
    allowNull: false,
    unique: true 
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true 
  }
}, {
  tableName: "categorias",
  timestamps: false 
});

export default Categoria;