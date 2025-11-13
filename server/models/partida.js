import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const Partida = sequelize.define(
  'Partida',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    sala_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      unique: true,
    },
    categoria_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    modo: {
      type: DataTypes.ENUM('individual', 'multijugador'),
      allowNull: false,
    },
    total_preguntas: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
    },
    dificultad_tiempo: {
      type: DataTypes.ENUM('facil', 'normal', 'dificil'),
      allowNull: true,
    },
    dificultad_pregunta: {
      type: DataTypes.ENUM('facil', 'normal', 'dificil'),
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'en_curso', 'finalizada', 'abandonada'),
      allowNull: false,
      defaultValue: 'en_curso',
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    ended_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'partidas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default Partida;
