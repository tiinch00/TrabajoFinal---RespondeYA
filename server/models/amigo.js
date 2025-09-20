import sequelize from './sequelize.js';
import { DataTypes } from 'sequelize';



const Amigo = sequelize.define('Amigo', {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true, 
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  amigo_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    validate: {
      notSameAsUsuario(value) {
        if (value === this.usuario_id) {
          throw new Error('Usuario_id and amigo_id cannot be the same');
        }
      }
    }
  },
  aceptado_en: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'amigos',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: false,
  indexes: [
    { fields: ['usuario_id'] }, // idx_amigos_usuario
    { fields: ['amigo_id'] }   // idx_amigos_amigo
  ],
  uniqueKeys: {
    uc_amigos_par: {
      fields: ['usuario_id', 'amigo_id']
    }
  }
});

export default Amigo;