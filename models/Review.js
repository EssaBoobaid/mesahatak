const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Review extends Model {}

Review.init(
  {
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    space_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    booking_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    rating: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: true }
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Review;
