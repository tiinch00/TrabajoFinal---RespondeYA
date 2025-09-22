import { DataTypes } from "sequelize";
import sequelize from "./sequelize.js";

const Administrador = sequelize.define("Administrador", {
  admin_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true, // ← 1:1 con users
    references: { model: "users", key: "id" },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  // campos específicos de admin...
}, {
  tableName: "administradores",
  timestamps: true,  
  underscored: true
});

export default Administrador;