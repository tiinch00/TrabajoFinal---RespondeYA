import sequelize from './sequelize.js'
import { DataTypes } from 'sequelize'
import User from './user.js'
import Pregunta from './pregunta.js'
import Sala from './sala.js'
import Categoria from './categoria.js'

const Partida = sequelize.define('Partida', {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },
  usuario_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: true 
  },
  sala_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: true,
    unique: true
  },
  categoria_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: true 
  },
  modo: { 
    type: DataTypes.ENUM('individual', 'multijugador'), 
    allowNull: false 
  },
  total_preguntas: { 
    type: DataTypes.TINYINT.UNSIGNED, 
    allowNull: false 
  },
  estado: { 
    type: DataTypes.ENUM('pendiente', 'en_curso', 'finalizada', 'abandonada'), 
    allowNull: false, 
    defaultValue: 'en_curso' 
  },
  started_at: { 
    type: DataTypes.DATETIME,
    allowNull: true 
  },
  ended_at: { 
    type: DataTypes.DATETIME,
    allowNull: true 
  }
}, {
  tableName: "partidas",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
})

Partida.belongsTo(User, { 
  foreignKey: 'usuario_id', 
  onUpdate: 'CASCADE', 
  onDelete: 'RESTRICT' 
})

// partida pertenece a una sala (modo multijugador, 1:1)
Partida.belongsTo(Sala, { 
  foreignKey: 'sala_id', 
  onUpdate: 'CASCADE', 
  onDelete: 'RESTRICT' 
});

// partida puede tener una categoría (opcional)
Partida.belongsTo(Categoria, { 
  foreignKey: 'categoria_id', 
  onUpdate: 'CASCADE', 
  onDelete: 'SET NULL' 
});

Partida.belongsToMany(Pregunta, {
  through: "partida_preguntas",
  foreignKey: "partida_id",
  otherKey: "pregunta_id"
});
export default Partida




// import User from './user.js'
// import Sala from './sala.js'
// import Categoria from './categoria.js'
// import Partida from './partida.js'

// // Partida pertenece a un usuario (dueño en modo individual)
// Partida.belongsTo(User, { foreignKey: 'usuario_id', onUpdate: 'CASCADE', onDelete: 'RESTRICT' })

// // Partida pertenece a una sala (modo multijugador)
// Partida.belongsTo(Sala, { foreignKey: 'sala_id', onUpdate: 'CASCADE', onDelete: 'RESTRICT' })

// // Partida puede tener una categoría (opcional)
// Partida.belongsTo(Categoria, { foreignKey: 'categoria_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' })



// CREATE TABLE partidas (
//   id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
//   usuario_id       INT UNSIGNED NULL,  -- dueño de la partida individual
//   sala_id          INT UNSIGNED NULL,  -- FK única si es multijugador (1:1 con salas)
//   categoria_id     INT UNSIGNED NULL,  -- si querés forzar 1 categoría en toda la partida
//   modo ENUM('individual','multijugador') NOT NULL,
//   total_preguntas  TINYINT UNSIGNED NOT NULL,
//   estado           ENUM('pendiente','en_curso','finalizada','abandonada') NOT NULL DEFAULT 'en_curso',
//   created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   started_at       DATETIME NULL,
//   ended_at         DATETIME NULL,

//   CONSTRAINT fk_partidas_usuario
//     FOREIGN KEY (usuario_id) REFERENCES users(id)
//     ON UPDATE CASCADE ON DELETE RESTRICT,

//   CONSTRAINT fk_partidas_sala
//     FOREIGN KEY (sala_id) REFERENCES salas(id)
//     ON UPDATE CASCADE ON DELETE RESTRICT,

//   CONSTRAINT fk_partidas_categoria
//     FOREIGN KEY (categoria_id) REFERENCES categorias(id)
//     ON UPDATE CASCADE ON DELETE SET NULL,

//   CONSTRAINT uc_partidas_sala UNIQUE (sala_id),  -- asegura 1:1 sala↔partida
//   CONSTRAINT chk_partidas_modo CHECK (
//     (modo = 'individual' AND usuario_id IS NOT NULL AND sala_id IS NULL)
//     OR
//     (modo = 'multijugador'     AND usuario_id IS NULL     AND sala_id IS NOT NULL)
//   )
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;