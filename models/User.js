const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class User extends Model {}

User.init(
  {
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    birth_date: { type: DataTypes.DATEONLY, allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    iban: { type: DataTypes.STRING(34), allowNull: true },
    role: { type: DataTypes.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = User;
