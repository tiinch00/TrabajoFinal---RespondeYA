import sequelize from "./sequelize.js";
import { DataTypes } from "sequelize";
import User from './user.js';

const Avatar = sequelize.define('Avatar',{
    id:{type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true},
    nombre:{ type: DataTypes.STRING(100),allowNull:false},
    division:{type: DataTypes.STRING(50),allowNull:false},
    precio_puntos:{type: DataTypes.INTEGER.UNSIGNED,allowNull:false},
    activo:{type: DataTypes.TINYINT,allowNull: false, defaultValue: 1},
    preview_url:{type: DataTypes.STRING(255), allowNull: true}
},{
    tableName: "avatares",
    timestamps: false 
})

Avatar.belongsToMany(User, {
  through: 'user_avatars',
  foreignKey: "avatar_id",
  otherKey: "usuario_id",
});


export default Avatar;