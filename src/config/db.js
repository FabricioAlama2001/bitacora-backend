// src/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: false, // pon true si quieres ver las queries
    }
);

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a Postgres OK');
    } catch (error) {
        console.error('❌ Error conectando a Postgres:', error);
        throw error;
    }
}

module.exports = { sequelize, testConnection };
