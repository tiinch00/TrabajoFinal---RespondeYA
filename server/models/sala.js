// CREATE TABLE salas (
//   id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
//   codigo         VARCHAR(12) NULL UNIQUE,
//   creador_id     INT UNSIGNED NOT NULL,
//   categoria_id   INT UNSIGNED NULL,   -- si la sala fija categoría
//   max_jugadores  TINYINT UNSIGNED NOT NULL DEFAULT 2,
//   estado         ENUM('esperando','en_curso','cancelada') NOT NULL DEFAULT 'esperando',
//   created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

//   CONSTRAINT fk_salas_creador
//     FOREIGN KEY (creador_id) REFERENCES users(id)
//     ON UPDATE CASCADE ON DELETE RESTRICT,
//   CONSTRAINT fk_salas_categoria
//     FOREIGN KEY (categoria_id) REFERENCES categorias(id)
//     ON UPDATE CASCADE ON DELETE SET NULL
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


import sequelize from "./sequelize.js";
import { DataTypes } from "sequelize";
import User from "./user.js";
import Categoria from "./categoria.js";



const Sala = sequelize.define("Sala", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,   
    primaryKey: true,
    autoIncrement: true,
  },
  codigo: {
    type: DataTypes.STRING(12),         
    allowNull: true,
    unique: true,
  },
  creador_id: {
    type: DataTypes.INTEGER.UNSIGNED,   
    allowNull: false,
  },
  categoria_id: {
    type: DataTypes.INTEGER.UNSIGNED,   
    allowNull: true,
  },
  max_jugadores: {
    type: DataTypes.TINYINT.UNSIGNED,   
    allowNull: false,
    defaultValue: 2,
    validate: {
      min: 2 
    }
  },
  estado: {
    type: DataTypes.ENUM("esperando", "en_curso", "cancelada"), // ENUM
    allowNull: false,
    defaultValue: "esperando",
  }
}, {
  tableName: "salas",
  timestamps: true,
  createdAt: "created_at",       // mapea createdAt → created_at
  updatedAt: false, 
});

Sala.belongsTo(Categoria, {
  foreignKey: "categoria_id",
  onUpdate: "CASCADE",
  onDelete: "SET NULL",
});

Sala.belongsToMany(User, {
  through: 'sala_jugadores',  
  foreignKey: 'sala_id',
  otherKey: 'usuario_id'
});


export default Sala;
