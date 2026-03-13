const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Subcategory extends Model {}

Subcategory.init(
  {
    category_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    value: { type: DataTypes.STRING(120), allowNull: false },
    name_ar: { type: DataTypes.STRING(120), allowNull: false },
    name_en: { type: DataTypes.STRING(120), allowNull: false }
  },
  {
    sequelize,
    modelName: 'Subcategory',
    tableName: 'subcategories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Subcategory;
