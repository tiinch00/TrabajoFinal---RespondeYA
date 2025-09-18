
// -- Inventario del usuario (qué avatares posee)
// CREATE TABLE user_avatars (
//   id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
//   usuario_id   INT UNSIGNED NOT NULL,
//   avatar_id    INT UNSIGNED NOT NULL,
//   origen       ENUM('compra','recompensa','admin') NOT NULL DEFAULT 'compra',
//   adquirido_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

//   CONSTRAINT fk_ua_usuario
//     FOREIGN KEY (usuario_id) REFERENCES users(id)
//     ON UPDATE CASCADE ON DELETE CASCADE,

//   CONSTRAINT fk_ua_avatar
//     FOREIGN KEY (avatar_id)  REFERENCES avatares(id)
//     ON UPDATE CASCADE ON DELETE RESTRICT,

//   CONSTRAINT uc_ua_unico UNIQUE (usuario_id, avatar_id) -- evita comprar el mismo avatar dos veces
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
import sequelize from "./sequelize.js";
import { DataTypes } from "sequelize";


const UserAvatar = sequelize.define("UserAvatar", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  avatar_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  origen: {
    type: DataTypes.ENUM("compra", "recompensa", "admin"),
    allowNull: false,
    defaultValue: "compra",
  },
  adquirido_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "user_avatars",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ["usuario_id", "avatar_id"], // evita duplicados
    },
  ],
});

export default ModelName;