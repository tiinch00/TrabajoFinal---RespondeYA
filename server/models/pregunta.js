import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const Pregunta = sequelize.define(
  'Pregunta',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED, // UNSIGNED
      primaryKey: true,
      autoIncrement: true,
    },
    categoria_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    admin_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    enunciado: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    enunciado_en: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dificultad: {
      type: DataTypes.ENUM('facil', 'normal', 'dificil'),
      allowNull: true,
    },
  },
  {
    tableName: 'preguntas',
    timestamps: true, // activa createdAt y updatedAt
    createdAt: 'created_at', // mapea a la columna de la BD
    updatedAt: 'updated_at', // mapea a la columna de la BD
  }
);

export default Pregunta;
