const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Payment extends Model {}

Payment.init(
  {
    booking_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    payment_method: { type: DataTypes.STRING(50), allowNull: true },
    transaction_id: { type: DataTypes.STRING(120), allowNull: true },
    status: { type: DataTypes.ENUM('paid', 'failed'), allowNull: false, defaultValue: 'failed' }
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Payment;
