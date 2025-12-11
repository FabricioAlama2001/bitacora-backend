// src/models/index.js
const { sequelize } = require('../config/db');
const User = require('./user.model');
const Ticket = require('./ticket.model');

// Asociaciones
User.hasMany(Ticket, {
    foreignKey: 'creadoPorId',
    as: 'ticketsCreados',
});
Ticket.belongsTo(User, {
    foreignKey: 'creadoPorId',
    as: 'creadoPor',
});

module.exports = {
    sequelize,
    User,
    Ticket,
};
