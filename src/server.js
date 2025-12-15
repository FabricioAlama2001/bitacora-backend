require('dotenv').config();
const app = require('./app');
const { sequelize, testConnection } = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await testConnection();

        // 🔥 SOLO EN DEV: reset intencional
        if (process.env.RESET_DB === 'true') {
            console.log('⚠️ RESET_DB=true -> Borrando tablas y recreando...');
            await sequelize.sync({ force: true });
        } else {
            await sequelize.sync({ alter: true });
        }

        app.listen(PORT, () => {
            console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ No se pudo iniciar el servidor:', err);
    }
}

start();
