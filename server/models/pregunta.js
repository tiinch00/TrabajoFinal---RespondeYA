import sequelize from "../config/sequelize.js";
import { DataTypes } from "sequelize";
import Categoria from "./categoria.js"; 
import Partida from './partida.js';

const Pregunta = sequelize.define('Pregunta', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,  // UNSIGNED
    primaryKey: true,
    autoIncrement: true
  },
  categoria_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  enunciado: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  dificultad: {
    type: DataTypes.ENUM('facil','normal','dificil'),
    allowNull: true
  }
}, {
  tableName: "preguntas",
  timestamps: true,              // activa createdAt y updatedAt
  createdAt: "created_at",       // mapea a la columna de la BD
  updatedAt: "updated_at"        // mapea a la columna de la BD
});


Pregunta.belongsTo(Categoria, { foreignKey: 'categoria_id' });

Pregunta.belongsToMany(Partida, {
  through: 'partida_preguntas',  // solo el nombre de la tabla
  foreignKey: 'pregunta_id',
  otherKey: 'partida_id'
});
export default Pregunta;
