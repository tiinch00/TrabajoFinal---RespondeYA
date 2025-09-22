import { DataTypes } from "sequelize";
import sequelize from "./sequelize.js";

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  admin_id: {
    type: DataTypes.INTEGER.UNSIGNED, allowNull: false
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