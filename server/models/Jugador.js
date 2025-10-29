import { DataTypes } from "sequelize";
import sequelize from "./sequelize.js";

const Jugador = sequelize.define("Jugador", {
  jugador_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true, // ← 1:1 con users
    references: { model: "users", key: "id" },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  puntaje: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  ruleta_started_at: { 
    type: DataTypes.DATE,
    allowNull: true ,
    defaultValue: null,
  },
  // otros campos específicos del jugador...
}, {
  tableName: "jugadores",
  timestamps: true,  
  underscored: true
});

export default Jugador;
