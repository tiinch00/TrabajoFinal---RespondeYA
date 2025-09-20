import sequelize from "./sequelize.js";
import { DataTypes } from "sequelize";



const Sala = sequelize.define("Sala", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,   
    primaryKey: true,
    autoIncrement: true,
  },
  codigo: {
    type: DataTypes.STRING(12),         
    allowNull: true,
    unique: true,
  },
  creador_id: {
    type: DataTypes.INTEGER.UNSIGNED,   
    allowNull: false,
  },
  categoria_id: {
    type: DataTypes.INTEGER.UNSIGNED,   
    allowNull: true,
  },
  max_jugadores: {
    type: DataTypes.TINYINT.UNSIGNED,   
    allowNull: false,
    defaultValue: 2,
    validate: {
      min: 2 
    }
  },
  estado: {
    type: DataTypes.ENUM("esperando", "en_curso", "cancelada"), // ENUM
    allowNull: false,
    defaultValue: "esperando",
  }
}, {
  tableName: "salas",
  timestamps: true,
  createdAt: "created_at",       // mapea createdAt → created_at
  updatedAt: false, 
});

export default Sala;
