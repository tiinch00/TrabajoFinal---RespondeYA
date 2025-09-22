import { DataTypes } from "sequelize";
import sequelize from "./sequelize.js";

const Estadistica = sequelize.define("Estadistica", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  jugador_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  partida_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  posicion: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  puntaje_total: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  total_correctas: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  total_incorrectas: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  tiempo_total_ms: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: "estadisticas",
  timestamps: false,
});

export default Estadistica;
