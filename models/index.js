const { sequelize } = require('../config/db');
const City = require('./City');
const User = require('./User');
const Space = require('./Space');
const SpaceImage = require('./SpaceImage');
const Booking = require('./Booking');
const Payment = require('./Payment');
const Review = require('./Review');
const Category = require('./Category');
const Subcategory = require('./Subcategory');

City.hasMany(User, { foreignKey: 'city_id' });
User.belongsTo(City, { foreignKey: 'city_id' });

User.hasMany(Space, { foreignKey: 'user_id' });
Space.belongsTo(User, { foreignKey: 'user_id' });
City.hasMany(Space, { foreignKey: 'city_id' });
Space.belongsTo(City, { foreignKey: 'city_id' });

Category.hasMany(Subcategory, { foreignKey: 'category_id', as: 'subcategories' });
Subcategory.belongsTo(Category, { foreignKey: 'category_id' });

Space.hasMany(SpaceImage, { foreignKey: 'space_id', as: 'images' });
SpaceImage.belongsTo(Space, { foreignKey: 'space_id' });

User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });
Space.hasMany(Booking, { foreignKey: 'space_id' });
Booking.belongsTo(Space, { foreignKey: 'space_id' });

Booking.hasOne(Payment, { foreignKey: 'booking_id' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });
Space.hasMany(Review, { foreignKey: 'space_id' });
Review.belongsTo(Space, { foreignKey: 'space_id' });
Booking.hasMany(Review, { foreignKey: 'booking_id' });
Review.belongsTo(Booking, { foreignKey: 'booking_id' });

module.exports = {
	sequelize,
	City,
	User,
	Space,
	SpaceImage,
	Booking,
	Payment,
	Review,
	Category,
	Subcategory
};
