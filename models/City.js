const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class City extends Model {}

City.init(
  {
    name: { type: DataTypes.STRING(150), allowNull: false }
  },
  {
    sequelize,
    modelName: 'City',
    tableName: 'cities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = City;
