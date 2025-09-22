import { DataTypes } from "sequelize";
import sequelize from "./sequelize.js";

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
  jugador_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: "partida_jugadores",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ["partida_id", "jugador_id"],
    },
  ]
});


export default PartidaJugador;