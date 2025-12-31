// src/app.js
const express = require('express');
const cors = require('cors');

const authRoutes = require('./auth/auth.routes');
const userRoutes = require('./api/users/user.routes');
const ticketRoutes = require('./api/tickets/ticket.routes');

const { notFoundHandler } = require('./middlewares/notFound.middleware');
const { errorHandler } = require('./middlewares/error.middleware');
const kpisRoutes = require('./api/kpis/kpis.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas (por ahora estarán “vacías” pero deben existir los archivos)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/kpis', kpisRoutes);


// 404 y manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
