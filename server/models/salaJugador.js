import { DataTypes } from "sequelize";
import sequelize from "./sequelize.js";

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
  jugador_id:{
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
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
      name: 'uc_sj_unico',
      unique: true,
      fields: ["sala_id", "jugador_id"], // UC (sala_id, jugador_id) Para que no este mismo jugador 2 veces en la misma sala.
    },
  ]
});

export default SalaJugador;