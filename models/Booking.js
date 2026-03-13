const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Booking extends Model {}

Booking.init(
  {
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    space_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending'
    }
  },
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Booking;
