import sequelize from "./sequelize.js";
import { DataTypes } from "sequelize";

const SalaJugador = sequelize.define("SalaJugador", {
  id:{
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  sala_id:{
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  usuario_id:{
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  rol:{
    type: DataTypes.ENUM('creador','invitado'),
    allowNull: false,
  },
  joined_at:{
    type: DataTypes.DATE,               
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }

}, {
  tableName: "sala_jugadores",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ["sala_id", "usuario_id"], // UC (sala_id, usuario_id) Para que no este mismo jugador 2 veces en la misma sala.
    },
  ]
});

export default SalaJugador;