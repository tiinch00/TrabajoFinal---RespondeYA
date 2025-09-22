import { DataTypes } from "sequelize";
import sequelize from "./sequelize.js";

const UserAvatar = sequelize.define("UserAvatar", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  jugador_id: {
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
      fields: ["jugador_id", "avatar_id"], // evita duplicados
    },
  ],
});

export default UserAvatar;