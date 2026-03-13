const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class SpaceImage extends Model {}

SpaceImage.init(
  {
    space_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    file_path: { type: DataTypes.STRING(255), allowNull: false },
    sort_order: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 }
  },
  {
    sequelize,
    modelName: 'SpaceImage',
    tableName: 'space_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

module.exports = SpaceImage;
