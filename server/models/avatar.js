import { DataTypes } from "sequelize";
import sequelize from "./sequelize.js";

const Avatar = sequelize.define('Avatar', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true},
    admin_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false},
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    division: { type: DataTypes.STRING(50), allowNull: false },
    precio_puntos: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    activo: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    preview_url: { type: DataTypes.STRING(255), allowNull: true }
}, {
    tableName: "avatares",
    timestamps: false
})



export default Avatar;