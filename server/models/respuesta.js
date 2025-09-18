import sequelize from "./sequelize.js";
import { DataTypes } from "sequelize";
import User from "./user.js";
import Partida from "./partida.js";
import Pregunta from "./pregunta.js";
import PartidaPregunta from "./partidaPregunta.js";
import Opcion from "./opcion.js";
import Estadistica from "./estadistica.js";

const Respuesta = sequelize.define("Respuesta", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  partida_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  usuario_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  pregunta_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  partida_pregunta_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  opcion_elegida_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  estadistica_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  es_correcta: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  tiempo_respuesta_ms: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
}, {
  tableName: "respuestas",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ["partida_id", "usuario_id", "pregunta_id"], // una respuesta por jugador/pregunta
    },
  ],
});

// Relaciones
Respuesta.belongsTo(Partida, { 
  foreignKey: "partida_id", 
  onUpdate: "CASCADE", 
  onDelete: "CASCADE" 
});

Respuesta.belongsTo(User, { 
  foreignKey: "usuario_id", 
  onUpdate: "CASCADE", 
  onDelete: "CASCADE" 
});

Respuesta.belongsTo(Pregunta, { 
  foreignKey: "pregunta_id", 
  onUpdate: "CASCADE", 
  onDelete: "RESTRICT" 
});

Respuesta.belongsTo(PartidaPregunta, { 
  foreignKey: "partida_pregunta_id", 
  onUpdate: "CASCADE", 
  onDelete: "CASCADE" 
});

Respuesta.belongsTo(Opcion, { 
  foreignKey: "opcion_elegida_id", 
  onUpdate: "CASCADE", 
  onDelete: "RESTRICT" 
});

Respuesta.belongsTo(Estadistica, { 
  foreignKey: "estadistica_id", 
  onUpdate: "CASCADE", 
  onDelete: "CASCADE" 
});

export default Respuesta;
