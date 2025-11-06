import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const Respuesta = sequelize.define(
  'Respuesta',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    partida_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    jugador_id: {
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
      allowNull: true,
    },
    estadistica_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    es_correcta: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
    tiempo_respuesta_ms: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: 'respuestas',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['partida_id', 'jugador_id', 'pregunta_id'], // una respuesta por jugador/pregunta
      },
    ],
  }
);

export default Respuesta;
