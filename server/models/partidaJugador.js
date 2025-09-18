import sequelize from "./sequelize.js";
import { DataTypes } from "sequelize";

const PartidaJugador = sequelize.define("PartidaJugador", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  partida_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
    usuario_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: "partida_jugadores",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ["partida_id", "usuario_id"],
    },
  ]
});


export default PartidaJugador;