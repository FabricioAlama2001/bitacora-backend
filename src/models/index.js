// src/models/index.js
const { sequelize } = require('../config/db');

const User = require('./user.model');
const Ticket = require('./ticket.model');
const TicketWorklog = require('./ticketworklog.model');

// User -> Ticket
User.hasMany(Ticket, { foreignKey: 'creadoPorId', as: 'ticketsCreados' });
Ticket.belongsTo(User, { foreignKey: 'creadoPorId', as: 'creadoPor' });

// Ticket -> Worklogs
Ticket.hasMany(TicketWorklog, { foreignKey: 'ticketId', as: 'worklogs', onDelete: 'CASCADE' });
TicketWorklog.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

// (Opcional pero recomendado) User -> Worklogs
User.hasMany(TicketWorklog, { foreignKey: 'creadoPorId', as: 'worklogsCreados' });
TicketWorklog.belongsTo(User, { foreignKey: 'creadoPorId', as: 'creadoPor' });

module.exports = {
    sequelize,
    User,
    Ticket,
    TicketWorklog,
};
