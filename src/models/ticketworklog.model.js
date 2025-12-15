const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TicketWorklog = sequelize.define(
    'TicketWorklog',
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

        ticketId: { type: DataTypes.INTEGER, allowNull: false },
        fecha: { type: DataTypes.DATEONLY, allowNull: false },
        horas: { type: DataTypes.DECIMAL(6, 2), allowNull: false },

        tipo: {
            type: DataTypes.ENUM('TRABAJO', 'DEVOLUCION'),
            allowNull: false,
            defaultValue: 'TRABAJO',
        },

        comentario: { type: DataTypes.TEXT, allowNull: true },
        creadoPorId: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        tableName: 'ticket_worklogs',
        timestamps: true,
    }
);

module.exports = TicketWorklog;
