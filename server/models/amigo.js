import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const Amigo = sequelize.define('Amigo', {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true, 
    autoIncrement: true
  },
  jugador_id: {
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
    { fields: ['jugador_id'] }, // idx_amigos_usuario
    { fields: ['amigo_id'] }   // idx_amigos_amigo
  ],
  uniqueKeys: {
    uc_amigos_par: {
      fields: ['jugador_id', 'amigo_id']
    }
  }
});

export default Amigo;