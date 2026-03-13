const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Space extends Model {}

Space.init(
  {
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    name: { type: DataTypes.STRING(180), allowNull: false },
    city_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    category: { type: DataTypes.STRING(40), allowNull: false },
    subcategory: { type: DataTypes.STRING(80), allowNull: false },
    category_other: { type: DataTypes.STRING(120), allowNull: true },
    google_maps_url: { type: DataTypes.STRING(255), allowNull: true },
    rental_type: { type: DataTypes.ENUM('daily', 'hourly', 'monthly', 'yearly'), allowNull: false, defaultValue: 'daily' },
    price_per_day: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    price_per_block: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    price_per_month: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    price_per_year: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    min_months: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
    min_years: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
    block_hours: { type: DataTypes.INTEGER, allowNull: true },
    work_start: { type: DataTypes.TIME, allowNull: true },
    work_end: { type: DataTypes.TIME, allowNull: true },
    availability_start: { type: DataTypes.DATEONLY, allowNull: true },
    availability_end: { type: DataTypes.DATEONLY, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false }
  },
  {
    sequelize,
    modelName: 'Space',
    tableName: 'spaces',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Space;
