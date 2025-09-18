import Pregunta from "./pregunta";
import sequelize from "./sequelize";
import { DataTypes } from "sequelize";


const Opcion = sequelize.define('Opcion',{
    id:{
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true, 
    autoIncrement: true
    },
    pregunta_id:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    texto:{
        type: DataTypes.STRING(255),
        allowNull: false
    },
    es_correcta:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    } 
},
{ tableName: 'opciones',
  timestamps: false
 });


 Opcion.belongsTo(Pregunta, { foreignKey: 'pregunta_id' });

 export default Opcion;