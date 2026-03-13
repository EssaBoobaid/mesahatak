const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS, 
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            charset: 'utf8mb4',
            dateStrings: true,
            typeCast: true
        },
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci', 
            timestamps: true
        },
        // هذا هو الجزء السحري الذي يحل مشكلة علامات الاستفهام
        hooks: {
            beforeConnect: async (config) => {
                config.dialectOptions = {
                    ...config.dialectOptions,
                    charset: 'utf8mb4'
                };
            },
            afterConnect: (connection, config) => {
                // إجبار السيرفر على التحدث بالعربية فور الاتصال
                if (connection.query) {
                    connection.query('SET NAMES utf8mb4;');
                    connection.query('SET CHARACTER SET utf8mb4;');
                    connection.query('SET SESSION collation_connection = "utf8mb4_unicode_ci";');
                }
            }
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Connected Successfully with UTF8mb4 Support');
    } catch (error) {
        console.error('❌ Database Connection Error:', error.message);
    }
};

module.exports = { sequelize, connectDB };