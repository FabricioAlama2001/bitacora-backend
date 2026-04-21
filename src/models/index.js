const User = require('./user.model');
const Ticket = require('./ticket.model');
const TicketWorklog = require('./ticketworklog.model');

Ticket.belongsTo(User, {
    foreignKey: 'createdById',
    as: 'createdBy',
});

User.hasMany(Ticket, {
    foreignKey: 'createdById',
    as: 'createdTickets',
});

TicketWorklog.belongsTo(User, {
    foreignKey: 'createdById',
    as: 'createdBy',
});

User.hasMany(TicketWorklog, {
    foreignKey: 'createdById',
    as: 'createdWorklogs',
});

TicketWorklog.belongsTo(Ticket, {
    foreignKey: 'ticketId',
    as: 'ticket',
});

Ticket.hasMany(TicketWorklog, {
    foreignKey: 'ticketId',
    as: 'worklogs',
});

module.exports = {
    User,
    Ticket,
    TicketWorklog,
};