// src/server.js
require('dotenv').config();
const app = require('./app');
const { sequelize, testConnection } = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await testConnection();
        await sequelize.sync({ alter: true }); // en desarrollo, crea/actualiza tablas
        app.listen(PORT, () => {
            console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ No se pudo iniciar el servidor:', err);
    }
}

start();
