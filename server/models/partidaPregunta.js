import sequelize from "./sequelize.js";
import { DataTypes } from "sequelize";

const PartidaPregunta = sequelize.define("PartidaPregunta", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  partida_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },  
  pregunta_id  : {
  type: DataTypes.INTEGER.UNSIGNED,
   allowNull: false
  },
   orden: {
   type: DataTypes.TINYINT.UNSIGNED,
   allowNull: false
  },  
  question_text_copy: {
  type: DataTypes.TEXT,
  allowNull: true
  },
  correct_option_id_copy:{
  type: DataTypes.INTEGER.UNSIGNED,
  allowNull: true
  },
  correct_option_text_copy: { type: DataTypes.STRING(255),
  allowNull: true
  },
}, {
  tableName: "partida_preguntas",
  timestamps: false,
  indexes: [
  {
    unique: true,
    fields: ["partida_id", "orden"]
  }
]
});

export default PartidaPregunta;