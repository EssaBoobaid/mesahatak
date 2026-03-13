const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Category extends Model {}

Category.init(
  {
    code: { type: DataTypes.STRING(40), allowNull: false, unique: true },
    name_ar: { type: DataTypes.STRING(120), allowNull: false },
    name_en: { type: DataTypes.STRING(120), allowNull: false }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Category;
